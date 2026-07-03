const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI no encontrada en .env');
  process.exit(1);
}

const client = new MongoClient(uri);
let db, pricesCol;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('albionprofit');
    pricesCol = db.collection('prices_api');
    await pricesCol.createIndex({ itemId: 1, city: 1 });
    await pricesCol.createIndex({ updatedAt: -1 });
    console.log('✅ MongoDB Atlas conectado');
    return { db, pricesCol };
  } catch (e) {
    console.error('❌ Error MongoDB:', e.message);
    process.exit(1);
  }
}

module.exports = { connectDB, getCol: () => pricesCol };