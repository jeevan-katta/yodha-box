process.on('uncaughtException', err => console.log('🔥 UNCAUGHT EXCEPTION 🔥', err));
process.on('unhandledRejection', reason => console.log('🔥 UNHANDLED REJECTION 🔥', reason));

import { config } from './config/env';
import { connectDB } from './config/database';
import { seedAdmin } from './utils/seed';
import app from './app';

// Start server
const startServer = async (): Promise<void> => {
  await connectDB();
  await seedAdmin();
  app.listen(config.port, () => {
    console.log(`
    🏏 VSY Box Cricket Pro Server
    📍 Running on port ${config.port}
    🌐 http://localhost:${config.port}
    📊 Health: http://localhost:${config.port}/api/health
    `);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Trigger reload 2
