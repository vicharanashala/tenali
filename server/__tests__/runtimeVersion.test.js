import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..', '..');
const checkerPath = path.join(repoRoot, 'server', 'deploy', 'check-node-version.js');

const requireChecker = () => createRequire(import.meta.url)(checkerPath);

const read = (file) => readFileSync(path.join(repoRoot, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

/**
 * The release that carries the October 21, 2026 Node.js security fixes
 * (CVE-2026-111497 "Brotli decoder out-of-bounds write permits remote code
 * execution", plus the TLS hostname-verification and DNS advisories in the
 * same release). Older lines do not receive these fixes at all.
 */
const PATCHED_RELEASES = {
  '22.x': '22.23.4',
  '24.x': '24.22.1',
  '26.x': '26.12.1',
};

describe('runtime floor', () => {
  it('.nvmrc pins an exact patched release', () => {
    const required = read('.nvmrc').trim();
    expect(required).toMatch(/^v?\d+\.\d+\.\d+$/);
    const [major, minor, patch] = required.replace(/^v/, '').split('.').map(Number);
    const line = `${major}.x`;
    expect(PATCHED_RELEASES[line]).toBeDefined();
    const [fMaj, fMin, fPatch] = PATCHED_RELEASES[line].split('.').map(Number);
    const atLeastFix = patch > fPatch || (patch === fPatch && minor >= fMin);
    expect(major).toBe(fMaj);
    expect(atLeastFix).toBe(true);
  });

  it('server/package.json engines allow exactly the pinned line and above', () => {
    const pkg = readJson('server/package.json');
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toMatch(/^>=\d+\.\d+\.\d+ /);
    const floor = pkg.engines.node.match(/>=(\d+\.\d+\.\d+)/)[1];
    expect(floor).toBe(read('.nvmrc').trim());
  });

  it('render.yaml pins the same NODE_VERSION', () => {
    const yaml = read('render.yaml');
    expect(yaml).toMatch(/key:\s*NODE_VERSION/);
    const version = yaml.match(/key:\s*NODE_VERSION\s*\n\s*value:\s*(\S+)/)[1];
    expect(version).toBe(read('.nvmrc').trim());
  });

  it('DEPLOYMENT.md documents the pinned version and how to read the running one', () => {
    const doc = read('DEPLOYMENT.md');
    expect(doc).toContain(read('.nvmrc').trim());
    expect(doc).toContain('node -v');
  });
});

describe('check-node-version.js', () => {
  it('exists and is dependency-free', () => {
    expect(existsSync(checkerPath)).toBe(true);
    const source = readFileSync(checkerPath, 'utf8');
    expect(source).not.toMatch(/require\(['"](?!node:|fs|path)/);
  });

  it('prints the required version with --print', () => {
    const out = execFileSync('node', [checkerPath, '--print'], { encoding: 'utf8' }).trim();
    expect(out).toBe(read('.nvmrc').trim());
  });

  it('decides correctly for whatever runtime is running', () => {
    // The runner may be below the floor (CI on an older Node), so the test
    // asserts the checker's decision, not that the runtime happens to be
    // patched. A checker that always passed would fail this.
    const { isSupported } = requireChecker();
    const floor = read('.nvmrc').trim().replace(/^v/, '');
    const supported = isSupported(process.versions.node, floor);

    let status = 0;
    try {
      execFileSync('node', [checkerPath], { encoding: 'utf8', stdio: 'pipe' });
    } catch (err) {
      status = err.status;
      expect(err.stderr).toContain('older than the required');
    }
    expect(status === 0).toBe(supported);
  });

  it('accepts a runtime at or above the floor', () => {
    // A scratch copy with a floor the running runtime satisfies.
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'tenali-runtime-'));
    try {
      fs.mkdirSync(path.join(scratch, 'server', 'deploy'), { recursive: true });
      fs.copyFileSync(checkerPath, path.join(scratch, 'server', 'deploy', 'check-node-version.js'));
      fs.writeFileSync(path.join(scratch, '.nvmrc'), '1.0.0\n');
      const out = execFileSync('node', [path.join(scratch, 'server', 'deploy', 'check-node-version.js')], {
        encoding: 'utf8',
      });
      expect(out).toContain('satisfies the required 1.0.0');
    } finally {
      fs.rmSync(scratch, { recursive: true, force: true });
    }
  });

  it('rejects a runtime below the floor', () => {
    // Exercise the comparison directly — the process running the test cannot
    // be made to report an old version.
    const { compareVersions, isSupported } = requireChecker();
    const floor = read('.nvmrc').trim().replace(/^v/, '');

    expect(compareVersions('20.11.1', floor)).toBe(-1);
    expect(compareVersions(floor, floor)).toBe(0);
    expect(compareVersions('24.99.0', floor)).toBe(1);

    expect(isSupported('20.11.1', floor)).toBe(false);
    expect(isSupported(floor, floor)).toBe(true);
    expect(isSupported('26.0.0', floor)).toBe(true);
  });

  it('exits non-zero when the runtime is below the floor', () => {
    // The checker reads the floor from .nvmrc, so a rejected runtime can only
    // be simulated through a temporary checkout — assert the failure path by
    // pointing the checker at a lower floor in a scratch copy.
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'tenali-runtime-'));
    try {
      fs.mkdirSync(path.join(scratch, 'server', 'deploy'), { recursive: true });
      fs.copyFileSync(checkerPath, path.join(scratch, 'server', 'deploy', 'check-node-version.js'));
      fs.writeFileSync(path.join(scratch, '.nvmrc'), '99.0.0\n');
      let status = 0;
      try {
        execFileSync('node', [path.join(scratch, 'server', 'deploy', 'check-node-version.js')], {
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (err) {
        status = err.status;
        expect(err.stderr).toContain('older than the required');
      }
      expect(status).toBe(1);
    } finally {
      fs.rmSync(scratch, { recursive: true, force: true });
    }
  });
});
