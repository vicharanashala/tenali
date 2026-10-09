/// <reference types="vitest" />
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Reuse vite.config.js (React plugin, resolve.dedupe, base path) instead of
// re-declaring it here, then layer the test-only settings on top. See issue #294.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.js'],
      exclude: [
        ...configDefaults.exclude,
        // Plain-Node smoke scripts that self-run via `node <file>` and contain
        // no Vitest suites (their headers say so). Keep them excluded until
        // they are ported to Vitest.
        'src/monsters/__tests__/**',
      ],
    },
  }),
)
