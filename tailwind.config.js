/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy backgrounds
        navy: {
          950: '#06090f',
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a3058',
        },
        // Warm amber accents
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Soft cream for text on dark
        cream: {
          100: '#fefcf3',
          200: '#faf6eb',
          300: '#f5edd8',
        },
        // Electric teal - CORRECT accent
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Muted coral - WRONG/WARNING accent
        coral: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      fontFamily: {
        // Serif display for theorem names
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Clean sans-serif for body and questions
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Mono for formulas/code
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}