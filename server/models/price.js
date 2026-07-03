const { getCol } = require('../config/db');

async function getPrices(ids) {
  const pricesCol = getCol();
  const docs = await pricesCol.find({ itemId: { $in: ids } }).toArray();
  const result = {};

  docs.forEach(doc => {
    if (!result[doc.itemId]) result[doc.itemId] = { prices: [], updatedAt: doc.updatedAt };
    result[doc.itemId].prices.push({
      city: doc.city,
      sell_price_min: doc.sell || 0,
      buy_price_max: doc.buy || 0,
      sell_price_min_date: doc.date?.toISOString(),
      source: doc.source || 'api'
    });
    if (doc.updatedAt > result[doc.itemId].updatedAt) {
      result[doc.itemId].updatedAt = doc.updatedAt;
    }
  });

  return result;
}

async function saveApiPrices(prices) {
  const pricesCol = getCol();
  const ops = [];

  Object.entries(prices).forEach(([itemId, data]) => {
    const items = Array.isArray(data) ? data : (data.prices || [data]);
    items.forEach(p => {
      if (!p?.city) return;
      const sell = p.sell_price_min || 0;
      const buy = p.buy_price_max || 0;
      if (sell === 0 && buy === 0) return;

      ops.push({
        updateOne: {
          filter: { itemId, city: p.city },
          update: {
            $set: {
              sell: sell,
              buy: buy,
              date: p.sell_price_min_date ? new Date(p.sell_price_min_date) : new Date(),
              source: 'api',
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      });
    });
  });

  if (ops.length) await pricesCol.bulkWrite(ops);
  return ops.length;
}

module.exports = { getPrices, saveApiPrices };