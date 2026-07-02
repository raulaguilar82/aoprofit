const { getApiCol, getLocalCol } = require('../config/db');
const { getCity } = require('../utils/locations');

// Buffer en memoria para precios locales
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

  const pricesLocalCol = getLocalCol();
  const ops = entries.map(entry => ({
    updateOne: {
      filter: { itemId: entry.itemId, city: entry.city },
      update: {
        $set: {
          sell: entry.sell !== Infinity ? entry.sell : 0,
          buy: entry.buy || 0,
          date: new Date(),
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));

  await pricesLocalCol.bulkWrite(ops);
  console.log(`⚡ Buffer flush (local): ${ops.length} items actualizados`);
  
  Object.keys(buffer).forEach(k => delete buffer[k]);
}

async function processOrder(itemId, locationId, price, auctionType, qualityLevel) {
  addToBuffer(itemId, locationId, price, auctionType, qualityLevel);
}

// Obtener precios combinados (local + api)
async function getPrices(ids) {
  const pricesLocalCol = getLocalCol();
  const pricesApiCol = getApiCol();
  
  const [localDocs, apiDocs] = await Promise.all([
    pricesLocalCol.find({ itemId: { $in: ids } }).toArray(),
    pricesApiCol.find({ itemId: { $in: ids } }).toArray()
  ]);
  
  const result = {};

  // Agregar precios locales (mayor prioridad)
  localDocs.forEach(doc => {
    if (!result[doc.itemId]) result[doc.itemId] = { prices: [], updatedAt: doc.updatedAt };
    result[doc.itemId].prices.push({
      city: doc.city,
      sell_price_min: doc.sell || 0,
      buy_price_max: doc.buy || 0,
      sell_price_min_date: doc.date?.toISOString(),
      source: 'local'
    });
    if (doc.updatedAt > result[doc.itemId].updatedAt) {
      result[doc.itemId].updatedAt = doc.updatedAt;
    }
  });

  // Agregar precios API (menor prioridad, solo si no existe local para esa ciudad)
  apiDocs.forEach(doc => {
    if (!result[doc.itemId]) result[doc.itemId] = { prices: [], updatedAt: doc.updatedAt };
    
    // Verificar si ya existe un precio local para esta ciudad
    const hasLocal = result[doc.itemId].prices.some(
      p => p.city === doc.city && p.source === 'local'
    );
    
    if (!hasLocal) {
      result[doc.itemId].prices.push({
        city: doc.city,
        sell_price_min: doc.sell || 0,
        buy_price_max: doc.buy || 0,
        sell_price_min_date: doc.date?.toISOString(),
        source: 'api'
      });
    }
    
    if (doc.updatedAt > result[doc.itemId].updatedAt) {
      result[doc.itemId].updatedAt = doc.updatedAt;
    }
  });

  return result;
}

// Guardar precios de API externa (AODP)
async function saveApiPrices(prices) {
  const pricesApiCol = getApiCol();
  const pricesLocalCol = getLocalCol();
  const ops = [];

  // Obtener IDs para verificar locales existentes
  const ids = Object.keys(prices);
  const localExisting = await pricesLocalCol.find({ 
    itemId: { $in: ids } 
  }).toArray();
  
  const localMap = {};
  localExisting.forEach(doc => {
    if (!localMap[doc.itemId]) localMap[doc.itemId] = new Set();
    localMap[doc.itemId].add(doc.city);
  });

  Object.entries(prices).forEach(([itemId, data]) => {
    const items = Array.isArray(data) ? data : (data.prices || [data]);
    items.forEach(p => {
      if (!p?.city) return;
      
      // No guardar si existe precio local para esta ciudad
      if (localMap[itemId]?.has(p.city)) return;
      
      ops.push({
        updateOne: {
          filter: { itemId, city: p.city },
          update: {
            $set: {
              sell: p.sell_price_min || 0,
              buy: p.buy_price_max || 0,
              date: p.sell_price_min_date ? new Date(p.sell_price_min_date) : new Date(),
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      });
    });
  });

  if (ops.length) await pricesApiCol.bulkWrite(ops);
  return ops.length;
}

module.exports = { processOrder, getPrices, saveApiPrices };