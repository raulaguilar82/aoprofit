const express = require('express');
const router = express.Router();
const { processOrder } = require('../models/price');

function handleIngest(req, res) {
  const orders = req.body.Orders || (Array.isArray(req.body) ? req.body : [req.body]);
  let count = 0;

  Promise.all(orders.map(async order => {
    if (!order.ItemTypeId || !order.UnitPriceSilver) return;
    await processOrder(
      order.ItemTypeId,
      parseInt(order.LocationId) || 0,
      order.UnitPriceSilver,
      order.AuctionType,
      order.QualityLevel
    );
    count++;
  })).then(() => {
    console.log(`📡 ${count} órdenes`);
    res.json({ status: 'ok', received: count });
  });
}

router.post('/ingest', handleIngest);
router.post('/ingest/marketorders.ingest', handleIngest);

module.exports = router;