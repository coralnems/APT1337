const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

// Determine Redis connection details from environment variables
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

console.log(`Connecting to Redis at ${redisUrl} (host: ${redisHost}, port: ${redisPort})`);

// Create Redis client with improved connection options
const client = redis.createClient({
  url: redisUrl,
  socket: {
    host: redisHost,
    port: redisPort,
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt: ${retries}`);
      if (retries > 10) {
        console.error('Redis reconnect failed after 10 attempts. Giving up.');
        return new Error('Redis connection retry limit reached');
      }
      return Math.min(retries * 100, 3000);
    }
  },
  legacyMode: false // Use the new Redis client API
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis successfully');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('reconnecting', () => console.log('Redis client reconnecting...'));
client.on('ready', () => console.log('Redis client ready'));

// Helper functions for Redis operations
const getAsync = async (key) => {
  try {
    return await client.get(key);
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
};

const setAsync = async (key, value, options = {}) => {
  try {
    await client.set(key, value, options);
    return true;
  } catch (err) {
    console.error('Redis set error:', err);
    return false;
  }
};

const delAsync = async (key) => {
  try {
    return await client.del(key);
  } catch (err) {
    console.error('Redis del error:', err);
    return 0;
  }
};

const expireAsync = async (key, seconds) => {
  try {
    return await client.expire(key, seconds);
  } catch (err) {
    console.error('Redis expire error:', err);
    return false;
  }
};

const flushAsync = async () => {
  try {
    return await client.flushAll();
  } catch (err) {
    console.error('Redis flushAll error:', err);
    return false;
  }
};

// Default cache expiry in seconds
const DEFAULT_EXPIRY = 3600; // 1 hour

/**
 * Cache middleware for Express routes
 * @param {number} duration - Cache duration in seconds
 */
const cache = (duration = DEFAULT_EXPIRY) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a cache key from the request URL
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await getAsync(key);
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        console.log(`Cache hit for: ${key}`);
        return res.json(data);
      }

      // Replace res.json with a custom implementation to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        // Cache the response data
        setAsync(key, JSON.stringify(data))
          .then(() => expireAsync(key, duration))
          .catch(err => console.error('Redis caching error:', err));
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Redis cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cached data for a specific key
 * @param {string} key - Cache key to clear
 */
const clearCache = async (key) => {
  try {
    await delAsync(`cache:${key}`);
    console.log(`Cache cleared for: ${key}`);
  } catch (error) {
    console.error('Redis clear cache error:', error);
  }
};

/**
 * Clear all cached data
 */
const clearAllCache = async () => {
  try {
    await flushAsync();
    console.log('All cache cleared');
  } catch (error) {
    console.error('Redis clear all cache error:', error);
  }
};

module.exports = {
  client,
  getAsync,
  setAsync,
  delAsync,
  expireAsync,
  cache,
  clearCache,
  clearAllCache
};
