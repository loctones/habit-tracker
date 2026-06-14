import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

/**
 * Application entry point.
 *
 * Mounts the React app into the #root div defined in index.html.
 * StrictMode is enabled to surface potential issues during development;
 * it has no effect on the production build.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
