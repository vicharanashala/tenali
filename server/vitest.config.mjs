import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    hookTimeout: 60000,  // server startup (MongoDB connect + data load) can take >10 s
    testTimeout: 15000,
    exclude: [
      '**/node_modules/**',
      'lib/bkt.test.js',  // plain-node assert file, run via `npm run test:bkt`
    ],
  },
});
