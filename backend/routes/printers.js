const express = require('express');
const Printer = require('../models/Printer');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  const { name, octoprint_url, api_key } = req.body;
  try {
    const printer = await Printer.create({
      name,
      octoprint_url,
      api_key,
      UserId: req.user.id,
    });
    res.status(201).json({ id: printer.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add printer' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const printers = await Printer.findAll({ where: { UserId: req.user.id } });
  res.json(printers);
});

module.exports = router;