import express from 'express';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../App';
import serialize from 'serialize-javascript';

const app = express();

// Add cache control middleware
app.use((req, res, next) => {
  // Static assets cache policy
  if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
  // HTML cache policy
  else if (req.url.match(/\.html$/) || req.url === '/') {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  next();
});

// Serve static files
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Handle critical assets preloading
app.use('/api/critical-assets', (req, res) => {
  // Return list of critical assets based on route
  const route = req.query.route || '/';
  let assets = [];
  
  // Add route-specific critical assets
  switch (route) {
    case '/dashboard':
      assets = ['/static/images/dashboard-bg.jpg', '/static/js/dashboard.chunk.js'];
      break;
    case '/3d-models':
      assets = ['/static/js/models.chunk.js', '/static/textures/base-texture.jpg'];
      break;
    default:
      assets = ['/static/images/landing-bg.jpg', '/static/js/landing.chunk.js'];
  }
  
  res.json({ assets });
});

// Handle all requests
app.get('*', (req, res) => {
  // For 3D components, we'll render a basic version on the server
  // Full 3D functionality will hydrate on the client
  const context = {};
  
  // Determine if this route contains 3D content that should be handled differently in SSR
  const has3DContent = req.path.includes('/3d-models') || req.path.includes('/dji-control');
  
  // Render the app to string
  const appMarkup = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App ssrMode={true} />
    </StaticRouter>
  );

  // If there's a redirect from the StaticRouter context
  if (context.url) {
    return res.redirect(301, context.url);
  }

  // Read the HTML template
  fs.readFile(path.resolve('./build/index.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('An error occurred');
    }

    // Initial state to hydrate the app
    const initialState = {
      ssrCompleted: true,
      has3DContent,
      currentRoute: req.path
    };

    // Insert the rendered app and state into the HTML
    return res.send(
      data
        .replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`)
        .replace(
          '</head>',
          `<script>window.__INITIAL_STATE__ = ${serialize(initialState)};</script></head>`
        )
    );
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
