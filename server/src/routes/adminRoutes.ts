import { Router } from 'express';
import {
  getAllBookings,
  adminCancelBooking,
  adminCollectPayment,
  blockSlot,
  unblockSlot,
  getDashboardStats,
  getPricingRules,
  updatePricingRule,
  getBlockedSlots,
  migrateWalkIns,
  getBowlingPackages,
  updateBowlingPackage,
} from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/stats', getDashboardStats);

// Bookings management
router.get('/bookings', getAllBookings);
router.put('/bookings/cancel/:bookingId', adminCancelBooking);
router.put('/bookings/collect-payment/:bookingId', adminCollectPayment);

// Slot blocking
router.post('/slots/block', blockSlot);
router.post('/slots/unblock', unblockSlot);
router.get('/slots/blocked', getBlockedSlots);

// Pricing
router.get('/pricing', getPricingRules);
router.put('/pricing/:ruleId', updatePricingRule);

// Bowling packages
router.get('/bowling-packages', getBowlingPackages);
router.put('/bowling-packages/:packageId', updateBowlingPackage);

// One-time migration utility
router.post('/migrate-walkins', migrateWalkIns);

export default router;
