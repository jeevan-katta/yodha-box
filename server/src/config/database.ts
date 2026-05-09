import mongoose from 'mongoose';
import { config } from './env';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongodbUri);
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // process.exit(1); // Don't exit in serverless environments
    throw error;
  }
};
