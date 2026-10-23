import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const deployDir = path.join(here, '..', 'deploy');
const repoRoot = path.join(here, '..', '..');

const deployScript = path.join(deployDir, 'deploy.sh');
const nginxConf = path.join(deployDir, 'tenali-nginx.conf');
const workflow = path.join(repoRoot, '.github', 'workflows', 'deploy.yml');
const deploymentDoc = path.join(repoRoot, 'DEPLOYMENT.md');

const read = (file) => readFileSync(file, 'utf8');

let scriptSource = '';
let appTable = {};

beforeAll(() => {
  scriptSource = read(deployScript);
  const output = execFileSync('bash', ['-c', `source "${deployScript}" && for app in main root matrixmystics; do app_spec "$app"; done`], {
    encoding: 'utf8',
  });
  const rows = output.trim().split('\n');
  const keys = ['main', 'root', 'matrixmystics'];
  rows.forEach((row, index) => {
    const [dir, branch, port, base, unit] = row.split('|');
    appTable[keys[index]] = { dir, branch, port, base, unit };
  });
});

describe('deploy script', () => {
  it('is committed and executable', () => {
    expect(existsSync(deployScript)).toBe(true);
    expect(statSync(deployScript).mode & 0o111).toBeGreaterThan(0);
  });

  it('is valid bash', () => {
    expect(() => execFileSync('bash', ['-n', deployScript], { encoding: 'utf8' })).not.toThrow();
  });

  it('declares every app with a branch, port, base path and systemd unit', () => {
    expect(Object.keys(appTable).sort()).toEqual(['main', 'matrixmystics', 'root']);
    for (const app of Object.values(appTable)) {
      expect(app.branch).toMatch(/^[a-z0-9-]+$/);
      expect(app.port).toMatch(/^\d+$/);
      expect(app.base).toMatch(/^\//);
      expect(app.unit).toMatch(/\.service$/);
    }
  });

  it('binds the matrixmystics app to port 4004 and the /matrixmystics/ base path', () => {
    expect(appTable.matrixmystics.port).toBe('4004');
    expect(appTable.matrixmystics.base).toBe('/matrixmystics/');
    expect(appTable.matrixmystics.branch).toBe('matrix-mystics');
    expect(appTable.matrixmystics.unit).toBe('tenali-matrixmystics.service');
  });

  it('keeps the main app and the root app on their own ports', () => {
    expect(appTable.main.port).toBe('4001');
    expect(appTable.main.base).toBe('/summership/');
    expect(appTable.root.port).toBe('4003');
    expect(appTable.root.base).toBe('/');
  });

  it('builds the client with the app base path', () => {
    expect(scriptSource).toContain('VITE_BASE_PATH="$base"');
  });

  it('never hardcodes a credential', () => {
    expect(scriptSource).not.toMatch(/JWT_SECRET=\S/);
    expect(scriptSource).not.toMatch(/MONGO_URI=\S/);
  });
});

describe('nginx site template', () => {
  const conf = read(nginxConf);

  it('proxies /matrixmystics/ to the matrixmystics app instead of serving files', () => {
    const block = conf.match(/location \/matrixmystics\/ \{[^}]*\}/);
    expect(block).not.toBeNull();
    expect(block[0]).toContain('proxy_pass http://127.0.0.1:4004/;');
    expect(block[0]).not.toMatch(/\b(root|alias)\b/);
  });

  it('redirects the bare /matrixmystics path to the trailing-slash form', () => {
    expect(conf).toMatch(/location = \/matrixmystics \{[^}]*return 301 \/matrixmystics\/;/);
  });

  it('proxies every app location instead of mounting a static build', () => {
    const proxyPasses = [...conf.matchAll(/proxy_pass http:\/\/127\.0\.0\.1:(\d+)/g)].map((m) => m[1]);
    expect(new Set(proxyPasses)).toEqual(new Set(Object.values(appTable).map((app) => app.port)));
    expect(conf).not.toMatch(/^\s*(root|alias)\s+\/home/m);
  });
  it('strips the sub-path prefix so the app sees its own root', () => {
    expect(conf).toContain('proxy_pass http://127.0.0.1:4001/;');
    expect(conf).toContain('proxy_pass http://127.0.0.1:4004/;');
  });
});

describe('systemd units', () => {
  for (const [app, spec] of Object.entries({
    main: { port: '4001', base: '/summership' },
    root: { port: '4003', base: '/' },
    matrixmystics: { port: '4004', base: '/' },
  })) {
    it(`ships a unit for ${app} on port ${spec.port}`, () => {
      const unitPath = path.join(deployDir, 'systemd', appTable[app].unit);
      expect(existsSync(unitPath)).toBe(true);
      const unit = read(unitPath);
      expect(unit).toContain(`Environment=PORT=${spec.port}`);
      expect(unit).toContain(`Environment=SUBPATH_REDIRECT=${spec.base}`);
      expect(unit).toContain('ExecStart=/usr/bin/node');
      expect(unit).toContain('server/index.js');
      expect(unit).toContain('Restart=always');
    });
  }

  it('runs the matrixmystics unit from its own checkout', () => {
    const unit = read(path.join(deployDir, 'systemd', 'tenali-matrixmystics.service'));
    expect(unit).toContain('WorkingDirectory=/home/tenali/tenali-matrixmystics');
    expect(unit).toContain('/home/tenali/tenali-matrixmystics/server/index.js');
  });
});

describe('deploy workflow', () => {
  const yaml = read(workflow);

  it('ships the repository copy of the deploy script before running it', () => {
    expect(yaml).toContain('tar -C server/deploy -czf -');
    expect(yaml).toContain('/home/tenali/deploy/deploy.sh');
  });

  it('deploys on a push to main and to the matrix-mystics branch', () => {
    expect(yaml).toMatch(/branches:\s*\[main, matrix-mystics\]/);
  });

  it('maps the matrix-mystics branch to the matrixmystics app', () => {
    expect(yaml).toContain('target="matrixmystics"');
  });

  it('does not run a script that is not in the repository', () => {
    expect(yaml).not.toContain("'bash /home/tenali/deploy.sh'");
  });
});

describe('deployment documentation', () => {
  const doc = read(deploymentDoc);

  it('documents every app, its port and its public path', () => {
    expect(doc).toContain('4001');
    expect(doc).toContain('4003');
    expect(doc).toContain('4004');
    expect(doc).toContain('/matrixmystics/');
    expect(doc).toContain('server/deploy/deploy.sh');
  });
});
