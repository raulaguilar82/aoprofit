const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI no encontrada en .env');
  process.exit(1);
}

const client = new MongoClient(uri);
let db, pricesApiCol, pricesLocalCol;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('albionprofit');
    
    // Colección para precios de AODP comunitaria
    pricesApiCol = db.collection('prices_api');
    await pricesApiCol.createIndex({ itemId: 1, city: 1 });
    await pricesApiCol.createIndex({ updatedAt: -1 });
    
    // Colección para precios del data broker local
    pricesLocalCol = db.collection('prices_local');
    await pricesLocalCol.createIndex({ itemId: 1, city: 1 });
    await pricesLocalCol.createIndex({ updatedAt: -1 });
    
    console.log('✅ MongoDB Atlas conectado');
    console.log('   - prices_api (AODP comunitaria)');
    console.log('   - prices_local (Data broker)');
    
    return { db, pricesApiCol, pricesLocalCol };
  } catch (e) {
    console.error('❌ Error MongoDB:', e.message);
    process.exit(1);
  }
}

module.exports = { 
  connectDB, 
  getApiCol: () => pricesApiCol, 
  getLocalCol: () => pricesLocalCol 
};