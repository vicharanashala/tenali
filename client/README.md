# Tenali Client Frontend (`client/`)

This directory contains the React 19 + Vite 8 single-page application (SPA) for Tenali.

---

## 1. Architecture Overview

- **Framework:** React 19 with Vite 8.
- **Routing & Navigation:** SPA routing managed through tile registries and component mappings in `src/features/tiles.js`.
- **Styling:** Central CSS design tokens defined in `src/App.css` (Dark theme default with toggleable Light theme).
- **Backend Communication:** Proxied via Vite development server (`vite.config.js`) to Express on port 4000.

---

## 2. Directory Structure

```text
client/
├── package.json              # Client dependencies and npm scripts
├── vite.config.js            # Vite build configuration and 40+ proxy routes
├── vitest.config.js          # Vitest testing environment configuration
├── test/
│   └── setup.js              # Test setup, localStorage mocking, RTL matchers
├── src/
│   ├── main.jsx              # React DOM entry point
│   ├── App.jsx               # Monolithic component registry (~67.4k lines) [RED ZONE]
│   ├── App.css               # Global CSS design tokens and theme variables
│   ├── apps/                 # Modular, extracted learning applications
│   ├── components/           # Shared UI widgets, modals, and navigation bars
│   ├── features/             # Feature definitions and tiles catalog (tiles.js)
│   └── lib/                  # Concept APIs, mastery models, and client utilities
```

---

## 3. Development Scripts

From inside the `client/` directory:

```bash
# Start local development server (http://localhost:5173)
npm run dev

# Run unit tests with Vitest (matches CI)
npm test

# Run unit tests in interactive watch mode
npm run test:watch

# Run ESLint (baseline: 0 errors, 117 warnings)
npm run lint

# Build production bundle to dist/
npm run build

# Build for subpath deployment (/summership/)
VITE_BASE_PATH=/summership/ npm run build
```

---

## 4. Engineering & Safety Guidelines

### 4.1 Concurrency Lock Zones
- **`src/App.jsx` is in the RED ZONE (Hard Lock).** Do NOT modify this file unless specifically assigned.
- Build new features as modular components under `src/apps/<module-name>/` or `src/components/`.
- For multi-agent rules, see [`../../AGENTS.md`](../AGENTS.md).

### 4.2 UI Design Tokens
- Never use hardcoded hex colors or arbitrary inline margins.
- Always use the global variables defined in `src/App.css` (`var(--clr-bg)`, `var(--clr-accent)`, `var(--radius)`, etc.).
- See [`../docs/design/ui-guidelines.md`](../docs/design/ui-guidelines.md) for full design system rules and styling patterns.

### 4.3 Testing Standards
- Write tests with Vitest and React Testing Library (`*.test.js` or `*.test.jsx`).
- Colocate tests next to the code under test (e.g. `src/lib/concept/conceptApi.test.js`).
- Never make live network requests in unit tests; stub `fetch` with `vi.stubGlobal` / `vi.fn()`.
