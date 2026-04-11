require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const Item = require('./models/Item');

const additionalItems = [
  // ===== LOST ITEMS =====
  {
    title: 'Apple AirPods Pro (White Case)',
    description: 'Left my AirPods Pro in the white charging case on the desk in Room 301 after the Data Structures lecture. They have my initials "SK" engraved on the case lid.',
    category: 'electronics',
    type: 'lost',
    location: 'Room 301, Block A',
    contact: 'sanjay.k@bbd.ac.in',
    authorId: 'seed_user_11',
    resolved: false
  },
  {
    title: 'Gold Chain with Pendant',
    description: 'Lost a thin gold chain with a small Om pendant while playing basketball. Extremely sentimental — belonged to my late grandmother. Please contact if found.',
    category: 'accessories',
    type: 'lost',
    location: 'Basketball Court, Sports Complex',
    contact: '+91 9012345678',
    authorId: 'seed_user_12',
    resolved: false
  },
  {
    title: 'Driving License & Aadhaar Card',
    description: 'Lost a transparent plastic folder containing my driving license (DL-1420110012345) and Aadhaar card. Must have fallen out of my bag near the bus stop.',
    category: 'documents',
    type: 'lost',
    location: 'University Bus Stop',
    contact: 'neha.gupta@bbd.ac.in',
    authorId: 'seed_user_13',
    resolved: false
  },
  {
    title: 'Realme Power Bank 20000mAh',
    description: 'Left my grey Realme 20000mAh power bank at the charging station in the library. Has a tiny Doraemon sticker on the front side.',
    category: 'electronics',
    type: 'lost',
    location: 'Central Library, Charging Station',
    contact: '+91 7890123456',
    authorId: 'seed_user_14',
    resolved: false
  },
  {
    title: 'Maroon Hoodie (Zara, Size L)',
    description: 'Left my maroon Zara hoodie (size L) draped on a chair in the seminar hall after the guest lecture on AI. Has a small ink stain on the right sleeve.',
    category: 'other',
    type: 'lost',
    location: 'Seminar Hall, Block B',
    contact: 'arjun.m@bbd.ac.in',
    authorId: 'seed_user_15',
    resolved: false
  },

  // ===== FOUND ITEMS =====
  {
    title: 'USB Pen Drive (SanDisk 64GB)',
    description: 'Found a red SanDisk 64GB pen drive plugged into one of the computers in Lab 204. It contains project files and a folder named "BCA_Sem4". Come claim it!',
    category: 'electronics',
    type: 'found',
    location: 'Computer Lab 204, Block C',
    contact: 'lab.incharge@bbd.ac.in',
    authorId: 'seed_user_16',
    resolved: false
  },
  {
    title: 'Bunch of Keys (4 Keys + Bike Key)',
    description: 'Found a keychain with 4 house keys and what appears to be a Honda Activa key, attached to a Manchester United keychain. Found on the corridor floor.',
    category: 'accessories',
    type: 'found',
    location: '2nd Floor Corridor, Block A',
    contact: 'security.office@bbd.ac.in',
    authorId: 'seed_user_17',
    resolved: false
  },
  {
    title: 'Transparent Water Bottle (Milton)',
    description: 'Found a Milton transparent water bottle with a blue cap left on the bench near the garden area. Has a name label "Riya" partially scratched off.',
    category: 'other',
    type: 'found',
    location: 'Garden Area, near Main Building',
    contact: 'student.help@bbd.ac.in',
    authorId: 'seed_user_18',
    resolved: false
  },
  {
    title: 'Notebook with Handwritten Notes',
    description: 'Found a spiral-bound notebook full of neatly written Operating Systems notes. Cover says "Semester 5" with hand-drawn doodles. Approximately 80 pages used.',
    category: 'documents',
    type: 'found',
    location: 'Classroom 108, Block D',
    contact: 'deepak.r@bbd.ac.in',
    authorId: 'seed_user_19',
    resolved: false
  }
];

async function addMoreItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { tls: true, family: 4 });
    console.log('Connected to MongoDB Atlas...');

    const result = await Item.insertMany(additionalItems);
    console.log(`Successfully added ${result.length} new realistic items!`);
    console.log('  - Lost items: 5');
    console.log('  - Found items: 4');
    process.exit(0);
  } catch (err) {
    console.error('Failed to add items:', err.message);
    process.exit(1);
  }
}

addMoreItems();
