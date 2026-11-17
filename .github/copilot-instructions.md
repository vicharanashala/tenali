# GitHub Copilot Instructions — Tenali

All AI coding assistants and Copilot workspace sessions in this repository must comply with the universal rules defined in [`AGENTS.md`](../AGENTS.md) and consult [`docs/map.md`](../docs/map.md) for navigation and source-of-truth rules.

## Core Rules for Copilot
1. **Never append new components to `client/src/App.jsx`**. Place new modules in `client/src/apps/<Name>.jsx` or under `client/src/<feature>/`.
2. **Never commit hardcoded mocks as live production data** (FLN #449 policy). Always render real loading, error, or empty states.
3. **Follow the modular design system** in `client/src/App.css` using global CSS variables (`var(--clr-accent)`, `var(--radius)`, `var(--font-body)`).
4. **Local Verification**:
   - Zero-dependency check: `node server/lib/bkt.test.js`
   - Frontend build: `cd client && npm run build`
   - Frontend lint: `cd client && npm run lint`
5. Refer to [`skills/`](../skills/) for specialized procedures (governance, modularity, code review, RFCs).
