const express = require('express');
const router = express.Router();
const { cache } = require('../services/redisService');
const { executeOptimizedQuery, CACHE_DURATION } = require('../models/queryOptimizer');
const sequelize = require('../config/db');
const { QueryTypes } = require('sequelize');

// Get all 3D models - with caching middleware
router.get('/', cache(CACHE_DURATION.MEDIUM), (req, res) => {
  res.json({ models: [] }); // Replace with actual data from database
});

// Get a specific 3D model - with manual caching
router.get('/:id', async (req, res) => {
  try {
    const modelId = req.params.id;
    
    // Use the optimized query function
    const model = await executeOptimizedQuery(
      `model:${modelId}`,
      async () => {
        // This is where you would normally fetch from the database
        // For demonstration, returning mock data
        return { id: modelId, name: 'Sample 3D Model', format: 'STL' };
        
        /* Example of actual database query:
        return await sequelize.query(
          'SELECT * FROM models WHERE id = :id',
          {
            replacements: { id: modelId },
            type: QueryTypes.SELECT
          }
        );
        */
      },
      CACHE_DURATION.MEDIUM
    );
    
    res.json({ model });
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch the model' });
  }
});

// Create a new 3D model
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Model created', model: req.body });
});

// Update a 3D model
router.put('/:id', (req, res) => {
  res.json({ message: 'Model updated', model: { id: req.params.id, ...req.body } });
});

// Delete a 3D model
router.delete('/:id', (req, res) => {
  res.json({ message: 'Model deleted', id: req.params.id });
});

module.exports = router;
