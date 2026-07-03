const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const { connectDB } = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/cached-prices', require('./server/routes/prices'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/flip', express.static(path.join(__dirname, 'public', 'flip')));
app.use('/shared', express.static(path.join(__dirname, 'public', 'shared')));

// Data files
app.get('/data/recipes.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'data', 'recipes.json')));
app.get('/data/item-mapping.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'data', 'item-mapping.json')));

// Crafteo - fallback
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Flip - fallback
app.get('/flip', (req, res) => res.sendFile(path.join(__dirname, 'public', 'flip', 'index.html')));

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`🎮 Albion Profit → http://localhost:${PORT}`));
}
start();