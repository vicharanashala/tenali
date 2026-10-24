---
name: tenali-modular-development
description: Enforce modular frontend and backend development in Tenali. Mandates isolated component files, proper routing, and strictly prohibits adding new monolithic code to App.jsx.
---

# Tenali Modular Development Skill

## 1. Purpose & Trigger
Use this skill whenever building a new learning module, quiz mode, interactive lab, or backend route. This skill prevents code bloat in [`client/src/App.jsx`](../../client/src/App.jsx) and enforces maintainable architecture across both client and server.

## 2. Prerequisites & Reference Patterns
- Extraction architecture: [`client/src/apps/README.md`](../../client/src/apps/README.md)
- Reference extracted app: [`client/src/apps/CoordGeomInteractiveApp.jsx`](../../client/src/apps/CoordGeomInteractiveApp.jsx)
- Golden subsystem model: [`client/src/monsters/`](../../client/src/monsters/)
- Pure tile registry: [`client/src/features/tiles.js`](../../client/src/features/tiles.js)
- Modular server routes: [`server/routes/`](../../server/routes/)

## 3. Mandatory Frontend Rules

### Never Add Module Bodies to `App.jsx`
- `client/src/App.jsx` is a legacy monolith (~67.4k lines) currently undergoing component extraction (epic #234).
- **Strict Prohibition**: Never write a new component body, state machine, or sub-app directly inside `App.jsx`.
- **Allowed `App.jsx` Edits**: Single-line `import` statement and a single-line wiring call in `modeMap` or URL route branches.

### Component Placement & Naming
1. **Standalone Quiz Apps**: Place in `client/src/apps/<ComponentName>.jsx` (e.g. `client/src/apps/DivisionApp.jsx`).
2. **Complex Subsystems**: Place in a dedicated directory under `client/src/<feature>/` (e.g. `client/src/division/` or `client/src/monsters/`), separating components, state logic, and styling.
3. **Export Convention**: Use default export for the root mode component:
   ```jsx
   export default function DivisionApp({ onBack }) { ... }
   ```
4. **Shared Helpers**: Import shared helpers from their dedicated modules or from `App.jsx` named exports:
   ```jsx
   import { QuizLayout, useTimer, useProgressSubmit } from '../App.jsx';
   ```

### Tile Registration
- When adding a new home-screen tile, append the metadata object to `TILES` in [`client/src/features/tiles.js`](../../client/src/features/tiles.js):
  ```js
  { key: 'division', name: 'Division', subtitle: 'Fair sharing & remainders', color: 'blue', category: 'number-foundations' }
  ```
- Keep `tiles.js` pure data: never import React components into `tiles.js`.

---

## 4. Mandatory Backend Rules

### Modular Router Modules
- Never append new endpoint handlers directly into `server/index.js`.
- Create a dedicated router in `server/routes/<domain>.js` (e.g. `server/routes/division.js`).
- Mount the router in `server/index.js` using a single line:
  ```js
  app.use('/api/division', require('./routes/division'));
  ```
- In `client/vite.config.js`, all `/api/*` endpoints are automatically proxied to port 4000. Avoid creating non-standard top-level prefixes (`/<topic>-api`) to avoid proxy proliferation.

---

## 5. Verification Checklist
- Run `cd client && npm run build` to verify module transformation and chunk emission.
- Ensure no circular evaluation errors occur at startup.
- Verify tests cover the extracted or newly created module.
