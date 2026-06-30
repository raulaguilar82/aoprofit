const express = require('express');
const router = express.Router();
const { getPrices, saveApiPrices } = require('../models/price');

router.get('/', async (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean);
  if (!ids.length) return res.json({ data: {} });
  const result = await getPrices(ids);
  res.json({ data: result });
});

router.post('/', async (req, res) => {
  const { prices } = req.body;
  if (!prices) return res.status(400).json({ error: 'Faltan precios' });
  const saved = await saveApiPrices(prices);
  res.json({ saved });
});

module.exports = router;