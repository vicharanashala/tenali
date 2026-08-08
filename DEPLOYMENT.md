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
