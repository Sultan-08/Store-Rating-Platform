/**
 * @file src/main.jsx
 * @description Entry point for the pure React.js + Vite application.
 *
 * Scalability & Maintainability:
 * - Bootstraps React application root.
 * - Imports main stylesheet (no inline CSS used in components).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
