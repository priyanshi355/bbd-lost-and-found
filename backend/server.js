require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Force Google Public DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// General Middleware Architecture
app.use(cors());
app.use(express.json());

// API Routes mounting pointing exclusively to independent endpoints
const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Global Unhandled Error Override
app.use((err, req, res, next) => {
  console.error('[CRITICAL] Server Error -> ', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Configure Database Connection explicitly utilizing Environment Variables
console.log('Attempting connection to:', process.env.MONGO_URI ? 'URI loaded from .env' : 'ERROR: No URI found!');
mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  family: 4
})
  .then(() => console.log('MongoDB connection internally authenticated successfully'))
  .catch((err) => console.error('MongoDB Initial Connection Error Occurred:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BBD Backend Operational via Local Network -> port ${PORT}`);
});
