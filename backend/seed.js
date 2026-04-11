require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Item = require('./models/Item');

const sampleItems = [
  {
    title: 'Black Dell Laptop Charger',
    description: 'Lost my Dell 65W laptop charger in the Computer Lab (Room 205). It has a small blue sticker on the adapter. Urgently needed for assignments.',
    category: 'electronics',
    type: 'lost',
    location: 'Computer Lab, Block A, Room 205',
    contact: 'rahul.s@bbd.ac.in',
    authorId: 'seed_user_1',
    resolved: false
  },
  {
    title: 'College ID Card - Ananya Patel',
    description: 'Found a BBD University ID card belonging to Ananya Patel, B.Tech CSE 2nd Year, near the main cafeteria entrance. Card number BBD-2024-3847.',
    category: 'documents',
    type: 'found',
    location: 'Main Cafeteria Entrance',
    contact: 'finder.helpful@bbd.ac.in',
    authorId: 'seed_user_2',
    resolved: false
  },
  {
    title: 'Silver Wristwatch (Titan)',
    description: 'Lost my Titan silver analog wristwatch somewhere between the Library and Parking Lot B. It has sentimental value — a graduation gift. Reward offered.',
    category: 'accessories',
    type: 'lost',
    location: 'Library to Parking Lot B pathway',
    contact: '+91 9876543210',
    authorId: 'seed_user_3',
    resolved: false
  },
  {
    title: 'Blue JBL Wireless Earbuds',
    description: 'Found a pair of blue JBL Tune 230NC earbuds in the lecture hall during the morning batch. They were under seat 14, Row C. Still has charge.',
    category: 'electronics',
    type: 'found',
    location: 'Lecture Hall 3, Block B',
    contact: 'vikram.k@bbd.ac.in',
    authorId: 'seed_user_4',
    resolved: false
  },
  {
    title: 'Engineering Mathematics Textbook',
    description: 'Lost my RD Sharma Engineering Mathematics textbook. Has my name "Priya Verma" written on the first page with a purple pen. Contains important handwritten notes.',
    category: 'other',
    type: 'lost',
    location: 'Reading Room, Central Library',
    contact: 'priya.v@bbd.ac.in',
    authorId: 'seed_user_5',
    resolved: true
  },
  {
    title: 'Samsung Galaxy A54 (Black)',
    description: 'Found a black Samsung Galaxy A54 with a cracked screen protector near the sports ground. It has a red phone case with a card holder. Phone is locked.',
    category: 'electronics',
    type: 'found',
    location: 'Sports Ground, near cricket pitch',
    contact: 'security.desk@bbd.ac.in',
    authorId: 'seed_user_6',
    resolved: false
  },
  {
    title: 'Prescription Eyeglasses (Ray-Ban Frame)',
    description: 'Lost my prescription eyeglasses with a black Ray-Ban frame in the canteen area. Cannot attend lectures without them. Power: -2.5 both eyes.',
    category: 'accessories',
    type: 'lost',
    location: 'Canteen, Block C',
    contact: '+91 8765432109',
    authorId: 'seed_user_7',
    resolved: false
  },
  {
    title: 'HP Scientific Calculator',
    description: 'Found an HP 300s+ scientific calculator left behind after the Physics practical exam in Lab 102. Has initials "AK" scratched on the back.',
    category: 'electronics',
    type: 'found',
    location: 'Physics Lab 102, Block D',
    contact: 'lab.assistant@bbd.ac.in',
    authorId: 'seed_user_8',
    resolved: true
  },
  {
    title: 'Black Leather Wallet with Documents',
    description: 'Lost my black leather wallet containing Aadhaar card, PAN card, and approximately ₹500 cash. Dropped somewhere near the ATM or parking lot.',
    category: 'documents',
    type: 'lost',
    location: 'ATM area / Parking Lot A',
    contact: '+91 7654321098',
    authorId: 'seed_user_9',
    resolved: false
  },
  {
    title: 'Red Backpack (Wildcraft)',
    description: 'Found a red Wildcraft backpack with notebooks and a water bottle inside. Left behind in the auditorium after the cultural event. No name tag found.',
    category: 'other',
    type: 'found',
    location: 'Main Auditorium',
    contact: 'events.team@bbd.ac.in',
    authorId: 'seed_user_10',
    resolved: false
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { tls: true, family: 4 });
    console.log('Connected to MongoDB Atlas for seeding...');

    const existingCount = await Item.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} items. Skipping seed to avoid duplicates.`);
      process.exit(0);
    }

    await Item.insertMany(sampleItems);
    console.log(`Successfully seeded ${sampleItems.length} sample items!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
