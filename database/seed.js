const path = require('path');
const dns = require('dns');

// Use public DNS to reliably resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Add backend node_modules so dependencies can be loaded from anywhere
module.paths.push(path.join(__dirname, '../backend/node_modules'));

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stockease';

// Inline Product schema (avoid importing from backend to keep seed self-contained)
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

const sampleProducts = [
  // Electronics
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Over-ear noise-cancelling headphones with 30h battery life.',
    category: 'Electronics',
    price: 79.99,
    quantity: 45,
    sku: 'ELEC-HP-001',
    lowStockThreshold: 10,
  },
  {
    name: 'USB-C Charging Hub',
    description: '7-in-1 USB-C hub with HDMI, SD card reader, and 3x USB-A ports.',
    category: 'Electronics',
    price: 34.99,
    quantity: 7,   // Low Stock
    sku: 'ELEC-HUB-002',
    lowStockThreshold: 10,
  },
  {
    name: 'Portable Power Bank 20000mAh',
    description: 'Fast-charging power bank with dual USB-A and USB-C output.',
    category: 'Electronics',
    price: 49.99,
    quantity: 0,   // Out of Stock
    sku: 'ELEC-PB-003',
    lowStockThreshold: 10,
  },
  // Clothing
  {
    name: 'Men\'s Classic Polo Shirt',
    description: '100% cotton pique polo in navy blue, available in S-XL.',
    category: 'Clothing',
    price: 24.99,
    quantity: 120,
    sku: 'CLO-POLO-001',
    lowStockThreshold: 15,
  },
  {
    name: 'Women\'s Slim Fit Jeans',
    description: 'Stretch denim jeans in dark wash, sizes 26-36.',
    category: 'Clothing',
    price: 39.99,
    quantity: 5,   // Low Stock
    sku: 'CLO-JEAN-002',
    lowStockThreshold: 10,
  },
  {
    name: 'Unisex Hoodie',
    description: 'Fleece-lined pullover hoodie with kangaroo pocket.',
    category: 'Clothing',
    price: 29.99,
    quantity: 0,   // Out of Stock
    sku: 'CLO-HOOD-003',
    lowStockThreshold: 10,
  },
  // Food
  {
    name: 'Organic Green Tea (100 bags)',
    description: 'Premium Japanese sencha green tea, individually wrapped bags.',
    category: 'Food',
    price: 12.99,
    quantity: 200,
    sku: 'FOOD-TEA-001',
    lowStockThreshold: 20,
  },
  {
    name: 'Dark Chocolate Bar 85%',
    description: 'Single-origin Ecuador dark chocolate, 100g bar.',
    category: 'Food',
    price: 4.49,
    quantity: 8,   // Low Stock
    sku: 'FOOD-CHOC-002',
    lowStockThreshold: 10,
  },
  // Tools
  {
    name: 'Cordless Drill Driver',
    description: '18V lithium-ion cordless drill with 2 batteries and charger.',
    category: 'Tools',
    price: 89.99,
    quantity: 25,
    sku: 'TOOL-DRILL-001',
    lowStockThreshold: 5,
  },
  {
    name: 'Precision Screwdriver Set (32pc)',
    description: 'Magnetic precision screwdrivers for electronics and home repair.',
    category: 'Tools',
    price: 19.99,
    quantity: 3,   // Low Stock
    sku: 'TOOL-SCREW-002',
    lowStockThreshold: 5,
  },
];

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Inserting sample products...');
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`\nInserted ${inserted.length} products:`);
    inserted.forEach((p) => console.log(`  [${p.sku}] ${p.name} — qty: ${p.quantity}`));

    console.log('\nSeed complete.');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seed();
