require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('Connecting to:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { tls: true, family: 4 })
  .then(() => {
    console.log('MongoDB connection SUCCESS');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB Connection ERROR:', err.message);
    process.exit(1);
  });
