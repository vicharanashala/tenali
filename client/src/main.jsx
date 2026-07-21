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

import React from 'react'; window.React = React;
import ReactDOM from 'react-dom/client'
import App, { AuthMenu } from './App.jsx'
import './index.css';
import './kid-zone.css';
import { I18nProvider } from './lib/i18n.jsx';
import { AccessibilityProvider } from './lib/AccessibilityProvider.jsx';

// Create React root and render the App component
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: Enables additional development checks and warnings
  <React.StrictMode>
    <I18nProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
      {/* Hamburger menu (login/logout) — fixed top-right, visible on every page */}
      <AuthMenu />
    </I18nProvider>
  </React.StrictMode>,
)
