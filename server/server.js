const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', require('./routes/ingest'));
app.use('/api/cached-prices', require('./routes/prices'));

app.get('/data/recipes.json', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'data', 'recipes.json')));
app.get('/data/item-mapping.json', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'data', 'item-mapping.json')));

app.use((req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`🎮 Albion Profit → http://localhost:${PORT}`));
}
start();