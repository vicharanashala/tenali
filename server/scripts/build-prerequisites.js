#!/usr/bin/env node
/**
 * build-prerequisites.js
 *
 * Contributor tool: rebuilds server/prerequisites.json from the deployed
 * /graph page (or a local file dump as fallback).
 *
 * Usage:
 *   node build-prerequisites.js [--out <path>] [--source <url|local>]
 *   node build-prerequisites.js --help
 *
 * Defaults:
 *   --out     D:\vins-phase-2\tenali\server\prerequisites.json
 *             (resolved relative to CWD; if relative path, written to
 *              server/prerequisites.json relative to repo root)
 *   --source  https://tenali.fun/graph  (live fetch). Pass a local .html
 *             file path (e.g. /tmp/graph-snapshot.html) to build from a saved
 *             page source. Local mode requires the file to contain the same
 *             inline-JS `const nodes = [...]` + `const edges = [...]` blocks
 *             as the live page.
 *
 * Exit codes:
 *   0 — success, no cycle warnings
 *   1 — parse error (input malformed or empty)
 *   2 — success with cycle warnings (run still completes; reviewer should
 *       investigate — feature_p spec says bidirectional edges are kept
 *       verbatim)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── CLI parsing ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { out: null, source: null, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--out' && argv[i + 1]) { args.out = argv[++i]; }
    else if (a === '--source' && argv[i + 1]) { args.source = argv[++i]; }
    else {
      console.error(`Unknown argument: ${a}`);
      console.error('Run with --help for usage.');
      process.exit(1);
    }
  }
  return args;
}

if (require.main === module && process.argv[1] && process.argv[1].endsWith('build-prerequisites.js')) {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 24).join('\n'));
    process.exit(0);
  }
  main(args).catch(err => {
    console.error('FATAL:', err.message);
    process.exit(1);
  });
}

// ── Source resolvers ───────────────────────────────────────────────────────
// Fetch /graph HTML and extract inline JS data. We rely on the page rendering
// a <script> tag with a const nodes = [...] and const edges = [...] block.
// If structure changes (gemini rewrites the page), the regexes below need to
// match the new format.
async function fetchRemoteGraph(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      let html = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { html += chunk; });
      res.on('end', () => resolve(html));
    }).on('error', reject);
  });
}

function parseGraphFromHtml(html) {
  // Note 1: the live page (as of gemini's most recent edit) does NOT use a
  // trailing `;` after the array literals — it goes straight into a `// ...`
  // comment. Make the semicolon optional so we handle both styles.
  //
  // Note 2: lazy `[\s\S]*?` matching is dangerous here because the array
  // contains inner arrays (e.g. `['a', 'b']`). The shortest match ending in
  // `]` will stop at the first inner `]`. Instead, we anchor on the closing
  // `]` being at the START of a line (gemini's page format) — that's the
  // outer-array closing bracket. If a future rewrite changes the formatting
  // (e.g. trailing `]` on a line with content), this regex will need to be
  // updated or replaced with a balanced-bracket parser.
  const nodesMatch = html.match(/const\s+nodes\s*=\s*(\[[\s\S]*?\n\])/);
  const edgesMatch = html.match(/const\s+edges\s*=\s*(\[[\s\S]*?\n\])/);
  if (!nodesMatch || !edgesMatch) {
    throw new Error('Could not find nodes/edges blocks in /graph HTML — page structure may have changed.');
  }
  return { nodesRaw: nodesMatch[1], edgesRaw: edgesMatch[1] };
}

// Local file mode: contributor must provide the inline-JS dumps from a
// /graph snapshot. We don't ship committed snapshots because the live page
// is the source of truth; commits would go stale.
function loadLocalGraph(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Local mode requires a single dump file at ${file}`);
  }
  const html = fs.readFileSync(file, 'utf8');
  const parsed = parseGraphFromHtml(html);
  return { ...parsed, sourceUsed: file };
}

// ── Parsing ────────────────────────────────────────────────────────────────
function parseTopics(nodesRaw) {
  const matches = [...nodesRaw.matchAll(/id:\s*'([^']+)'/g)];
  return [...new Set(matches.map(m => m[1]))].sort();
}

function parseEdges(edgesRaw, topics) {
  const matches = [...edgesRaw.matchAll(/\['([^']+)',\s*'([^']+)'\]/g)];
  const prereqs = {};
  for (const t of topics) prereqs[t] = [];
  for (const m of matches) {
    const from = m[1];
    const to = m[2];
    if (prereqs[to]) prereqs[to].push(from);
  }
  return prereqs;
}

function detectCycles(topics, prereqs) {
  const cycles = [];
  for (const topic of topics) {
    for (const p of prereqs[topic]) {
      if (prereqs[p] && prereqs[p].includes(topic)) {
        cycles.push([p, topic]);
      }
    }
  }
  return cycles;
}

// ── Output writing ─────────────────────────────────────────────────────────
function buildOutput(topics, prereqs, generated) {
  const out = {
    _meta: {
      comment: 'Prerequisite map for feature P, derived from deployed /graph page (snapshot at PR time). Direct parents only — no transitive traversal.',
      source: 'https://tenali.fun/graph',
      generated,
      schema: 'Map of topic key (string) → array of prerequisite topic keys (strings). Direct parents only. Root topics have empty arrays. Server trims to first 3 entries at runtime via the picker cap.',
    },
  };
  for (const t of topics) {
    out[t] = prereqs[t];
  }
  return out;
}

function writeAtomic(targetPath, content) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = targetPath + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, targetPath);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main(args) {
  const here = __dirname;
  const repoRoot = path.resolve(here, '..', '..');

  // Default output: server/prerequisites.json
  const outPath = args.out
    ? path.resolve(args.out)
    : path.join(repoRoot, 'server', 'prerequisites.json');

  // Default source: live fetch from tenali.fun/graph
  let nodesRaw, edgesRaw, sourceUsed = args.source || 'https://tenali.fun/graph';
  try {
    if (!args.source || args.source.startsWith('http')) {
      const url = args.source || 'https://tenali.fun/graph';
      console.log(`Fetching live graph from ${url} ...`);
      const html = await fetchRemoteGraph(url);
      const parsed = parseGraphFromHtml(html);
      nodesRaw = parsed.nodesRaw;
      edgesRaw = parsed.edgesRaw;
    } else {
      console.log(`Loading local dump from ${args.source} ...`);
      const parsed = loadLocalGraph(args.source);
      nodesRaw = parsed.nodesRaw;
      edgesRaw = parsed.edgesRaw;
      sourceUsed = args.source;
    }
  } catch (err) {
    console.error(`Source resolution failed: ${err.message}`);
    console.error('Tip: re-save the /graph page source to a local .html file and pass --source <path>.html');
    process.exit(1);
  }

  // Parse
  const topics = parseTopics(nodesRaw);
  if (topics.length === 0) {
    console.error('No topics parsed from input — exiting.');
    process.exit(1);
  }
  const prereqs = parseEdges(edgesRaw, topics);
  const cycles = detectCycles(topics, prereqs);

  // Build + write
  const generated = new Date().toISOString();
  const out = buildOutput(topics, prereqs, generated);
  // Update _meta.source to reflect what we actually used (helpful if reviewer
  // sees a non-default source in the output).
  out._meta.source = (sourceUsed.startsWith('http') ? sourceUsed : `local://${sourceUsed}`);

  const json = JSON.stringify(out, null, 2) + '\n';
  writeAtomic(outPath, json);

  // Stats
  const withPrereqs = topics.filter(t => prereqs[t].length > 0).length;
  const roots = topics.length - withPrereqs;
  const maxPrereqs = Math.max(...topics.map(t => prereqs[t].length));
  const size = fs.statSync(outPath).size;

  console.log('');
  console.log(`✓ wrote ${outPath}`);
  console.log(`  size:        ${size} bytes`);
  console.log(`  total:       ${topics.length} topics`);
  console.log(`  with prereqs: ${withPrereqs}`);
  console.log(`  roots:       ${roots}`);
  console.log(`  max prereqs: ${maxPrereqs}`);
  console.log(`  cycles:      ${cycles.length}`);
  cycles.forEach(c => console.log(`    ${c[0]} <-> ${c[1]}`));
  console.log(`  source:      ${sourceUsed}`);
  console.log('');

  // Sample output for sanity
  const samples = ['basicarith', 'quadratic', 'integ', 'trig'];
  console.log('samples:');
  for (const s of samples) {
    console.log(`  ${s} → ${JSON.stringify(prereqs[s] || [])}`);
  }

  process.exit(cycles.length > 0 ? 2 : 0);
}

module.exports = { main, parseGraphFromHtml, parseTopics, parseEdges, detectCycles, buildOutput };
