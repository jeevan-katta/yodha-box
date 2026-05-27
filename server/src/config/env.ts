import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vsy-box-cricket',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@vsyboxcricket.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin@123',
  slotLockDuration: parseInt(process.env.SLOT_LOCK_DURATION || '5', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  turfs: ['A', 'B', 'D'] as const,
};
