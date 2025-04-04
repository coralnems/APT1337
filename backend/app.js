const express = require('express');
const corsMiddleware = require('./cors-config');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const DJIWebSocketServer = require('./websockets/dji-realtime');
const redisService = require('./services/redisService');
require('dotenv').config();

// Import routers
const modelsRouter = require('./routes/models');
const djiRouter = require('./routes/dji');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const djiWs = new DJIWebSocketServer(server);

// Define port
const PORT = process.env.PORT || 5000;

// Configure Redis session store
const sessionStore = new RedisStore({ 
  client: redisService.client,
  prefix: 'sess:'
});

// Session configuration with fallback for Redis connection issues
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'vortex-drones-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  },
  // Fallback to memory store if Redis is unavailable
  unset: 'destroy'
}));

// Apply CORS middleware
app.use(corsMiddleware);

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/thumbnails', express.static(path.join(__dirname, 'public/thumbnails')));

// Basic route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Redis status endpoint
app.get('/redis-status', async (req, res) => {
  try {
    // Set a test value
    await redisService.setAsync('health-check', 'ok');
    const value = await redisService.getAsync('health-check');
    
    if (value === 'ok') {
      res.status(200).json({ status: 'Redis connected', timestamp: new Date() });
    } else {
      res.status(500).json({ status: 'Redis read/write error', timestamp: new Date() });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'Redis connection error',
      error: error.message,
      timestamp: new Date() 
    });
  }
});

// Apply routers
app.use('/api/3d-models', modelsRouter);
app.use('/api/dji', djiRouter);

// Example route with specific CORS settings
app.options('/api/special-route', corsMiddleware);
app.get('/api/special-route', corsMiddleware, (req, res) => {
  res.json({ data: 'This is data from a special route' });
});

// User routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] }); // Placeholder for user data
});

app.get('/api/users/:id', (req, res) => {
  res.json({ user: { id: req.params.id, name: 'Sample User' } });
});

app.post('/api/users', (req, res) => {
  // Process user creation
  res.status(201).json({ message: 'User created', user: req.body });
});

app.put('/api/users/:id', (req, res) => {
  // Process user update
  res.json({ message: 'User updated', user: { id: req.params.id, ...req.body } });
});

app.delete('/api/users/:id', (req, res) => {
  // Process user deletion
  res.json({ message: 'User deleted', id: req.params.id });
});

// Product routes
app.get('/api/products', (req, res) => {
  res.json({ products: [] }); // Placeholder for product data
});

app.get('/api/products/:id', (req, res) => {
  res.json({ product: { id: req.params.id, name: '3D Model Sample' } });
});

app.post('/api/products', (req, res) => {
  // Process product creation
  res.status(201).json({ message: 'Product created', product: req.body });
});

app.put('/api/products/:id', (req, res) => {
  // Process product update
  res.json({ message: 'Product updated', product: { id: req.params.id, ...req.body } });
});

app.delete('/api/products/:id', (req, res) => {
  // Process product deletion
  res.json({ message: 'Product deleted', id: req.params.id });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});

module.exports = { app, server }; // For testing purposes
