# Tenali deployment

## Topology

Tenali is a single Express process that serves everything: the React build,
every `/<type>-api/*`, every `/api/*`, Socket.IO, and the static Graph and
Enhanced pages. nginx sits in front as the TLS terminator and reverse proxy.

```
Internet
   │
   ▼
nginx :443 (TLS via Let's Encrypt)
   │   proxy_pass http://127.0.0.1:4000
   ▼
tenali.service (systemd, runs as the `tenali` user)
   │
   ▼
node server/index.js → listens on :4000
   ├── client/dist/         (the React bundle built by `cd client && npm run build`)
   ├── chitragupta/         (991 GK question JSONs — loaded at startup)
   ├── vocab/               (7,662 vocab JSONs — loaded at startup)
   └── MongoDB (optional — falls back to in-memory mode)
```

A template nginx config lives at [`server/deploy/tenali-nginx.conf`](server/deploy/tenali-nginx.conf).

## Sub-path deployments (`/summership/`)

Tenali's canonical production mount point is `/summership/`. The same Express
process also serves the domain root and redirects it to `/summership/`
(see `SUBPATH_REDIRECT` in `server/index.js`).

To rebuild for a sub-path:

```bash
cd client
VITE_BASE_PATH=/summership/ npm run build
```

The build emits assets under `client/dist/summership/assets/`. nginx and
Express must both serve from `client/dist/` — `client/dist/index.html` is
the SPA entry for the sub-path build.

### Why a separate "root" deployment breaks

A common foot-gun is to ALSO deploy `client/dist/` as a static-only nginx
site at `https://tenali.fun/` while the Express process lives behind
`https://tenali.fun/summership/`. That root static build is then months
out of date, AND every API call it makes goes to `/api/*` (not
`/summership/api/*`) which nginx serves as the stale `index.html` instead
of proxying to Express — the user sees a white screen with no errors.

If you see `GET /api/progress/raw` returning `text/html` with
`Last-Modified: <old date>` in production, this is the bug. The fix is in
`server/deploy/tenali-nginx.conf`: the template proxies `/` to Express,
which then either serves the SPA at `/summership/` directly or 302-redirects
the bare `/` path there.

## Runtime

The services run `/usr/bin/node`, so the version on the box is invisible to
git unless this repository says what it should be.

**Required version: `24.22.1`** — pinned in [`.nvmrc`](.nvmrc), mirrored in
`server/package.json` (`engines.node`) and `render.yaml` (`NODE_VERSION`).
A test in `server/__tests__/runtimeVersion.test.js` fails if those four
places drift apart.

24.22.1 is the release that carries the **October 21, 2026** Node.js security
fixes:

| Advisory | Severity | What it was |
|---|---|---|
| CVE-2026-111497 | HIGH | Brotli decoder out-of-bounds write → remote code execution |
| CVE-2026-105483, CVE-2026-106069, CVE-2026-106072 | HIGH / MEDIUM | TLS certificate hostname verification bypasses |
| CVE-2026-105482 | HIGH | `dns.resolve*()` silently truncates hostnames containing a NUL byte |
| CVE-2026-105481 | MEDIUM | Keep-alive socket can accept a response sent before the request |

Older lines (22.23.4, 26.12.1) carry the same fixes. Lines that are already
end-of-life receive none of them, so staying on an EOL line means the next
release does not reach the box at all.

### Reading the version that is actually running

```bash
node -v                     # the version this shell resolves
/usr/bin/node -v            # the version the systemd unit execs — this is the one
systemctl cat tenali | grep ExecStart
```

The two can differ: an `nvm` or tarball install puts a newer binary on
`PATH` and leaves `/usr/bin/node` untouched, and the unit runs the latter.

### Patching the box

Use a NodeSource install so `/usr/bin/node` itself is replaced — `nvm`
installs under `~/.nvm` and the unit would keep starting the old binary.

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
/usr/bin/node -v                                  # expect v24.22.1 or newer
sudo systemctl restart tenali
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://tenali.fun/summership/
```

A restart is required: the running process keeps the old binary until it is
restarted.

## Environment

Required in production:

| Var | Default | Notes |
|-----|---------|-------|
| `NODE_ENV` | — | Must be `production`. Triggers JWT fail-fast. |
| `JWT_SECRET` | dev fallback | **Required.** Server refuses to start in production without it. |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/tenali` | If unreachable, auth falls back to in-memory. |
| `TENALI_SEED_USERS` | empty | `user:pass[,user:pass:admin,…]`. One admin required for proctor dashboard. |
| `JWT_TTL` | `14d` | Token lifetime. |
| `CORS_ORIGINS` | `https://tenali.fun,…` | Comma-separated allowlist. |
| `SUBPATH_REDIRECT` | `/summership` | Root → sub-path 302. Empty/`/` disables. |
| `VITE_BASE_PATH` | `/` | Build-time client base path. Set to `/summership/` for the sub-path build. |

## Deploy flow

The GitHub Actions workflow at `.github/workflows/deploy.yml` runs on every
push to `main`:

1. SSH into the droplet as the `tenali` user
2. `git pull` the latest
3. `cd client && npm install && npm run build` (with `VITE_BASE_PATH=/summership/`)
4. `cd ../server && npm install`
5. `sudo systemctl restart tenali`

If you change `server/index.js`, the restart picks it up. If you change
anything under `client/src/`, the build is required first — otherwise the
restart just serves the old bundle.
