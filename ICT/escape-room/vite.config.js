import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served inside a sandboxed iframe at /ict/escape-room/.
// Relative base './' ensures static assets resolve cleanly both at /ict/escape-room/ and in local previews.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});