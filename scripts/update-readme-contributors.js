#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * update-readme-contributors.js
 *
 * Regenerates the contributor section of README.md from:
 *   1. The GitHub Contributors API   → profile photos, real names, GitHub IDs
 *   2. Local git log                 → commit counts (always accurate, bot commits excluded)
 *   3. Merge-commit scan             → merged PR numbers
 *   4. Curated FALLBACK_PROFILES     → top features list per contributor
 *
 * Marker blocks in README.md (all are bot-managed, nothing is static):
 *   <!-- live-at-a-glance:start --> ... <!-- live-at-a-glance:end -->
 *   <!-- live-snapshot:start -->    ... <!-- live-snapshot:end -->
 *   <!-- live-rank:start -->        ... <!-- live-rank:end -->
 *   <!-- live-cards:start -->       ... <!-- live-cards:end -->
 *
 * The script is idempotent — running it twice produces the same file.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_... node scripts/update-readme-contributors.js
 *   node scripts/update-readme-contributors.js --dry-run
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

// Canonical upstream — the README bot pulls contributor data from here
const REPO = process.env.TENALI_REPO || 'vicharanashala/tenali';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const README = path.resolve(PROJECT_ROOT, 'README.md');
const CONTRIBUTORS = path.resolve(PROJECT_ROOT, 'CONTRIBUTORS.md');
const CHANGELOG = path.resolve(PROJECT_ROOT, 'CHANGELOG.md');
const DRY_RUN = process.argv.includes('--dry-run');

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

// ─── helpers ────────────────────────────────────────────────────────────────

function log(...args) { console.log('[readme-bot]', ...args); }

function sh(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: PROJECT_ROOT,
    }).trim();
  } catch (_e) {
    return '';
  }
}

function ghFetch(urlPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: urlPath,
      method: 'GET',
      headers: {
        'User-Agent': 'tenali-readme-bot',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else if (res.statusCode === 403 || res.statusCode === 429) {
          log(`⚠ rate-limited (${res.statusCode}) on ${urlPath} — falling back`);
          resolve(null);
        } else {
          reject(new Error(`GitHub API ${res.statusCode} for ${urlPath}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Strip null / empty values from an API response so they don't override fallback data
function stripEmpty(obj) {
  if (!obj || typeof obj !== 'object') return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
}

// ─── bot filtering ──────────────────────────────────────────────────────────
// Commits made by automated bots (e.g. `github-actions[bot]` pushing its own
// README refresh, Dependabot, GitHub's web editor) are excluded from the
// leaderboard and CHANGELOG so human contributor stats stay accurate.
// Without this filter, the bot keeps inflating its own commit count every time
// it runs (every push + every 12h cron = ~2 self-commits/day).
//
// A commit is considered bot-authored if EITHER:
//   - its git author name matches a known bot name, OR
//   - its git author email matches GitHub's bot noreply pattern
//     (`[bot]@users.noreply.github.com`, e.g. `41898282+github-actions[bot]@…`)
const BOT_AUTHOR_NAMES = new Set([
  'github-actions[bot]',
  'github-actions-bot',
  'dependabot[bot]',
  'dependabot-preview[bot]',
  'dependabot',
  'web-flow',
]);

const BOT_EMAIL_PATTERN = /\[bot\]@users\.noreply\.github\.com$/i;

function isBotAuthor(name, email) {
  if (name && BOT_AUTHOR_NAMES.has(name)) return true;
  if (email && BOT_EMAIL_PATTERN.test(email)) return true;
  return false;
}

// ─── data gathering ─────────────────────────────────────────────────────────

function gatherGitLog() {
  // Pre-pass: collect SHAs of every bot-authored commit so we can filter them
  // out of every downstream stream (per-author counts, CHANGELOG, file stats).
  // Single `git log` call — we get sha + name + email together.
  const botShas = new Set();
  const botAuthorNamesSeen = new Set();
  sh(`git log --pretty=format:"%H|%an|%ae"`).split('\n').forEach((line) => {
    if (!line) return;
    const [sha, name, email] = line.split('|');
    if (isBotAuthor(name, email)) {
      botShas.add(sha);
      botAuthorNamesSeen.add(name);
    }
  });
  if (botAuthorNamesSeen.size > 0) {
    log(`  ⊘ filtering ${botShas.size} bot commit(s) from leaderboard (authors: ${[...botAuthorNamesSeen].join(', ')})`);
  }

  // Helper: returns true for commit SHAs we want to keep (i.e. NOT a bot).
  const keep = (sha) => !botShas.has(sha);

  // Total commit count — derived from the same stream so it stays in sync
  // with the filtered per-author map below (no more double-counting bot runs).
  const total = sh(`git log --pretty=format:"%H|%an|%ae"`)
    .split('\n').filter(Boolean)
    .filter((line) => keep(line.split('|')[0])).length;

  // Unique author count — based on the bot-filtered stream.
  const uniqueEmails = new Set();
  sh(`git log --pretty=format:"%H|%an|%ae"`).split('\n').forEach((line) => {
    if (!line) return;
    const [sha, , email] = line.split('|');
    if (keep(sha)) uniqueEmails.add(email);
  });
  const authorCount = uniqueEmails.size;

  // Commits per author (by name as it appears in git log)
  // Emails are NOT collected — kept private, never rendered in the README.
  const byAuthor = {};
  sh(`git log --pretty=format:"%an|%ae|%H"`).split('\n').forEach((line) => {
    if (!line) return;
    const [name, , sha] = line.split('|');
    if (!keep(sha)) return;
    byAuthor[name] = (byAuthor[name] || 0) + 1;
  });

  // PRs per author (parsed from "Merge pull request #N from <user>/<branch>")
  const prsByAuthor = {};
  const allPRs = new Set();
  sh(`git log --merges --pretty=format:"%s"`).split('\n').forEach((msg) => {
    const m = msg.match(/Merge pull request #(\d+) from ([^/]+)\//);
    if (!m) return;
    const [, num, user] = m;
    allPRs.add(num);
    prsByAuthor[user] = prsByAuthor[user] || new Set();
    prsByAuthor[user].add(num);
  });

  // Full commit list — used to power the auto-generated CHANGELOG.md
  // Two parallel streams:
  //   1. Metadata per commit: sha, shortSha, author, date, subject
  //   2. File stats per commit: which files were touched, +/− line counts
  // These are joined by sha so each commit object carries its full stats.
  // Bot commits are skipped so the CHANGELOG only shows human activity.
  const commits = sh(`git log --pretty=format:"%H|%h|%an|%ae|%ad|%s" --date=short`)
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, shortSha, author, email, date, ...rest] = line.split('|');
      return {
        sha,
        shortSha,
        author,
        // Email is intentionally stripped from the rendered output
        email,
        date,
        subject: rest.join('|'),
        filesChanged: [],
        insertions: 0,
        deletions: 0,
      };
    })
    .filter((c) => keep(c.sha));

  // Per-commit file stats via `git log --numstat`.
  // Output format:
  //   COMMIT:<full-sha>
  //   <added>\t<removed>\t<file>
  //   <added>\t<removed>\t<file>
  //   ...
  //   COMMIT:<full-sha>
  // We walk the stream once and bucket lines per commit.
  const statBySha = {};
  let currentSha = null;
  const numstatOutput = sh(`git log --pretty=format:"COMMIT:%H" --numstat --no-merges`);
  for (const rawLine of numstatOutput.split('\n')) {
    if (rawLine.startsWith('COMMIT:')) {
      currentSha = rawLine.slice('COMMIT:'.length).trim();
      // Skip stat collection for bot-authored commits
      if (currentSha && keep(currentSha) && !statBySha[currentSha]) {
        statBySha[currentSha] = { files: [], add: 0, del: 0 };
      } else {
        currentSha = null; // signal to skip subsequent file lines
      }
      continue;
    }
    if (!currentSha || !rawLine.trim()) continue;
    const [add, del, file] = rawLine.split('\t');
    const a = parseInt(add, 10);
    const d = parseInt(del, 10);
    if (Number.isNaN(a) || Number.isNaN(d)) continue; // binary files show "-\t-\t"
    if (!statBySha[currentSha]) continue;
    statBySha[currentSha].files.push({ file, additions: a, deletions: d });
    statBySha[currentSha].add += a;
    statBySha[currentSha].del += d;
  }

  // Merge stats into commit objects
  for (const c of commits) {
    const s = statBySha[c.sha];
    if (s) {
      c.filesChanged = s.files;
      c.insertions = s.add;
      c.deletions = s.del;
    }
  }

  // Capture commit body (multi-line message after the subject) — used as a
  // quoted block under each commit so the "why" is preserved alongside the "what".
  // Format from `git log`: subject on first line, body on subsequent lines.
  const bodyBySha = {};
  let bodySha = null;
  const bodyBuffer = [];
  const bodyOutput = sh(`git log --pretty=format:"COMMIT:%H%nSUBJECT:%s" --date=short`);
  for (const rawLine of bodyOutput.split('\n')) {
    if (rawLine.startsWith('COMMIT:')) {
      if (bodySha && bodyBuffer.length > 0) {
        bodyBySha[bodySha] = bodyBuffer.join('\n').trim();
      }
      bodySha = rawLine.slice('COMMIT:'.length).trim();
      bodyBuffer.length = 0;
      continue;
    }
    if (rawLine.startsWith('SUBJECT:')) continue;
    if (rawLine.trim()) bodyBuffer.push(rawLine);
  }
  if (bodySha && bodyBuffer.length > 0) {
    bodyBySha[bodySha] = bodyBuffer.join('\n').trim();
  }

  // Attach bodies to commits
  for (const c of commits) {
    if (bodyBySha[c.sha]) c.body = bodyBySha[c.sha];
  }

  return {
    totalCommits: total,
    uniqueAuthors: authorCount,
    commitsByName: byAuthor,
    prsByUser: Object.fromEntries(
      Object.entries(prsByAuthor).map(([k, v]) => [k, v.size])
    ),
    totalPRs: allPRs.size,
    allPRNumbers: [...allPRs].sort((a, b) => +a - +b),
    commits,
  };
}

async function fetchContributors() {
  log('Fetching contributors from GitHub API…');
  const contributors = [];
  for (let page = 1; page <= 5; page++) {
    const list = await ghFetch(
      `/repos/${REPO}/contributors?per_page=100&page=${page}&anon=false`
    );
    if (!list || !Array.isArray(list) || list.length === 0) break;
    for (const c of list) {
      contributors.push({
        login: c.login,
        avatar: c.avatar_url,
        contributions: c.contributions,
        html_url: c.html_url,
      });
    }
    if (list.length < 100) break;
  }

  // Enrich with real name + bio + location via /users/{login}
  const enriched = await Promise.all(
    contributors.map(async (c) => {
      const profile = await ghFetch(`/users/${c.login}`);
      return {
        ...c,
        name: profile?.name || c.login,
        bio: profile?.bio || '',
        location: profile?.location || '',
        blog: profile?.blog || '',
        twitter: profile?.twitter_username || '',
        followers: profile?.followers || 0,
        public_repos: profile?.public_repos || 0,
      };
    })
  );

  // Fetch repo-level stats (stars, forks, watchers, open issues)
  // — these power the bot-managed at-a-glance table so they're never stale.
  let repoStats = { stars: 0, forks: 0, watchers: 0, openIssues: 0 };
  const repo = await ghFetch(`/repos/${REPO}`);
  if (repo) {
    repoStats = {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      watchers: repo.subscribers_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
    };
    log(`  → repo stats: ⭐ ${repoStats.stars} stars · 🍴 ${repoStats.forks} forks · 👀 ${repoStats.watchers} watchers · 🐛 ${repoStats.openIssues} open issues`);
  }

  return { contributors: enriched, repoStats };
}

// Curated fallback profiles — used when GitHub API is rate-limited or for
// contributors not on GitHub. Each profile carries the "top features" list
// that drives the bot-generated contributor cards section.
//
// Schema:
//   {
//     name, git?,        // display name + original git author name (if different)
//     avatar,            // profile image URL (always 120px in render)
//     color,             // accent color for the avatar ring
//     location?, blog?, twitter?,
//     role,              // one-line summary (used in leaderboard + card title)
//     topFeatures: [     // bullet list rendered in the card body
//       { icon: '⚔️', text: '...' },
//       ...
//     ],
//   }
const FALLBACK_PROFILES = {
  sudarshansudarshan: {
    name: 'S. R. S. Iyengar',
    git: 'Sudarshan',
    avatar: 'https://avatars.githubusercontent.com/u/12417057?v=4',
    location: 'Rupnagar, Punjab',
    bio: 'Scientist/Teacher',
    blog: 'http://www.sudarshaniyengar.com',
    color: '#FFD93D',
    descriptor: 'Lead Architect · Curriculum Author · 69 puzzle families',
    topFeatures: [
      { icon: '🧠', text: '<b>Adaptive difficulty core</b> — <code>adaptScore</code> → band mapping drives every <code>*api/question</code>' },
      { icon: '🌉', text: '<b>Prerequisite bridges</b> — Lessons 1–27 (arithmetic → fractions → standard form), Chapter 5 fully bridged' },
      { icon: '🎯', text: '<b>Puzzle families shipped: 69+</b> — including Trig, Inequalities, Coord Geom, Probability, Statistics, Matrices, Vectors, Transformations, Mensuration, Bearings, Logarithms, Differentiation, Number Bases, Circle Theorems, Sets, Sequences, Ratio, Percentages, Surds, Indices, Integration, Standard Form, Bounds, SDT, Variation, HCF/LCM, Profit/Loss, Rounding, Binomial, Complex Numbers, Fractions, Dot Products, Angles, Triangles, Congruence, Pythagoras, Polygons, Similarity' },
      { icon: '🍕', text: '<b>Idli-Vada-Sambhar LCM game</b> — gamified multiples/LCM with <code>LcmHcfApp</code>' },
      { icon: '📊', text: '<b>Tables mastery routes</b> — <code>/taittiriya</code>, <code>/tatsavit</code> (interactive line-fitter), <code>/supertables</code>, <code>/supertables1</code> (2-phase speed drill), <code>/yazdan</code>, <code>/jatin</code>, <code>/lakshya</code> (spaced repetition)' },
      { icon: '🎓', text: '<b>IGCSE 0606 Add Math bank</b> — <code>/riya</code> with 65 MCQs across 14 topics, keyboard navigation (arrows/Enter/A-D/1-4)' },
      { icon: '🎲', text: '<b>Random Mix & Custom Lesson</b> — adaptive cross-topic quiz with progressive difficulty, accessible from hamburger menu' },
      { icon: '📚', text: '<b>Vocab Builder</b> — forward + reverse vocab quiz, dedup logic, expanded to ~4000 questions' },
      { icon: '🎯', text: '<b>Spot It (Twin Hunt)</b> — find the common object in two panels' },
      { icon: '➗', text: '<b>Standard Form & Percentage bridges</b> — ×÷ in scientific notation, multiplier method, reverse %, success %, successive %' },
      { icon: '🔢', text: '<b>Extended Euclidean</b> — BigInt support for 20+ digit numbers, wider inputs, proper subscripts' },
      { icon: '⌨️', text: '<b>Keyboard shortcuts</b> — 1-4 / a-d for MCQs, Enter to advance, on-screen numeric keypad' },
      { icon: '🧮', text: '<b>In-memory auth fallback</b> — <code>inMemoryUsers</code> when MongoDB is unavailable' },
      { icon: '🎨', text: '<b>UI overhaul</b> — dark/light theme, responsive grid, uniform badges, Tenali Raman mascot on landing page' },
      { icon: '📜', text: '<b>All 37 SKILL.md</b> updated to comprehensive formal specifications' },
    ],
  },
  muditagrawal2007: {
    name: 'Mudit Agrawal',
    avatar: 'https://avatars.githubusercontent.com/u/228782706?v=4',
    color: '#C0C0C0',
    descriptor: 'Maintainer · Battle Arena · Linear Algebra · Sudoku · Playground',
    topFeatures: [
      { icon: '⚔️', text: '<b>Battle Arena (<code>BattleApp.jsx</code>)</b> — live fastest-finger duels via Socket.IO' },
      { icon: '🧮', text: '<b>Linear Algebra overhaul</b> — curated JSON MCQs for all <b>56 missions × 6 modules</b>' },
      { icon: '🔢', text: '<b>Sudoku (<code>SudokuApp.jsx</code>)</b> — 9×9 puzzle generator, validator, and player UI' },
      { icon: '💻', text: '<b>Code Playground</b> — run code in <b>50+ languages</b> via Judge0 CE, plus Python-Tutor-style visualizer with code + arrow + memory boxes' },
      { icon: '🎨', text: '<b>Playground live preview</b> — HTML/CSS/JS live preview, dark terminal output, language categories, history with View Code / Load buttons' },
      { icon: '🛡️', text: '<b>Proctoring suite</b> — Dashboard, FloatingVideo, Picture-in-Picture, face-api.js + CompreFace Docker setup, speech-to-text transcripts' },
      { icon: '🧠', text: '<b>Math Riddles</b> — 48 riddles (find-rule, sequence, logic, image) + <code>/riddle</code> pathname route' },
      { icon: '🐛', text: '<b>React hook violation fixes</b> — UI stability across the main <code>App</code> component' },
      { icon: '🔀', text: '<b>Merge integration</b> — merged <code>vicharanashala/main</code> 5× to keep the fork in sync' },
      { icon: '🛡️', text: '<b>Admin-only Proctor endpoints</b> — secured <code>/api/proctor/*</code> with <code>requireAdmin</code>' },
      { icon: '🧹', text: '<b>Component-wide lint fixes</b> — 20+ components cleaned up across the codebase' },
      { icon: '📦', text: '<b>PRs merged:</b> #10, #19, #39, #41, #44, #48, #81, #84' },
    ],
  },
  'varshini-nandula': {
    name: 'Lakshmi Varshini Nandula',
    avatar: 'https://avatars.githubusercontent.com/u/174730796?v=4',
    color: '#CD7F32',
    descriptor: 'Profile Showcase & Offline Storage',
    topFeatures: [
      { icon: '🏅', text: '<b>Profile Achievement Showcase (PR #59)</b> — badge cabinet, category dropdown, circular close buttons' },
      { icon: '📦', text: '<b>Scalable MongoDB collections</b> — <code>UserStats</code>, <code>UserMilestone</code>, <code>UserTopicProgress</code>, <code>UserCollectionProgress</code>' },
      { icon: '💾', text: '<b>Persistent JSON fallback DB</b> — offline mode that survives MongoDB outages + <code>StudentAttemptLog</code>' },
      { icon: '🎉', text: '<b>Celebration queue</b> — real-time badge-unlock + celebration modal logic' },
      { icon: '🥇', text: '<b>15-day streak milestone badge</b> — new badge type + image asset' },
      { icon: '🗂️', text: '<b>Category-priority sorting</b> — badges sorted by domain in the showcase' },
      { icon: '🔗', text: '<b>Profile ↔ URL mode sync</b> — deep-link to specific profile topics' },
      { icon: '🛠️', text: '<b>Crash fixes</b> — restored <code>tenaliIncrementSolved</code>, <code>showAbout</code>, <code>menuOpen</code>, <code>search</code>, resolved duplicate identifiers in <code>App.jsx</code>' },
    ],
  },
  'jgupta05072003-code': {
    name: 'Jinal Gupta',
    git: 'J. Gupta',
    avatar: 'https://avatars.githubusercontent.com/u/267273120?v=4',
    color: '#4D96FF',
    descriptor: 'Upstream Repo Maintainer & PR Reviewer',
    topFeatures: [
      { icon: '🔍', text: '<b>Reviewed and merged 30+ PRs</b> into <code>vicharanashala/tenali</code>' },
      { icon: '🔧', text: '<b>Hardened JWT auth</b> — centralized JWT_SECRET, removed duplicate declarations (#96)' },
      { icon: '🛡️', text: '<b>Rate limiting + CORS allowlist</b> — added <code>express-rate-limit</code> + origin allowlist (#85)' },
      { icon: '🧹', text: '<b>Repo cleanup</b> — removed committed debug/scratch files (#83)' },
      { icon: '🌱', text: '<b>Seed users via env</b> — refactored <code>auth.js</code> so credentials come from <code>TENALI_SEED_USERS</code> (#82)' },
      { icon: '🛣️', text: '<b>Base-path-aware routing</b> — fixed <code>/summership</code> sub-paths (#80)' },
      { icon: '📦', text: '<b>Missing dependencies</b> — chart.js (#79), mafs (#75), removed UTF-8 BOM from <code>App.css</code> (#63), unified module theming (#65)' },
      { icon: '🏠', text: '<b>Restored Journey banner</b> (#76) + <b>AuthGate home button</b> (#78) + <b>Linear Algebra API base</b> (#40)' },
    ],
  },
  '24F3005086': {
    name: 'Sameer Mishra',
    avatar: 'https://avatars.githubusercontent.com/u/189242179?v=4',
    color: '#6BCB77',
    descriptor: 'i18n · Accessibility · Concept Labs',
    topFeatures: [
      { icon: '🌍', text: '<b>Internationalization (PR #51)</b> — full i18n framework, locales directory, translation layer' },
      { icon: '♿', text: '<b>Accessibility panel (PR #50)</b> — high-contrast toggle, reduced motion, keyboard nav, ARIA roles' },
      { icon: '🧪', text: '<b>Concept Playgrounds (PR #52)</b> — multi-stage concept mastery labs' },
      { icon: '🧠', text: '<b>BKT Prerequisites (PR #49)</b> — Bayesian Knowledge Tracing + <code>bkt.js</code> library' },
      { icon: '🎨', text: '<b>Dark/light theme system</b> — coherent theming across IdliVadaSambhar, Crossword, Word Search' },
      { icon: '🧹', text: '<b>ESLint cleanup</b> — removed unused vars, suppressed <code>react-refresh</code> warnings' },
      { icon: '🧩', text: '<b>MasteryBadge integration</b> — wired <code>updateBKT</code> stub into concept playgrounds' },
      { icon: '🐛', text: '<b>Bugfix sweeps</b> — translation, dark/light, mastery-badge, concept-playgrounds localization' },
    ],
  },
  'Vaibhav-sa30': {
    name: 'Vaibhav Satish',
    avatar: 'https://avatars.githubusercontent.com/u/86743451?v=4',
    color: '#FF6B6B',
    location: 'India',
    twitter: 'vee42O',
    descriptor: 'Vachana Literacy Lab & Vocabulary',
    topFeatures: [
      { icon: '🆕', text: '<b>Vachana Mathematical Literacy Lab (PR #18)</b> — standalone literacy module with grid dashboard, 8+ exercises across v0.1.x' },
      { icon: '🔤', text: '<b>Notation Literacy Exercise (PR #57)</b> — teaches math notation & root decoding with etymology references' },
      { icon: '🔍', text: '<b>Vocabulary Explorer</b> — adaptive placement check, MCQ auto-submit, guided exploration' },
      { icon: '🧭', text: '<b>Vocab Quiz UX</b> — numeric shortcuts, color-coded feedback, manual submit, previous-question navigation' },
      { icon: '🪟', text: '<b>History view fix</b> — placement-test state overlap fix + previous button' },
      { icon: '♻️', text: '<b>Modularization</b> — split Vachana Literacy Lab into separate component files' },
      { icon: '📚', text: '<b>Exercise research docs</b> — pedagogical references + CHANGELOG entries for every v0.1.x release' },
    ],
  },
  'diptosubhro-ctrl': {
    name: 'Diptosubhro Datta',
    avatar: 'https://avatars.githubusercontent.com/u/248255769?v=4',
    color: '#9B59B6',
    location: 'COOCH BEHAR',
    descriptor: 'Tutorial System + Noise Filter Refactor',
    topFeatures: [
      { icon: '🆕', text: '<b>Tenali Main overhaul (PR #58)</b> — full UI standardization, premium dark theme, module layout improvements' },
      { icon: '🧹', text: '<b>Noise Filter refactor</b> — cleaned up level boundaries, removed subject intros, shortened Level 1 questions' },
      { icon: '🔄', text: '<b>Reset Progress UX</b> — moved Reset button inside each level card, kept tutorial reference for Level 1' },
      { icon: '🪜', text: '<b>Tutorial Reference modal</b> — popout button + overlay for levels above 1' },
      { icon: '🗑️', text: '<b>UI cleanup</b> — removed Key Math Fact box, strand tag labels, Reveal Noise Phrase button' },
      { icon: '🧭', text: '<b>Stages sub-view</b> — direct start after Level 1, dedicated sub-view with back navigation' },
      { icon: '🛠️', text: '<b>Merge conflict resolutions</b> — multiple upstream merges with clean App.jsx reconciliation' },
    ],
  },
  'Ritish007-svg': {
    name: 'Ritish Karmakar',
    avatar: 'https://avatars.githubusercontent.com/u/214147769?v=4',
    color: '#E67E22',
    descriptor: 'Percentages Level-wise Explanation',
    topFeatures: [
      { icon: '📈', text: '<b>Level-wise Percentages (PR #9)</b> — diagnostic quiz for Percentages with kid-friendly UI' },
      { icon: '🪜', text: '<b>Percentages Level 1 (Find)</b> — first explanation level with hover info popups, boxed theory cards, mobile-responsive fixes' },
      { icon: '🎴', text: '<b>One-card-at-a-time layout</b> — refactored Percentages workspace + fixed <code>AudioContext</code> singleton' },
      { icon: '📜', text: '<b>CHANGELOG</b> — Version 1 → 4 detailed notes for Percentages redesign' },
      { icon: '🎨', text: '<b>UI & styling polish</b> — theme-consistent cards and progress indicators' },
      { icon: '🔁', text: '<b>Restore feature work</b> — recovered work lost during upstream merges' },
    ],
  },
  KCDharshan9: {
    name: 'K C Dharshan',
    avatar: 'https://avatars.githubusercontent.com/u/196636372?v=4',
    color: '#1ABC9C',
    location: 'India',
    descriptor: 'Tap-to-Define Word Glossary',
    topFeatures: [
      { icon: '📖', text: '<b>Tap-to-Define Word Glossary (PR #20)</b> — Word Explorer + enriched definition popovers with SVG visuals' },
      { icon: '🆕', text: '<b>Learn These Words pre-quiz (Feature AQ)</b> — vocab warmup section' },
      { icon: '🛠️', text: '<b>Bugs sweep</b> — submit button in addition app, version/build date behind hamburger, alignment/SVG issues' },
      { icon: '🔀', text: '<b>5× merge conflict resolutions</b> — clean upstream merges' },
      { icon: '🧹', text: '<b>Cleanup</b> — removed PowerShell scripts, ignored internal docs, restored Vite proxy config' },
      { icon: '📦', text: '<b>Datasets</b> — added new vocabulary & question data files + updated server dependencies' },
    ],
  },
  ahana4banerjee: {
    name: 'Ahana Banerjee',
    avatar: 'https://avatars.githubusercontent.com/u/166562662?v=4',
    color: '#E91E63',
    location: 'Hyderabad, India',
    descriptor: 'Goal Practice & Learning Journey',
    topFeatures: [
      { icon: '📚', text: '<b>Goal-based Practice Sessions (PR #11)</b> — isolated goal-practice module that hides "standard mode" pills' },
      { icon: '🧠', text: '<b>Learning Intelligence Layer (LIL)</b> — architected LIL with cross-app goal-practice integration' },
      { icon: '🪜', text: '<b>AL Learning Checkpoints (PR #34)</b> — sequential unlock rules with <b>15-question topic checkpoints</b>' },
      { icon: '🎯', text: '<b>Targeted concept revision loop</b> — automatically revisits weak concepts' },
      { icon: '🎉', text: '<b>Confetti animations</b> — checkpoint completion celebrations' },
      { icon: '🚫', text: '<b>Block successive topics</b> — locked topics until the previous is mastered' },
      { icon: '🛡️', text: '<b>"Oh no, it\'s okay"</b> — replaced harsh wrong-answer copy with kid-friendly wording' },
      { icon: '🔀', text: '<b>6× merge conflict resolutions</b> — clean upstream merges for both feature branches' },
    ],
  },
  Shubhdix9: {
    name: 'Shubh Dixit',
    avatar: 'https://avatars.githubusercontent.com/u/212879841?v=4',
    color: '#34495E',
    location: 'Jaipur',
    descriptor: 'Premium UI Suite + Word Games',
    topFeatures: [
      { icon: '🏆', text: '<b>Premium Core Educational Suite (PR #53)</b> — UI standardization, premium dark theme, module layout improvements' },
      { icon: '➕', text: '<b>Addition crash fix</b> — fixed ReferenceError for <code>setIsGoalMode</code> and removed extra modes' },
      { icon: '🔤', text: '<b>Crossword + Word Search</b> — organic crossword + premium word search games' },
      { icon: '⚡', text: '<b>Instant question transitions</b> — perf: visual counting caps + question transitions' },
      { icon: '🧭', text: '<b>Visual Learning Universe</b> — title size fix + Guide/UI tweaks' },
      { icon: '🖼️', text: '<b>Lucide-react icons</b> — replaced emojis with standard icon library' },
      { icon: '🧹', text: '<b>Removed unused scripts</b> + addition/mensuration/coord-geom from hamburger menu' },
      { icon: '🔀', text: '<b>Merge conflict resolutions</b> — multiple upstream merges with syntax-error fixes' },
    ],
  },
  'sharonyamita-spec': {
    name: 'Sharonya Banerjee',
    git: 'Sharonya Banerjee',
    avatar: 'https://avatars.githubusercontent.com/u/261205962?v=4',
    color: '#16A085',
    note: 'SemiColonSlayer',
    descriptor: 'Math Detective Agency',
    topFeatures: [
      { icon: '🕵️', text: '<b>Math Detective Agency (PR #54)</b> — story-based mystery math cases with chained clue progression' },
      { icon: '🪪', text: '<b>Badge detail modal</b> — CSS for badge detail modal in <code>App.css</code>' },
      { icon: '🔀', text: '<b>3× merge conflict resolutions</b> — clean upstream merges keeping the detective CSS as base' },
      { icon: '🆕', text: '<b>Hundreds of procedurally generated mysteries</b> unlocked via Detective module' },
    ],
  },
  poorvipravallika06: {
    name: 'Pandraju Poorvi Pravallika',
    avatar: 'https://avatars.githubusercontent.com/u/207549779?v=4',
    color: '#F39C12',
    descriptor: 'HCF/LCM Interactive Module',
    topFeatures: [
      { icon: '🍕', text: '<b>Interactive LCM & HCF (PR #12)</b> — dynamic quiz with stepper locks, validation popups, accordion examples, mistake redirection' },
      { icon: '🎯', text: '<b>Confidence meter</b> — confidence-based quiz progression with sequential redirection' },
      { icon: '🏆', text: '<b>Progressive gamified levels</b> — tiered HCF/LCM levels with retry flow' },
      { icon: '🎨', text: '<b>Visual polish</b> — refined HCF Venn circle padding, capped LCM jump height' },
      { icon: '🧹', text: '<b>ESLint cleanup</b> — removed unused vars in <code>LcmHcfApp.jsx</code>' },
    ],
  },
  RukmenderT: {
    name: 'Rukmender T',
    avatar: 'https://avatars.githubusercontent.com/u/206398340?v=4',
    color: '#8E44AD',
    descriptor: 'Curiosity Mode',
    topFeatures: [
      { icon: '🤔', text: '<b>Curiosity Mode (PR #56)</b> — variation discovery puzzles that explore "what if" scenarios' },
      { icon: '🪟', text: '<b>Hamburger menu integration</b> — restored Curiosity Mode after upstream merges' },
      { icon: '🛠️', text: '<b>Merge conflict resolutions</b> — clean upstream syncs' },
      { icon: '🧹', text: '<b>UI cleanup</b> — removed duplicate hover tooltip + left-side variation label' },
    ],
  },
  'KrishnaG-101': {
    name: 'Krishna Gelra',
    avatar: 'https://avatars.githubusercontent.com/u/155518412?v=4',
    color: '#27AE60',
    descriptor: 'Language Puzzles Framework',
    topFeatures: [
      { icon: '🧩', text: '<b>Modular Language Puzzles framework (PR #35)</b> — pluggable architecture for word/letter puzzles' },
      { icon: '🆕', text: '<b>Word Creator</b> — fill-in-the-blanks to create new words' },
      { icon: '⚡', text: '<b>Latency optimization</b> — reduced <code>wordCreator</code> verification time' },
      { icon: '🔀', text: '<b>Merge conflict resolution</b> — clean upstream merge' },
    ],
  },
  'S-Hamsalekha-annamai': {
    name: 'S. Hamsalekha',
    avatar: 'https://avatars.githubusercontent.com/u/247533500?v=4',
    color: '#2C3E50',
    descriptor: 'Track User Progress',
    topFeatures: [
      { icon: '📊', text: '<b>Track User Progress (PR #77)</b> — per-user attempt log, progress timeline, mastery milestones' },
      { icon: '🗂️', text: '<b><code>StudentAttemptLog</code></b> model in MongoDB for fine-grained analytics' },
      { icon: '🔀', text: '<b>Upstream merge</b> for <code>feat/track_user_progress</code>' },
    ],
  },
  AnshulKanodia: {
    name: 'Anshul Kanodia',
    avatar: 'https://avatars.githubusercontent.com/u/113899062?v=4',
    color: '#7F8C8D',
    blog: 'https://anshulkanodia.vercel.app',
    descriptor: 'Geometry Game Restoration',
    topFeatures: [
      { icon: '🔺', text: '<b>Re-added Geometry Game (PR #8)</b> — restored the 20-July geometry game after it was lost in a merge' },
      { icon: '🔀', text: '<b>Upstream merge integration</b> for <code>patnaikArpita/Re-added-geometry-game-20July</code>' },
    ],
  },

  'vasuki-tenali': {
    name: 'Vasuki',
    avatar: 'https://github.com/identicons/vasuki-tenali.png',
    color: '#95A5A6',
    descriptor: 'Infra contributor',
    topFeatures: [
      { icon: '🔧', text: '<b>Single administrative / infrastructure commit</b> to the project' },
      { icon: '📧', text: '<i>Email was private — no public GitHub profile linked</i>' },
    ],
  },
};

// Map git-log author-name → GitHub login so we can join local commits to GH profiles.
// Note: a single GitHub login can have multiple git author names — the bot
// renders all of them and adds a "+" indicator in the contributor card.
// IMPORTANT: keep this exhaustive — any unmapped name is auto-added as a
// generic placeholder (works, but less rich than a curated profile).
const GIT_NAME_TO_LOGIN = {
  // S. R. S. Iyengar — one person, three git author names (capitalization variants)
  Sudarshan: 'sudarshansudarshan',
  sudarshan: 'sudarshansudarshan',
  'S. R. S. Iyengar': 'sudarshansudarshan',

  // Mudit Agrawal — one person, two git author names
  muditagrawal2007: 'muditagrawal2007',
  'Mudit Agrawal': 'muditagrawal2007',

  'varshini-nandula': 'varshini-nandula',

  // Jinal Gupta — one person, three git author names (Jinal / Jinal Gupta / jgupta-code)
  'jgupta05072003-code': 'jgupta05072003-code',
  Jinal: 'jgupta05072003-code',
  'Jinal Gupta': 'jgupta05072003-code',

  '24F3005086': '24F3005086',

  Vaibhav: 'Vaibhav-sa30',
  'Dipto Subhro': 'diptosubhro-ctrl',

  'Ritish Karmakar': 'Ritish007-svg',
  Ritish: 'Ritish007-svg',

  'K C Dharshan': 'KCDharshan9',
  KCDharshan9: 'KCDharshan9',

  'Ahana Banerjee': 'ahana4banerjee',
  'Sharonya Banerjee': 'sharonyamita-spec',
  Sharonya: 'sharonyamita-spec',

  poorvipravallika06: 'poorvipravallika06',
  Poorvipravallika: 'poorvipravallika06',

  RukmenderT: 'RukmenderT',
  'Krishna Gelra': 'KrishnaG-101',
  Krishna: 'KrishnaG-101',

  'S Hamsalekha': 'S-Hamsalekha-annamai',
  'S-Hamsalekha-annamai': 'S-Hamsalekha-annamai',
  Hamsalekha: 'S-Hamsalekha-annamai',

  'Anshul Kanodia': 'AnshulKanodia',
  AnshulKanodia: 'AnshulKanodia',

  'Shubh dixit': 'Shubhdix9',
  Shubh: 'Shubhdix9',

  // Vasuki — separate contributor with 1 commit, no GH profile (shown as placeholder)
  Vasuki: 'vasuki-tenali',
};

// ─── data merging ───────────────────────────────────────────────────────────

function mergeData(git, apiContribs) {
  // Join git commits by author name → login → API profile (or fallback).
  // For git author names NOT in GIT_NAME_TO_LOGIN, auto-create a synthetic
  // entry so any new contributor shows up immediately (bot is future-proof).
  // Emails are intentionally NOT collected or rendered (privacy).
  const byLogin = {};
  const unmappedNames = [];
  for (const [gitName, count] of Object.entries(git.commitsByName)) {
    const login = GIT_NAME_TO_LOGIN[gitName] || gitName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!GIT_NAME_TO_LOGIN[gitName]) unmappedNames.push(gitName);
    byLogin[login] = byLogin[login] || {
      login,
      gitNames: [],
      commits: 0,
    };
    byLogin[login].gitNames.push(gitName);
    byLogin[login].commits += count;
  }

  if (unmappedNames.length > 0) {
    log(`  ℹ auto-added ${unmappedNames.length} unmapped git author(s): ${unmappedNames.join(', ')}`);
    log(`     (these will appear in the leaderboard with a generic avatar — add a FALLBACK_PROFILES entry to enrich them)`);
  }

  // PR counts: keyed by github login (source branch prefix)
  const prsByLogin = git.prsByUser;

  // Merge profile data — fallback first, API on top but only with non-empty values.
  // If the API `name` equals the login (meaning /users/{login} fetch failed due
  // to rate limiting and we fell back to using the login as the name), prefer
  // the curated fallback real name.
  for (const login of Object.keys(byLogin)) {
    const api = apiContribs.find((c) => c.login === login);
    const fb = FALLBACK_PROFILES[login] || {};
    const apiClean = stripEmpty(api || {});
    if (apiClean.name === login) delete apiClean.name;
    byLogin[login] = {
      ...byLogin[login],
      ...fb,
      ...apiClean,
      prs: prsByLogin[login] || 0,
    };
  }

  // Sort by commits desc, then assign 1-indexed rank
  return Object.values(byLogin)
    .sort((a, b) => b.commits - a.commits)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));
}

// ─── rendering ──────────────────────────────────────────────────────────────

// Compute the rank emoji for a given 1-indexed position.
//   rank 1, 2, 3  → 🥇 🥈 🥉 (podium)
//   rank ≥4       → "<n>." (e.g. "4.")
// This is the single source of truth for rank formatting — every render
// (leaderboard, profile card <h4>) goes through here so positions can never
// drift out of sync.
function rankEmoji(rank) {
  return ['🥇', '🥈', '🥉'][rank - 1] || `${rank}.`;
}

// Build the "↳ also commits as: X, Y" merge indicator for a contributor.
// Always shown when a GitHub login has more than one git author name OR
// more than one email address — making the merge transparent.
function renderMergeNote(r) {
  const extras = [];
  if (r.gitNames && r.gitNames.length > 1) {
    const others = r.gitNames.filter((n) => n !== r.name && n !== r.git && n !== r.login);
    if (others.length > 0) extras.push(...others);
  }
  if (r.gitEmails && r.gitEmails.length > 1) {
    // Always show emails in a compact form
  }
  if (extras.length === 0) return '';
  return `\n<sub>↳ also commits as: <b>${extras.join('</b>, <b>')}</b></sub>`;
}

function renderLeaderboard(rows, totals) {
  const lines = [];
  lines.push('| # | 👤 Real Name | 🔗 GitHub ID | 📝 Commits | 🔀 PRs | 🏷️ Role |');
  lines.push('|--:|:-------------|:-------------|----------:|-----:|:--------|');
  rows.forEach((r) => {
    // Medal column uses the computed rank (single source of truth)
    const medal = rankEmoji(r.rank);
    // Prefer fallback name (real name), then git author name, then login
    const displayName =
      r.name && r.name !== r.login ? `**${r.name}**` : `**${r.login}**`;

    // Show "↳ also commits as" indicator when this GitHub user has multiple git identities
    let mergeSuffix = '';
    const otherNames = (r.gitNames || []).filter(
      (n) => n !== r.name && n !== r.git && n !== r.login && n !== r.login.toLowerCase()
    );
    if (otherNames.length > 0) {
      mergeSuffix = `<br/><sub>↳ also commits as <b>${otherNames.join('</b>, <b>')}</b></sub>`;
    }

    const ghLink = `[${r.login}](https://github.com/${r.login})`;
    // Role column uses the descriptor (no rank — rank lives in the medal column)
    const role = r.descriptor || '—';
    lines.push(
      `| ${medal} | ${displayName}${mergeSuffix} | ${ghLink} | **${r.commits}** | ${r.prs}  | ${role} |`
    );
  });
  return lines.join('\n');
}

function renderSnapshot(totals) {
  const byLogin = totals.byLogin || {};
  return [
    '| 🏆 Commits | 🔀 Merged PRs | 👥 Contributors | 🧩 Puzzles | 📚 Vocab | 🌍 GK |',
    '|----------:|------------:|--------------:|---------:|-------:|----:|',
    `| **${totals.totalCommits}** | **${totals.totalPRs}** | **${Object.keys(byLogin).length || 16}** | **69** | **7,662** | **991** |`,
  ].join('\n');
}

function renderAtAGlance(totals) {
  const stats = totals.repoStats || { stars: 0, forks: 0, watchers: 0, openIssues: 0 };
  return [
    '<p align="center">',
    '  <table>',
    '    <tr>',
    `      <td align="center"><b>${totals.totalCommits}</b><br/><sub>commits</sub></td>`,
    `      <td align="center"><b>${totals.totalPRs}</b><br/><sub>PRs merged</sub></td>`,
    `      <td align="center"><b>${Object.keys(totals.byLogin || {}).length || 16}</b><br/><sub>GitHub contributors</sub></td>`,
    `      <td align="center"><b>⭐ ${stats.stars}</b><br/><sub>stars</sub></td>`,
    `      <td align="center"><b>🍴 ${stats.forks}</b><br/><sub>forks</sub></td>`,
    `      <td align="center"><b>🐛 ${stats.openIssues}</b><br/><sub>open issues</sub></td>`,
    '    </tr>',
    '  </table>',
    '</p>',
  ].join('\n');
}

function renderCard(r) {
  const fb = FALLBACK_PROFILES[r.login] || {};
  // For auto-added contributors with no profile data, use a GitHub identicon
  // (deterministic per-login) and a neutral gray ring.
  const avatar = r.avatar || fb.avatar || `https://github.com/${r.login}.png?size=120`;
  const color = r.color || fb.color || '#888888';
  const name = r.name || fb.name || r.login;
  // Card title = computed rank + curated descriptor (rank is dynamic, never drifts)
  const descriptor = r.descriptor || fb.descriptor || 'New Contributor';
  const role = `${rankEmoji(r.rank)} ${descriptor}`;
  // Auto-added contributors with no FALLBACK_PROFILES entry get a placeholder feature list
  const features = (r.topFeatures || fb.topFeatures || [
    { icon: '🆕', text: '<b>New contributor</b> — auto-added by the readme-bot' },
    { icon: '📊', text: `<b>${r.commits} commits</b> across this repo's history` },
    { icon: '🔗', text: '<i>Add a <code>FALLBACK_PROFILES</code> entry in <code>scripts/update-readme-contributors.js</code> to enrich this card with real name, avatar, location, and curated feature list</i>' },
  ]).map(
    (f) => `          <li>${f.icon} ${f.text}</li>`
  ).join('\n');

  // Build sub-line: location + twitter + blog + merged identities
  const metaSubs = [];
  if (r.location) metaSubs.push(`📍 ${r.location}`);
  if (r.twitter) metaSubs.push(`🐦 @${r.twitter}`);
  if (r.blog) metaSubs.push(`🌐 ${r.blog}`);
  if (r.note) metaSubs.push(`<i>(${r.note})</i>`);
  const metaLine = metaSubs.length > 0 ? `\n        <br/><sub>${metaSubs.join(' · ')}</sub>` : '';

  // Merge indicator — show all other git author names (emails are intentionally
  // NOT rendered here for privacy)
  const others = (r.gitNames || []).filter(
    (n) => n !== name && n !== fb.name && n !== r.login
  );
  const mergeSubs = [];
  if (others.length > 0) {
    mergeSubs.push(`<sub>🔗 also commits as: <b>${others.join('</b>, <b>')}</b></sub>`);
  }
  const mergeLine = mergeSubs.length > 0 ? `\n        <br/>${mergeSubs.join('\n        <br/>')}` : '';

  return [
    `<p align="center">`,
    `  <table>`,
    `    <tr>`,
    `      <td align="center" width="220">`,
    `        <a href="https://github.com/${r.login}"><img src="${avatar}&s=120" width="120" style="border-radius:50%; border:3px solid ${color};" alt="${name}"/></a>`,
    `        <br/><b>${name}</b>`,
    (fb.git && fb.git !== name) ? `        <br/><sub><i>(git: ${fb.git})</i></sub>` : '',
    `        <br/><a href="https://github.com/${r.login}">@${r.login}</a>`,
    `        <br/><sub>🏆 ${r.commits} commits · ${r.prs} PR${r.prs === 1 ? '' : 's'} merged</sub>${metaLine}${mergeLine}`,
    `      </td>`,
    `      <td valign="top" width="*">`,
    `        <h4>${role}</h4>`,
    `        <ul>`,
    features,
    `        </ul>`,
    `      </td>`,
    `    </tr>`,
    `  </table>`,
    `</p>`,
  ].filter(Boolean).join('\n');
}

function renderCards(rows) {
  if (rows.length === 0) return '_No contributor data available yet._';
  return rows.map(renderCard).join('\n\n');
}

// ─── CHANGELOG rendering ────────────────────────────────────────────────────

// Map conventional commit prefix → emoji + label
const COMMIT_TYPE_ICONS = {
  feat: '✨', feature: '✨',
  fix: '🐛', bugfix: '🐛',
  docs: '📝', doc: '📝',
  chore: '🔧',
  refactor: '♻️',
  style: '💄',
  test: '🧪', tests: '🧪',
  perf: '⚡',
  build: '📦',
  ci: '👷',
  revert: '⏪',
  merge: '🔀',
  init: '🎉',
  release: '🚀',
};

function commitTypeIcon(subject) {
  const m = String(subject || '').toLowerCase().match(/^([a-z]+)(?:\(.*?\))?!?:/);
  if (!m) return '📌'; // default for non-conventional commits
  return COMMIT_TYPE_ICONS[m[1]] || '📌';
}

// Parse "Merge pull request #N from <user>/<branch>" → PR info
function parseMergeInfo(subject) {
  const m = String(subject || '').match(/Merge pull request #(\d+) from ([^/]+)\//i);
  if (!m) return null;
  return { prNumber: m[1], prAuthor: m[2] };
}

// Strip the conventional-commit prefix from a subject for cleaner display
function cleanSubject(subject) {
  return String(subject || '').replace(/^[a-z]+(?:\([^)]*\))?!?:\s*/i, '');
}

// Render the per-commit deep-details block: files changed + line counts
// + optional commit body. Returned as a list of markdown lines (without
// the leading "- " bullet — caller adds that).
const MAX_FILES_SHOWN = 8;     // cap file list to keep changelog scannable
const MAX_BODY_LINES = 8;      // cap multi-line commit body

function renderCommitDetails(c, repoUrl, commitUrl) {
  const out = [];

  // ── Files changed line ──
  const files = c.filesChanged || [];
  const fileCount = files.length;

  if (fileCount > 0) {
    let fileLine;
    if (fileCount <= MAX_FILES_SHOWN) {
      // Show every file with inline per-file +/− stats
      const parts = files.map((f) => {
        const ad = (f.additions || 0) + (f.deletions || 0);
        // Inline per-file stats: only show numbers when they're meaningful
        if (f.additions === 0 && f.deletions === 0) return `\`${f.file}\``;
        return `\`${f.file}\` \`+${f.additions} −${f.deletions}\``;
      });
      fileLine = `📁 **${fileCount} file${fileCount === 1 ? '' : 's'}:** ${parts.join(', ')}`;
    } else {
      // Truncate the file list with "+N more"
      const shown = files.slice(0, MAX_FILES_SHOWN);
      const remaining = fileCount - MAX_FILES_SHOWN;
      const parts = shown.map((f) => {
        if (f.additions === 0 && f.deletions === 0) return `\`${f.file}\``;
        return `\`${f.file}\` \`+${f.additions} −${f.deletions}\``;
      });
      fileLine = `📁 **${fileCount} files:** ${parts.join(', ')} *(+${remaining} more in [\`${c.shortSha}\`](${commitUrl(c.sha)}))*`;
    }
    out.push(fileLine);
  }

  // ── Line stats summary line ──
  if (c.insertions || c.deletions || fileCount > 0) {
    const ins = c.insertions || 0;
    const del = c.deletions || 0;
    const fLabel = fileCount > 0 ? ` · ${fileCount} file${fileCount === 1 ? '' : 's'}` : '';
    out.push(`📊 **\`+${ins} −${del}\`**${fLabel}`);
  }

  // ── Commit body (if present and non-trivial) ──
  if (c.body) {
    const bodyLines = c.body.split('\n').slice(0, MAX_BODY_LINES);
    const more = c.body.split('\n').length - bodyLines.length;
    const quoted = bodyLines.map((l) => `> ${l}`).join('\n');
    const moreNote = more > 0 ? `\n> *…(${more} more line${more === 1 ? '' : 's'})*` : '';
    out.push(`💬 **What & why:**\n${quoted}${moreNote}`);
  }

  return out;
}

function renderChangelog(git) {
  const commits = git.commits || [];
  if (commits.length === 0) return '_No commits yet._';

  // Group commits by date (YYYY-MM-DD)
  const byDate = new Map();
  for (const c of commits) {
    if (!byDate.has(c.date)) byDate.set(c.date, []);
    byDate.get(c.date).push(c);
  }

  // Sort dates newest-first
  const sortedDates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1));

  // Build a clickable commit URL: clicking the short SHA jumps to the
  // diff on GitHub so developers can see exactly what changed.
  const repoUrl = `https://github.com/${REPO}`;
  const commitUrl = (sha) => `${repoUrl}/commit/${sha}`;

  const lines = [];
  lines.push(`### 📊 Total: ${commits.length} commits · ${byDate.size} active days · ${git.uniqueAuthors} unique authors\n`);
  lines.push(`> **📖 How to read this:** Each entry shows a clickable SHA, the author, and a one-line subject. Sub-bullets show the **exact files touched** with per-file \`+additions −deletions\`, the **total line stats**, and (when present) the **commit body** explaining what & why.\n`);

  for (const date of sortedDates) {
    const dayCommits = byDate.get(date);
    lines.push(`#### 📅 ${date}  <sub>(${dayCommits.length} commit${dayCommits.length === 1 ? '' : 's'})</sub>\n`);

    // Per-commit deep details — every commit gets its own bullet block
    for (const c of dayCommits) {
      const icon = commitTypeIcon(c.subject);
      const merge = parseMergeInfo(c.subject);
      const shaLink = `[\`${c.shortSha}\`](${commitUrl(c.sha)})`;

      let mainLine;
      if (merge) {
        const prLink = `[#${merge.prNumber}](${repoUrl}/pull/${merge.prNumber})`;
        mainLine = `- ${icon} ${shaLink} — **${c.author}** — 🔀 PR ${prLink} from \`${merge.prAuthor}\` — ${cleanSubject(c.subject.replace(/^Merge pull request.*from [^\/]+\/?/, '')) || c.subject}`;
      } else {
        mainLine = `- ${icon} ${shaLink} — **${c.author}** — ${cleanSubject(c.subject)}`;
      }
      lines.push(mainLine);

      // Append deep details (files + stats + body) as 4-space-indented sub-bullets
      const details = renderCommitDetails(c, repoUrl, commitUrl);
      for (const detail of details) {
        lines.push(`    - ${detail}`);
      }
    }

    lines.push(''); // blank line between dates
  }

  return lines.join('\n');
}

// ─── README mutation ────────────────────────────────────────────────────────

function replaceMarkerBlock(readme, startMarker, endMarker, newContent) {
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error(`Markers not found: ${startMarker} / ${endMarker}`);
  }
  return (
    readme.slice(0, start + startMarker.length) +
    '\n' + newContent + '\n' +
    readme.slice(end)
  );
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  log('Gathering git data…');
  const git = gatherGitLog();
  log(`  → ${git.totalCommits} commits · ${git.totalPRs} merged PRs · ${git.uniqueAuthors} unique authors`);

  let apiContribs = [];
  let repoStats = { stars: 0, forks: 0, watchers: 0, openIssues: 0 };
  try {
    const fetched = await fetchContributors();
    apiContribs = fetched.contributors;
    repoStats = fetched.repoStats;
    log(`  → ${apiContribs.length} GitHub contributors with profile data`);
  } catch (e) {
    log('⚠ API fetch failed entirely, using fallback profiles only:', e.message);
  }

  const rows = mergeData(git, apiContribs);

  const banner = rows.length > 0
    ? `_Live data — last regenerated ${new Date().toISOString().split('T')[0]} · auto-refreshed by [\`github-actions[bot]\`](https://github.com/features/actions) on every push to \`main\` and every 12h._`
    : '';

  const totals = {
    ...git,
    repoStats,
    byLogin: Object.fromEntries(rows.map((r) => [r.login, r])),
  };

  const leaderboard = banner + '\n\n' + renderLeaderboard(rows, totals);
  const snapshot = renderSnapshot(totals);
  const atAGlance = renderAtAGlance(totals);
  const cards = renderCards(rows);
  const changelog = renderChangelog(git);

  let readme = fs.readFileSync(README, 'utf8');
  let contributorsDoc = fs.readFileSync(CONTRIBUTORS, 'utf8');

  // CHANGELOG.md — point-wise commit log grouped by date
  let changelogDoc = fs.existsSync(CHANGELOG)
    ? fs.readFileSync(CHANGELOG, 'utf8')
    : null;
  if (changelogDoc) {
    changelogDoc = replaceMarkerBlock(changelogDoc, '<!-- live-changelog:start -->', '<!-- live-changelog:end -->', changelog);
  }

  // README.md — only the at-a-glance, snapshot, leaderboard (no cards)
  readme = replaceMarkerBlock(readme, '<!-- live-at-a-glance:start -->', '<!-- live-at-a-glance:end -->', atAGlance);
  readme = replaceMarkerBlock(readme, '<!-- live-snapshot:start -->', '<!-- live-snapshot:end -->', snapshot);
  readme = replaceMarkerBlock(readme, '<!-- live-rank:start -->', '<!-- live-rank:end -->', leaderboard);

  // CONTRIBUTORS.md — full set including the cards
  contributorsDoc = replaceMarkerBlock(contributorsDoc, '<!-- live-snapshot:start -->', '<!-- live-snapshot:end -->', snapshot);
  contributorsDoc = replaceMarkerBlock(contributorsDoc, '<!-- live-rank:start -->', '<!-- live-rank:end -->', leaderboard);
  contributorsDoc = replaceMarkerBlock(contributorsDoc, '<!-- live-cards:start -->', '<!-- live-cards:end -->', cards);

  if (DRY_RUN) {
    log('--dry-run — preview of leaderboard:');
    console.log('─'.repeat(60));
    console.log(readme.split('<!-- live-rank:start -->')[1]?.split('<!-- live-rank:end -->')[0] || '');
    console.log('─'.repeat(60));
    return;
  }

  fs.writeFileSync(README, readme);
  fs.writeFileSync(CONTRIBUTORS, contributorsDoc);
  if (changelogDoc) fs.writeFileSync(CHANGELOG, changelogDoc);
  log(`✅ README.md + CONTRIBUTORS.md${changelogDoc ? ' + CHANGELOG.md' : ''} updated (${rows.length} contributors · ${git.commits.length} commits rendered)`);
}

main().catch((e) => {
  console.error('[readme-bot] ❌', e.message);
  process.exit(1);
});