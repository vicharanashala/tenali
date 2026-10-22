#!/usr/bin/env node
/**
 * check-topic-drift.mjs — fails when the three lists that define "which
 * topics exist" disagree in a way nobody has explained (issue #233).
 *
 * A topic is declared in three hand-maintained places:
 *   1. modeMap   — client/src/App.jsx, the screen each mode key opens
 *   2. tiles     — client/src/features/tiles.js, what the home screen shows
 *   3. server    — server/index.js, the app.use('/<key>-api', ...) mounts
 *
 * Checks:
 *   A. every modeMap key has a tile, or an allowlisted reason it does not
 *   B. every tile opens a modeMap key (never allowlisted: a tile to nowhere
 *      is always a bug)
 *   C. every modeMap key has a server mount (directly or via an alias), or
 *      is allowlisted as client-only
 *   D. every server mount is used by a modeMap key (directly or via an
 *      alias), or is allowlisted as server-only
 *
 * Deliberate exceptions live in scripts/topic-drift-allowlist.json, one
 * line of reason each. An allowlist entry that is no longer needed (say a
 * tile was added for it) is reported as a warning, not a failure, so a
 * correct PR elsewhere never turns this check red.
 *
 * Usage:  node scripts/check-topic-drift.mjs [--root <repo dir>]
 * No dependencies: Node built-ins only, so CI needs no npm install.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rootArg = process.argv.indexOf('--root');
const ROOT = rootArg > -1 ? resolve(process.argv[rootArg + 1]) : resolve(here, '..');

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

/* ── 1. modeMap keys, parsed from App.jsx ─────────────────────────────── */

function readModeMap() {
  const lines = read('client/src/App.jsx').split('\n');
  const start = lines.findIndex((l) => /const modeMap = \{/.test(l));
  if (start < 0) throw new Error('Could not find `const modeMap = {` in client/src/App.jsx');
  const keys = new Set();
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].replace(/\/\/.*$/, '');
    if (/^\s*\}/.test(line)) break;
    const m = /^\s*(?:'([\w-]+)'|"([\w-]+)"|([A-Za-z_$][\w$]*))\s*:/.exec(line);
    if (m) keys.add(m[1] || m[2] || m[3]);
  }
  if (keys.size === 0) throw new Error('modeMap parsed as empty; has its format changed?');
  return keys;
}

/* ── 2. tile keys, imported from tiles.js (pure data) ─────────────────── */

async function readTiles() {
  const mod = await import(pathToFileURL(join(ROOT, 'client/src/features/tiles.js')).href);
  const entries = [
    ...(mod.TILES || []),
    ...(mod.FEATURED_TILES || []),
    mod.MATH_LAB_ENTRY,
    mod.GEOCRAFT_ENTRY,
  ].filter(Boolean);
  return new Set(entries.map((t) => t.key));
}

/* ── 3. server mounts, parsed from index.js ───────────────────────────── */

function readServerMounts() {
  const src = read('server/index.js');
  return new Set([...src.matchAll(/app\.use\(\s*['"`]\/([\w-]+)-api\/?['"`]/g)].map((m) => m[1]));
}

/* ── compare ──────────────────────────────────────────────────────────── */

const allow = JSON.parse(read('scripts/topic-drift-allowlist.json'));
const section = (name) => allow[name] || {};
const aliases = section('aliases');        // modeMap key -> server prefix
const noTile = section('noTile');          // modeMap key reachable another way
const clientOnly = section('clientOnly');  // modeMap key with no server route
const serverOnly = section('serverOnly');  // server prefix with no modeMap key

const modes = readModeMap();
const tiles = await readTiles();
const server = readServerMounts();
const serverFor = (key) => aliases[key] || key;
const usedPrefixes = new Set([...modes].map(serverFor));

const errors = [];
const warnings = [];
const sorted = (xs) => [...xs].sort();

// A. modes without a tile
for (const k of sorted(modes)) {
  if (!tiles.has(k) && !noTile[k]) {
    errors.push(`A  "${k}" is in modeMap but has no home tile. Add a tile in client/src/features/tiles.js, or add it to "noTile" in the allowlist with the way students reach it.`);
  }
}
// B. tiles without a mode
for (const k of sorted(tiles)) {
  if (!modes.has(k)) {
    errors.push(`B  tile "${k}" opens nothing: there is no "${k}" key in modeMap (client/src/App.jsx).`);
  }
}
// C. modes without a server route
for (const k of sorted(modes)) {
  if (!server.has(serverFor(k)) && !clientOnly[k]) {
    errors.push(`C  "${k}" is in modeMap but no server route "/${serverFor(k)}-api" is mounted in server/index.js. Mount one, or add it to "clientOnly" (or "aliases") in the allowlist.`);
  }
}
// D. server routes nothing uses
for (const p of sorted(server)) {
  if (!usedPrefixes.has(p) && !serverOnly[p]) {
    errors.push(`D  server mounts "/${p}-api" but no modeMap key uses it. Add the screen, remove the route, or add it to "serverOnly" in the allowlist.`);
  }
}

// Stale or unknown allowlist entries: warn only.
const stale = (name, keys, stillNeeded) => {
  for (const k of Object.keys(keys)) {
    if (!stillNeeded(k)) warnings.push(`"${k}" in "${name}" is no longer needed and can be removed from the allowlist.`);
  }
};
stale('noTile', noTile, (k) => modes.has(k) && !tiles.has(k));
stale('clientOnly', clientOnly, (k) => modes.has(k) && !server.has(serverFor(k)));
stale('serverOnly', serverOnly, (p) => server.has(p) && !usedPrefixes.has(p));
stale('aliases', aliases, (k) => modes.has(k) && server.has(aliases[k]) && !server.has(k));

/* ── report ───────────────────────────────────────────────────────────── */

const both = [...modes].filter((k) => tiles.has(k) && server.has(serverFor(k))).length;
console.log(`Topic drift check: ${modes.size} modeMap keys, ${tiles.size} tiles, ${server.size} server routes; ${both} appear in all three.`);
console.log(`Allowlisted: ${Object.keys(noTile).length} without a tile, ${Object.keys(clientOnly).length} client-only, ${Object.keys(serverOnly).length} server-only, ${Object.keys(aliases).length} aliases.`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.error(`\n${errors.length} unexplained mismatch(es):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  console.error('\nSee scripts/topic-drift-allowlist.json for deliberate exceptions (issue #233).');
  process.exit(1);
}
console.log('\n✓ No unexplained drift.');
