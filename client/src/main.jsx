/**
 * MAIN ENTRY POINT - REACT APPLICATION
 *
 * Initializes React and mounts the main App component to the DOM.
 * Renders inside the proctoring + i18n + accessibility provider stack
 * (proctoring was added by origin/new; i18n/accessibility on new_f).
 */

import React from 'react'; window.React = React;
import ReactDOM from 'react-dom/client'
import App, { AuthMenu } from './App.jsx'
import { GlobalXpPanel } from './components/HintSystem/HintModal.jsx';
import { ProctorProvider } from './proctor/ProctorContext';
import './index.css';
import './kid-zone.css';
import { I18nProvider } from './lib/i18n.jsx';
import { AccessibilityProvider } from './lib/AccessibilityProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <AccessibilityProvider>
        <ProctorProvider>
          <App />
          {/* Hamburger menu (login/logout) — fixed top-right, visible on every page */}
          <AuthMenu />
          <GlobalXpPanel />
        </ProctorProvider>
      </AccessibilityProvider>
    </I18nProvider>
  </React.StrictMode>,
)
