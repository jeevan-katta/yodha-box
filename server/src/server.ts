import express from 'express'; // Force restart
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import slotRoutes from './routes/slotRoutes';
import bookingRoutes from './routes/bookingRoutes';
import adminRoutes from './routes/adminRoutes';
import { seedAdmin } from './utils/seed';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased for development
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'VSY Box Cricket Pro API is running 🏏' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

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
