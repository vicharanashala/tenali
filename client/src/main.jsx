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
 *
 * ─── Profile Provider ─────────────────────────────────────────────────────
 * <ProfilesProvider> wraps both <App /> and <AuthMenu /> because:
 *   - <App /> -> <AppGate /> calls useProfiles() for the picker gate.
 *   - <AuthMenu /> shows the active learner name + switch-profile item.
 * Mounting the provider here (instead of inside <App />) lets all global
 * UI consume useProfiles(), including AuthMenu which is a sibling of App.
 */

/* eslint-disable react-refresh/only-export-components */
// main.jsx is the entry point — Fast Refresh's "exports" rule doesn't
// apply here because there's nothing to refresh.

import React from 'react'; window.React = React;
import ReactDOM from 'react-dom/client'
import App, { AuthMenu, useAuth } from './App.jsx?v=2'
import { ProfilesProvider } from './hooks/useProfiles.jsx'
import './index.css'
import './kid-zone.css'

function Root() {
  const { user } = useAuth()
  return (
    <ProfilesProvider authUser={user}>
      <App />
      {/* Hamburger menu (login/logout/profile) — fixed top-right, on every page */}
      <AuthMenu />
    </ProfilesProvider>
  )
}

// Create React root and render the App component
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: Enables additional development checks and warnings
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
