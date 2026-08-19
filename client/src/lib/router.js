// Base-aware routing utility.
// Fixes the Layer B subpath bug: pathname checks in App.jsx were comparing
// '/chapter5' against '/summership/chapter5' — always false under subpath deploy.
//
// Usage (in App.jsx, replace the existing pathname derivation):
//   import { getPathname, navigate } from './lib/router';
//   const pathname = getPathname();      // '/chapter5' regardless of base
//   navigate('/profile');                // works under any base

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // '' or '/summership'

export function getPathname() {
  return window.location.pathname
    .replace(BASE, '')
    .replace(/\/$/, '')
    .toLowerCase() || '/';
}

export function navigate(path) {
  window.location.href = BASE + path;
}

export function getMode() {
  return new URLSearchParams(window.location.search).get('mode');
}

export function setMode(key) {
  const url = key ? `${BASE}/?mode=${key}` : `${BASE}/`;
  history.replaceState(null, '', url);
}
