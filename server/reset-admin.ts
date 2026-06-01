/**
 * One-time script to reset the admin password.
 * Run from server directory: npx tsx reset-admin.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Admin } from './src/models/Admin';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yodha-nets';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yodhanets.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@123';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  // Delete existing admin and re-create with correct password
  const deleted = await Admin.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} existing admin(s)`);

  await Admin.create({
    name: 'Yodha Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  console.log('\n✅ Admin reset successfully!');
  console.log(`📧 Email:    ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});
