/**
 * VITE BUILD CONFIGURATION - MAIN CLIENT
 *
 * Configuration file for Vite (build tool and development server) for the main Tenali client.
 * Defines how React components are built and how the development server proxies API requests.
 *
 * This is the unified entry point for the Tenali platform that aggregates multiple quiz modules.
 *
 * Build Configuration:
 * - React plugin: Enables JSX/React syntax support
 * - Base path: '/' (serves from root, no subdirectory)
 * - Outputs to dist directory after build
 *
 * Development Server:
 * - Host: 0.0.0.0 (accessible from any IP)
 * - Port: 5173 (standard Vite default port)
 * - Proxying: Redirects API calls to backend services on port 4000
 *
 * API Proxy Routes:
 * All API requests are proxied to a central backend at http://127.0.0.1:4000
 * This allows the dev server and different modules to be served from a single origin
 * without CORS issues during development.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Serves from root path (no /sub/path)
  base: '/',
  // Enable React support for JSX compilation
  plugins: [react()],
  server: {
    // Listen on all network interfaces (0.0.0.0) for development
    host: '0.0.0.0',
    // Development server port
    port: 5173,
    // API proxy configuration: Forward API requests to backend services
    proxy: {
      // Primary API endpoint - routes to main quiz service
      '/api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // General Knowledge quiz API
      '/gk-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Addition quiz API
      '/addition-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Quadratic equations quiz API
      '/quadratic-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Square root estimation quiz API
      '/sqrt-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Multiplication quiz API
      '/multiply-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Vocabulary quiz API
      '/vocab-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Polynomial multiplication quiz API
      '/polymul-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Polynomial factoring quiz API
      '/polyfactor-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Prime factorization quiz API
      '/primefactor-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Quadratic formula quiz API
      '/qformula-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Systems of equations quiz API
      '/simul-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Function evaluation quiz API
      '/funceval-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Linear equations quiz API
      '/lineq-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Basic arithmetic quiz API
      '/basicarith-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Fraction addition quiz API
      '/fractionadd-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Surds quiz API
      '/surds-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Indices quiz API
      '/indices-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Sequences & Series quiz API
      '/sequences-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Ratio & Proportion quiz API
      '/ratio-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Percentages quiz API
      '/percent-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      // Sets quiz API
      '/sets-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/trig-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/ineq-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/coordgeom-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/prob-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/stats-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/matrix-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/vectors-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/transform-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/mensur-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/bearings-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/log-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/diff-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/bases-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/circle-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/integ-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/stdform-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/bounds-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/sdt-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/variation-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/hcflcm-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/profitloss-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/rounding-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/binomial-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/complex-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/angles-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/triangles-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/congruence-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/pythag-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/polygons-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
      '/similarity-api': { target: 'http://127.0.0.1:4000', changeOrigin: true },
    },
  },
})
