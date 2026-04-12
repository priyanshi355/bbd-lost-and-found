require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Only use external DNS in local development (BBD Campus Wifi workaround)
// Render's production environment requires its own internal VPC DNS to connect to MongoDB
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[CRITICAL] Server Error ->', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

console.log('Attempting connection to:', process.env.MONGO_URI ? 'URI loaded from .env' : 'ERROR: No URI found!');
mongoose.connect(process.env.MONGO_URI, { tls: true, family: 4 })
  .then(() => console.log('MongoDB connection internally authenticated successfully'))
  .catch((err) => console.error('MongoDB Initial Connection Error Occurred:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BBD Backend Operational via Local Network -> port ${PORT}`));
