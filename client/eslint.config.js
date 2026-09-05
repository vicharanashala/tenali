import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-restricted-syntax': [
        'error',
        {
          // Catches: window.location.href = '/bare-path'
          // Allows:  window.location.href = withBase('/path')  (right.callee.name === 'withBase')
          // Allows:  navigate() in lib/router.js               (eslint-disable comment there)
          selector: "AssignmentExpression[left.object.object.name='window'][left.object.property.name='location'][left.property.name='href']:not([right.callee.name='withBase'])",
          message: "Do not assign to window.location.href directly. Use withBase('/path') or navigate() from ./lib/router.js.",
        },
      ],
    },
  },
])
