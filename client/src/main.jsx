/**
 * MAIN ENTRY POINT - REACT APPLICATION
 *
 * Initializes React and mounts the main App component to the DOM.
 * Renders inside the proctoring + i18n + accessibility provider stack
 * (proctoring was added by origin/new; i18n/accessibility on new_f).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App, { AuthMenu } from './App.jsx';
import { GlobalXpPanel } from './components/HintSystem/HintModal.jsx';
// import { CONFIG } from './config.js';
import './index.css';
import './kid-zone.css';
import { AccessibilityProvider } from './lib/AccessibilityProvider.jsx';
import { I18nProvider } from './lib/i18n.jsx';
import { ProctorProvider } from './proctor/ProctorContext';
window.React = React;

// const router = createBrowserRouter(
//   [
//     {
//       path: '/',
//       element: <App />,
//       children: [
        
//       ],
//     },
//     {
//       path: '*',
//       element: <App />,
//     },
//   ],
//   {
//     basename: CONFIG.baseUrl,
//   }
// );

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <AccessibilityProvider>
        <ProctorProvider>
          {/* <RouterProvider router={router} /> */}
          <App />
          {/* Hamburger menu (login/logout) — fixed top-right, visible on every page */}
          <AuthMenu />
          <GlobalXpPanel />
        </ProctorProvider>
      </AccessibilityProvider>
    </I18nProvider>
  </React.StrictMode>,
);
