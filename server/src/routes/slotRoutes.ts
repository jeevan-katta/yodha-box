import { Router } from 'express';
import { getSlots, lockSlotHandler, unlockSlotHandler, getPrice, getPublicPricing, getPublicBowlingPackages } from '../controllers/slotController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public: get pricing summary
router.get('/pricing', getPublicPricing);

// Public: bowling package prices
router.get('/bowling-packages', getPublicBowlingPackages);

// Public: get slots for a turf on a date
router.get('/:turfId/:date', getSlots);

// Public: get price for a specific slot
router.get('/price/:date/:hour', getPrice);

// Protected: lock/unlock slots
router.post('/lock', authMiddleware, lockSlotHandler);
router.post('/unlock', authMiddleware, unlockSlotHandler);

export default router;
