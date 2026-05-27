// Seed bowling packages directly
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vsy-box-cricket';

const bowlingPackageSchema = new mongoose.Schema({
  overs: { type: Number, enum: [5, 10, 15, 20], required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const BowlingPackage = mongoose.model('BowlingPackage', bowlingPackageSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await BowlingPackage.find();
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing bowling packages:`);
    existing.forEach(p => console.log(`  ${p.overs} overs = ₹${p.price}`));
    await mongoose.disconnect();
    return;
  }

  const defaults = [
    { overs: 5,  price: 250 },
    { overs: 10, price: 450 },
    { overs: 15, price: 600 },
    { overs: 20, price: 750 },
  ];

  await BowlingPackage.insertMany(defaults);
  console.log('✅ Seeded bowling packages:');
  defaults.forEach(p => console.log(`  ${p.overs} overs = ₹${p.price}`));

  await mongoose.disconnect();
}

seed().catch(console.error);
