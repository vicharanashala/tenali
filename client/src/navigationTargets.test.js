import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function sourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

describe('navigation targets', () => {
  it('has no client source that navigates to a hash route', () => {
    // The app routes on window.location.pathname. There is no hash router, so
    // `location.hash = '#/something'` changes the URL fragment and nothing
    // else — the student stays on the same screen with a dead link.
    //
    // Test files are skipped: this file mentions the pattern in a comment.
    const offenders = sourceFiles(srcDir)
      .filter((file) => !file.includes('.test.'))
      .filter((file) => /location\.hash\s*=/.test(fs.readFileSync(file, 'utf8')));
    expect(offenders.map((f) => path.relative(srcDir, f))).toEqual([]);
  });

  it('sends the Contrast challenge practice buttons to modes that exist', () => {
    const source = fs.readFileSync(path.join(srcDir, 'ContrastChallengeApp.jsx'), 'utf8');
    expect(source).toContain("navigate('/?mode=trig')");
    expect(source).toContain("navigate('/?mode=invtrig')");

    const app = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
    expect(app).toMatch(/\btrig:\s*\w+App/);
    expect(app).toMatch(/\binvtrig:\s*\w+App/);
  });

  it('keeps the base path when it navigates', () => {
    const router = fs.readFileSync(path.join(srcDir, 'lib', 'router.js'), 'utf8');
    expect(router).toContain('export function navigate');
    expect(router).toContain('BASE + path');
  });
});
