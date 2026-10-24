#!/usr/bin/env bash
#
# Tenali — droplet deployment script.
#
# This file is the source of truth for what runs on the droplet. It is
# committed to the repository and shipped to the box by
# .github/workflows/deploy.yml, so the script that executes on the server is
# always the script that was reviewed in a pull request.
#
# Every app is one row of the table below: a git branch, a checkout directory,
# a port, a client base path and a systemd unit. Adding a fourth app is a
# table row plus one unit file in systemd/ — nothing else in this file
# changes.
#
# Usage:
#   deploy.sh deploy <app>   checkout, build, install the unit, restart it
#   deploy.sh deploy all     deploy every app in the table
#   deploy.sh nginx          render + install the nginx site config
#   deploy.sh verify         HTTP checks against every app's local port
#   deploy.sh runtime        report the Node.js version the services run on
#   deploy.sh status         systemd status for every app
#
# Environment overrides:
#   TENALI_DEPLOY_ROOT   parent directory of the checkouts (default /home/tenali)
#   TENALI_REPO_URL      git remote used for fresh checkouts
#   PROD_HOST            hostname used when rendering the nginx template
#   NGINX_SITE           nginx site file to install (default sites-available/tenali)
#   TENALI_NODE_BIN      the node binary the services exec (default /usr/bin/node)

set -euo pipefail

DEPLOY_ROOT="${TENALI_DEPLOY_ROOT:-/home/tenali}"
REPO_URL="${TENALI_REPO_URL:-https://github.com/vicharanashala/tenali.git}"
PROD_HOST="${PROD_HOST:-tenali.fun}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="$SCRIPT_DIR/systemd"
NGINX_TEMPLATE="$SCRIPT_DIR/tenali-nginx.conf"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/tenali}"

# The runtime the services are allowed to start on. The units exec
# /usr/bin/node directly, so the version on the box is invisible to git
# unless this repository says what it should be. The floor itself lives in
# .nvmrc at the repository root; the checker below reads it from there, so
# there is exactly one place to update.
#
# 24.22.1 carries the October 21, 2026 Node.js security fixes:
# CVE-2026-111497 (Brotli decoder out-of-bounds write, HIGH) plus the TLS
# hostname-verification and DNS advisories in the same release.
NODE_BIN="${TENALI_NODE_BIN:-/usr/bin/node}"
NODE_CHECKER="$SCRIPT_DIR/check-node-version.js"

APPS=(main root matrixmystics)

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[deploy]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[deploy]\033[0m %s\n' "$*" >&2; exit 1; }

# check_node_runtime — refuse to work on an unpatched runtime.
#
# The check runs against the binary the services will actually exec, not
# whatever `node` happens to resolve to in this shell: an nvm or tarball
# install puts a newer binary on PATH and leaves /usr/bin/node untouched.
check_node_runtime() {
  [ -x "$NODE_BIN" ] || die "$NODE_BIN not found or not executable — the systemd units exec it directly"
  [ -f "$NODE_CHECKER" ] || die "missing $NODE_CHECKER — the runtime floor check has to ship with the deploy script"

  local observed floor
  observed="$("$NODE_BIN" -p 'process.versions.node')"
  floor="$("$NODE_BIN" "$NODE_CHECKER" --print)" || die "could not read the required Node version from .nvmrc"

  if ! "$NODE_BIN" "$NODE_CHECKER" >/dev/null; then
    die "Node.js $observed at $NODE_BIN is older than the required $floor — patch the runtime before deploying (see DEPLOYMENT.md)"
  fi

  log "runtime OK: Node.js $observed ($NODE_BIN), required $floor"
}

# app_spec <app> — prints "dir|branch|port|base|unit" for a known app key.
app_spec() {
  case "$1" in
    main)
      echo "tenali|main|4001|/summership/|tenali.service"
      ;;
    root)
      echo "tenali-root|tenali-root|4003|/|tenali-root.service"
      ;;
    matrixmystics)
      echo "tenali-matrixmystics|matrix-mystics|4004|/matrixmystics/|tenali-matrixmystics.service"
      ;;
    *)
      return 1
      ;;
  esac
}

field() { printf '%s\n' "$1" | cut -d'|' -f"$2"; }

# app_field <app> <index> — one column of the app row.
app_field() {
  local spec
  spec="$(app_spec "$1")" || return 1
  field "$spec" "$2"
}

app_dir() { printf '%s\n' "$DEPLOY_ROOT/$(app_field "$1" 1)"; }
app_branch() { app_field "$1" 2; }
app_port() { app_field "$1" 3; }
app_base() { app_field "$1" 4; }
app_unit() { app_field "$1" 5; }

require_app() {
  app_spec "$1" >/dev/null 2>&1 || die "unknown app '$1' (known: ${APPS[*]}, all)"
}

# sync_checkout <app> — make the app's checkout match the tip of its branch.
sync_checkout() {
  local app="$1" dir branch
  dir="$(app_dir "$app")"
  branch="$(app_branch "$app")"

  if [ ! -d "$dir/.git" ]; then
    log "$app: cloning $branch into $dir"
    mkdir -p "$(dirname "$dir")"
    git clone --branch "$branch" --single-branch "$REPO_URL" "$dir"
    return
  fi

  log "$app: fetching $branch"
  git -C "$dir" fetch --quiet origin "$branch"
  git -C "$dir" checkout --quiet "$branch"
  # A deploy checkout is disposable: local edits on the box are never wanted.
  git -C "$dir" reset --quiet --hard "origin/$branch"
}

# build_app <app> — install dependencies and build the client + server.
build_app() {
  local app="$1" dir base
  dir="$(app_dir "$app")"
  base="$(app_base "$app")"

  # Fail before anything is installed or built: a deploy onto an unpatched
  # runtime would produce a service that serves traffic on a Node.js release
  # with known advisories.
  check_node_runtime

  log "$app: installing client dependencies"
  npm --prefix "$dir/client" ci

  log "$app: building client with VITE_BASE_PATH=$base"
  VITE_BASE_PATH="$base" npm --prefix "$dir/client" run build

  log "$app: installing server dependencies"
  npm --prefix "$dir/server" ci --omit=dev
}

# install_unit <app> — install the unit file and reload the systemd manager.
install_unit() {
  local app="$1" unit src
  unit="$(app_unit "$app")"
  src="$SYSTEMD_DIR/$unit"
  [ -f "$src" ] || die "missing unit file $src"

  log "$app: installing systemd unit $unit"
  sudo install -m 0644 "$src" "/etc/systemd/system/$unit"
  sudo systemctl daemon-reload
  sudo systemctl enable "$unit" >/dev/null 2>&1 || true
}

# restart_app <app> — restart the unit and fail fast if it does not stay up.
restart_app() {
  local app="$1" unit
  unit="$(app_unit "$app")"
  log "$app: restarting $unit"
  sudo systemctl restart "$unit"
  sleep 2
  if ! sudo systemctl is-active --quiet "$unit"; then
    sudo systemctl status "$unit" --no-pager --lines=20 || true
    die "$app: $unit did not come up after restart"
  fi
}

deploy_app() {
  local app="$1" port
  require_app "$app"
  sync_checkout "$app"
  build_app "$app"
  install_unit "$app"
  restart_app "$app"
  port="$(app_port "$app")"
  log "$app: live on 127.0.0.1:$port"
}

# render_nginx — turn the template into a real site file.
#
# The template ships with <PROD_HOST> placeholders so no hostname is baked
# into git; the rendered copy is what nginx actually loads.
render_nginx() {
  local out="$1"
  sed -e "s|<PROD_HOST>|${PROD_HOST}|g" \
      -e "s|<LETSENCRYPT_EMAIL>|${LETSENCRYPT_EMAIL:-admin@${PROD_HOST}}|g" \
      "$NGINX_TEMPLATE" >"$out"
}

# install_nginx — install the site config, keeping the previous copy until
# nginx has validated the new one.
install_nginx() {
  local rendered backup
  [ -f "$NGINX_TEMPLATE" ] || die "missing nginx template $NGINX_TEMPLATE"

  rendered="$(mktemp)"
  backup="${NGINX_SITE}.bak.$(date +%Y%m%d%H%M%S)"
  render_nginx "$rendered"

  log "nginx: installing $NGINX_SITE"
  if [ -f "$NGINX_SITE" ]; then
    sudo cp "$NGINX_SITE" "$backup"
    warn "nginx: previous config backed up to $backup"
  fi
  sudo install -m 0644 "$rendered" "$NGINX_SITE"

  if ! sudo nginx -t; then
    warn "nginx: configuration test failed — rolling back"
    if [ -f "$backup" ]; then
      sudo cp "$backup" "$NGINX_SITE"
      sudo nginx -t || true
    else
      sudo rm -f "$NGINX_SITE"
    fi
    rm -f "$rendered"
    die "nginx: rolled back to the previous configuration"
  fi

  sudo systemctl reload nginx
  rm -f "$rendered"
  log "nginx: configuration reloaded"
}

# verify — check that every app answers on its own port.
verify_app() {
  local app="$1" port path
  require_app "$app"
  port="$(app_port "$app")"
  path="$(app_base "$app")"
  [ "$path" = "/" ] || path="${path%/}"

  printf '%-16s port %-5s path %-16s ' "$app" "$port" "$path"
  curl -sS -o /dev/null -w 'HTTP %{http_code}\n' "http://127.0.0.1:${port}${path}/" || true
}

# verify_runtime — report the runtime the services are actually running on.
#
# "We updated Node" is easy to believe and hard to prove: the version file
# changed, the PR merged, the release notes say so — and the process serving
# requests is still the old runtime. This command prints the observed
# version next to the required one, so the claim can be checked against the
# thing that is actually running. It exits non-zero when the runtime is
# below the floor, so it can be used as a gate.
verify_runtime() {
  if [ ! -x "$NODE_BIN" ]; then
    printf '%-16s %s not found or not executable — the systemd units exec it directly\n' "runtime" "$NODE_BIN" >&2
    return 1
  fi
  if [ ! -f "$NODE_CHECKER" ]; then
    printf '%-16s missing %s — the runtime floor check has to ship with the deploy script\n' "runtime" "$NODE_CHECKER" >&2
    return 1
  fi

  local observed floor
  observed="$("$NODE_BIN" -p 'process.versions.node')"
  floor="$("$NODE_BIN" "$NODE_CHECKER" --print)" || {
    printf '%-16s could not read the required Node version from .nvmrc\n' "runtime" >&2
    return 1
  }

  printf '%-16s running %-10s required %-10s ' "runtime" "$observed" "$floor"
  if "$NODE_BIN" "$NODE_CHECKER" >/dev/null; then
    printf 'OK\n'
    return 0
  fi

  printf 'TOO OLD\n' >&2
  return 1
}

usage() {
  sed -n '3,24p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

main() {
  local command="${1:-}"
  shift || true

  case "$command" in
    deploy)
      local target="${1:-all}"
      if [ "$target" = "all" ]; then
        local app
        for app in "${APPS[@]}"; do deploy_app "$app"; done
      else
        deploy_app "$target"
      fi
      ;;
    nginx)
      install_nginx
      ;;
    verify)
      local app
      for app in "${APPS[@]}"; do verify_app "$app"; done
      verify_runtime
      ;;
    runtime)
      verify_runtime
      ;;
    status)
      local app
      for app in "${APPS[@]}"; do
        sudo systemctl --no-pager --lines=5 status "$(app_unit "$app")" || true
      done
      ;;
    "" | -h | --help | help)
      usage
      ;;
    *)
      die "unknown command '$command' (try: deploy, nginx, verify, status)"
      ;;
  esac
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  main "$@"
fi
