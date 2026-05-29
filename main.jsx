/**
 * main.jsx — React application entry point
 *
 * Bootstraps the React tree inside the element with id="root"
 * (see index.html). Wraps the tree in StrictMode for extra
 * development-time checks (double-invoke of effects, etc.).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Global base styles (Tailwind directives + custom CSS variables)
import './index.css'

// Root application component — handles auth, routing, and all views
import App from './App.jsx'

// Mount the React tree
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)