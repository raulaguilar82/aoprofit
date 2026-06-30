const { getCol } = require('../config/db');
const { getCity } = require('../utils/locations');

// Buffer en memoria: { "itemId|city": { itemId, city, sell: Infinity, buy: 0 } }
const buffer = {};
let flushTimeout = null;

function addToBuffer(itemId, locationId, price, auctionType, qualityLevel) {
  if (auctionType === 'request' && qualityLevel && qualityLevel > 1) return;
  
  price = Math.round(price / 10000);
  const city = getCity(locationId);
  const key = `${itemId}|${city}`;

  if (!buffer[key]) buffer[key] = { itemId, city, sell: Infinity, buy: 0 };

  if (auctionType === 'offer' && price < buffer[key].sell) {
    buffer[key].sell = price;
  }
  if (auctionType === 'request' && price > buffer[key].buy) {
    buffer[key].buy = price;
  }

  clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushBuffer, 1000);
}

async function flushBuffer() {
  const entries = Object.values(buffer);
  if (!entries.length) return;

  const pricesCol = getCol();
  const ops = entries.map(entry => ({
    updateOne: {
      filter: { itemId: entry.itemId, city: entry.city },
      update: {
        $set: {
          sell: entry.sell !== Infinity ? entry.sell : 0,
          buy: entry.buy || 0,
          date: new Date(),
          source: 'local',
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  await pricesCol.bulkWrite(ops);
  console.log(`⚡ Buffer flush: ${ops.length} items actualizados`);
  
  Object.keys(buffer).forEach(k => delete buffer[k]);
}

async function processOrder(itemId, locationId, price, auctionType, qualityLevel) {
  addToBuffer(itemId, locationId, price, auctionType, qualityLevel);
}

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
      source: doc.source || 'local'
    });
    if (doc.updatedAt > result[doc.itemId].updatedAt) result[doc.itemId].updatedAt = doc.updatedAt;
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
      ops.push({
        updateOne: {
          filter: { itemId, city: p.city, source: { $ne: 'local' } },
          update: {
            $set: {
              sell: p.sell_price_min || 0,
              buy: p.buy_price_max || 0,
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

module.exports = { processOrder, getPrices, saveApiPrices };