/**
 * MAIN ENTRY POINT - REACT APPLICATION
 *
 * This is the root entry file for the Tenali React application.
 * Initializes React and mounts the main App component to the DOM.
 *
 * Flow:
 * 1. React and ReactDOM are imported
 * 2. App component (main quiz interface) is imported
 * 3. Global styles (index.css) are imported
 * 4. React root is created on the #root DOM element
 * 5. App is rendered inside StrictMode for development checks
 *
 * StrictMode Benefits:
 * - Highlights potential problems in component code
 * - Detects unsafe lifecycles
 * - Warns about legacy string ref API usage
 * - Identifies components with missing keys in lists
 * - Development-only, stripped in production build
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App, { AuthMenu } from './App'
import './index.css'

// Create React root and render the App component
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: Enables additional development checks and warnings
  <React.StrictMode>
    <App />
    {/* Hamburger menu (login/logout) — fixed top-right, visible on every page */}
    <AuthMenu />
  </React.StrictMode>,
)
