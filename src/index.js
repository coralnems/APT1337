import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');

// Check if we're hydrating server-rendered content
if (rootElement.hasChildNodes() && window.__INITIAL_STATE__) {
  hydrateRoot(
    rootElement,
    <App />
  );
} else {
  // Client-side render for development
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Register service worker for production environment
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
reportWebVitals();
