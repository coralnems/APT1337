const { getAsync, setAsync, expireAsync } = require('../services/redisService');
const sequelize = require('../config/db');

/**
 * Cache duration in seconds
 */
const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 86400, // 1 day
};

/**
 * Executes an optimized database query with caching
 * 
 * @param {String} cacheKey - Unique key for caching the query result
 * @param {Function} queryFn - Function that returns a Sequelize query promise
 * @param {Number} duration - Cache duration in seconds
 * @returns {Promise<Object>} - Query result
 */
async function executeOptimizedQuery(cacheKey, queryFn, duration = CACHE_DURATION.MEDIUM) {
  try {
    // Try to get from cache first
    const cachedResult = await getAsync(cacheKey);
    if (cachedResult) {
      console.log(`Cache hit: ${cacheKey}`);
      return JSON.parse(cachedResult);
    }

    // Execute the query
    const result = await queryFn();
    
    // Cache the result
    await setAsync(cacheKey, JSON.stringify(result));
    await expireAsync(cacheKey, duration);
    
    console.log(`Cache miss: ${cacheKey} - stored for ${duration}s`);
    return result;
  } catch (error) {
    console.error('Error in executeOptimizedQuery:', error);
    // If caching fails, just execute the query
    return queryFn();
  }
}

/**
 * Optimizes a raw SQL query with caching
 * 
 * @param {String} sql - SQL query string
 * @param {Object} options - Query options
 * @param {String} cacheKey - Unique key for caching the query result
 * @param {Number} duration - Cache duration in seconds
 * @returns {Promise<Object>} - Query result
 */
async function optimizedRawQuery(sql, options = {}, cacheKey, duration = CACHE_DURATION.MEDIUM) {
  return executeOptimizedQuery(
    cacheKey,
    () => sequelize.query(sql, options),
    duration
  );
}

module.exports = {
  CACHE_DURATION,
  executeOptimizedQuery,
  optimizedRawQuery
};
