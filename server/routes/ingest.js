const express = require('express');
const router = express.Router();
const { processOrder } = require('../models/price');

function handleIngest(req, res) {
  const orders = req.body.Orders || (Array.isArray(req.body) ? req.body : [req.body]);

  // Responder inmediatamente para evitar timeout
  res.json({ status: 'ok', received: orders.length });

  // Procesar en segundo plano
  let count = 0;
  Promise.all(orders.map(async order => {
    if (!order.ItemTypeId || !order.UnitPriceSilver) return;
    try {
      await processOrder(
        order.ItemTypeId,
        parseInt(order.LocationId) || 0,
        order.UnitPriceSilver,
        order.AuctionType,
        order.QualityLevel
      );
      count++;
    } catch (e) {
      // Ignorar errores individuales
    }
  })).then(() => {
    console.log(`📡 ${count}/${orders.length} órdenes procesadas`);
  }).catch(e => {
    console.error('Error en lote:', e.message);
  });
}

router.post('/', handleIngest);
router.post('/marketorders.ingest', handleIngest);

module.exports = router;