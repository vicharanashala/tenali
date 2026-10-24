#!/usr/bin/env node
/**
 * Runtime floor check — fails closed on an unpatched Node.js.
 *
 * Why this exists: the services run `/usr/bin/node` (see the systemd units),
 * and the version on the box is invisible to git. DigitalOcean flagged the
 * droplet as potentially affected by CVE-2026-111497 ("Node.js Brotli decoder
 * out-of-bounds write permits remote code execution", HIGH) after the
 * October 21, 2026 Node.js security release. That release also fixed three
 * TLS hostname-verification bypasses and a DNS NUL-truncation bug, all of
 * which matter to a server that makes outbound TLS calls.
 *
 * The required version lives in ONE place — the `.nvmrc` at the repository
 * root — so the deploy script, the systemd units and the documentation
 * cannot drift apart.
 *
 * Dependency-free on purpose: it runs before `npm ci`, from a systemd
 * `ExecStartPre`, and possibly on a box whose `node_modules` is stale or
 * absent.
 *
 * Usage:
 *   node server/deploy/check-node-version.js            # check this runtime
 *   node server/deploy/check-node-version.js --print    # print the floor
 *
 * Exit codes: 0 = runtime is at or above the floor, 1 = runtime is below it
 * (or the floor could not be read), 2 = bad usage.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// The repository root — this file lives at <root>/server/deploy/.
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const NVMRC_PATH = path.join(REPO_ROOT, '.nvmrc');

/**
 * Read the required version from .nvmrc.
 * @returns {string} e.g. "24.22.1"
 */
function readRequiredVersion() {
  const raw = fs.readFileSync(NVMRC_PATH, 'utf8').trim();
  // .nvmrc may hold a "v"-prefixed version or a range like "lts/*"; only an
  // exact version can be a floor, so anything else is a configuration error.
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(raw);
  if (!match) {
    throw new Error(
      `.nvmrc must hold an exact version like "24.22.1" (found ${JSON.stringify(raw)})`
    );
  }
  return `${match[1]}.${match[2]}.${match[3]}`;
}

/**
 * Compare two dotted versions.
 * @param {string} a
 * @param {string} b
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/**
 * @param {string} current running Node version
 * @param {string} required floor from .nvmrc
 * @returns {boolean}
 */
function isSupported(current, required) {
  return compareVersions(current, required) >= 0;
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(
      'Usage: node server/deploy/check-node-version.js [--print]\n' +
        '  Exits 0 when the running Node.js is at or above the version in .nvmrc.\n'
    );
    return 0;
  }

  let required;
  try {
    required = readRequiredVersion();
  } catch (err) {
    process.stderr.write(`[runtime] ${err.message}\n`);
    return 1;
  }

  if (argv.includes('--print')) {
    process.stdout.write(`${required}\n`);
    return 0;
  }

  const current = process.versions.node;
  if (!isSupported(current, required)) {
    process.stderr.write(
      `[runtime] Node.js ${current} is older than the required ${required}.\n` +
        `[runtime] Patch the runtime before deploying or starting the service — see DEPLOYMENT.md.\n`
    );
    return 1;
  }

  process.stdout.write(`[runtime] Node.js ${current} satisfies the required ${required}.\n`);
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { readRequiredVersion, compareVersions, isSupported };
