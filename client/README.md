# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

## Testing

Run unit tests:
```bash
npm test            # Single run
npm run test:watch  # Watch mode
```

### Writing Tests
- Test files live alongside source code using `*.test.js` or `*.test.jsx` extension (e.g. `src/lib/concept/conceptApi.test.js`).
- Framework: Vitest + `@testing-library/react` + `@testing-library/jest-dom` in `jsdom` environment.
- Mocking global `fetch`:
  ```js
  global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  ```
- Stubbing `localStorage` auth:
  ```js
  localStorage.setItem('tenali-auth-token', 'my-jwt-token');
  ```
