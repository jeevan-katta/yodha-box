import { Request, Response } from 'express';
import { getSlotsForDate, lockSlot, unlockSlot } from '../services/slotService';
import { getSlotPrice } from '../services/pricingService';
import { isValidDate, isValidHour, isFutureOrToday } from '../utils/helpers';
import { TurfId } from '../types';
import { PricingRule } from '../models/PricingRule';
import { BowlingPackage } from '../models/BowlingPackage';

/**
 * Get all slots for a specific turf and date.
 */
export const getSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turfId, date } = req.params;

    if (!turfId || !['A', 'B', 'D'].includes(turfId)) {
      res.status(400).json({ success: false, message: 'Invalid turf ID. Must be A, B or D' });
      return;
    }

    if (!date || !isValidDate(date)) {
      res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const slots = await getSlotsForDate(turfId as TurfId, date);

    res.status(200).json({
      success: true,
      message: 'Slots retrieved successfully',
      data: {
        turfId,
        date,
        slots,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get slots';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Lock a slot temporarily for the user during payment.
 */
export const lockSlotHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turfId, date, startHour } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!turfId || !['A', 'B', 'D'].includes(turfId)) {
      res.status(400).json({ success: false, message: 'Invalid turf ID' });
      return;
    }

    if (!date || !isValidDate(date) || !isFutureOrToday(date)) {
      res.status(400).json({ success: false, message: 'Invalid or past date' });
      return;
    }

    if (!isValidHour(startHour)) {
      res.status(400).json({ success: false, message: 'Invalid hour. Must be 0-23' });
      return;
    }

    const locked = await lockSlot(turfId as TurfId, date, startHour, userId);

    if (!locked) {
      res.status(409).json({
        success: false,
        message: 'This slot is not available. It may be booked, blocked, or locked by another user.',
      });
      return;
    }

    const price = await getSlotPrice(date, startHour, turfId);

    res.status(200).json({
      success: true,
      message: 'Slot locked for 5 minutes',
      data: {
        turfId,
        date,
        startHour,
        price,
        lockExpiresIn: 300, // seconds
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock slot';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Release a slot lock manually.
 */
export const unlockSlotHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turfId, date, startHour } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await unlockSlot(turfId as TurfId, date, startHour, userId);

    res.status(200).json({
      success: true,
      message: 'Slot unlocked',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock slot';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Get price for a specific slot.
 */
export const getPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, hour } = req.params;

    if (!date || !isValidDate(date)) {
      res.status(400).json({ success: false, message: 'Invalid date' });
      return;
    }

    const hourNum = parseInt(hour, 10);
    if (!isValidHour(hourNum)) {
      res.status(400).json({ success: false, message: 'Invalid hour' });
      return;
    }

    const turfId = (req.query.turfId as string) || 'A';
    const price = await getSlotPrice(date, hourNum, turfId);

    res.status(200).json({
      success: true,
      message: 'Price retrieved',
      data: { date, hour: hourNum, turfId, price },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get price';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Get all active pricing rules (Public).
 */
export const getPublicPricing = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rules = await PricingRule.find({ isActive: true }).sort({ turfId: 1, dayType: 1, startHour: 1 });
    res.status(200).json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pricing' });
  }
};

/**
 * Get bowling over packages (Public) — used by booking page.
 */
export const getPublicBowlingPackages = async (_req: Request, res: Response): Promise<void> => {
  try {
    let packages = await BowlingPackage.find({ isActive: true }).sort({ overs: 1 });

    // Auto-seed defaults if not yet in DB
    if (packages.length === 0) {
      const defaults = [
        { overs: 5,  price: 250 },
        { overs: 10, price: 450 },
        { overs: 15, price: 600 },
        { overs: 20, price: 750 },
      ];
      await BowlingPackage.insertMany(defaults);
      packages = await BowlingPackage.find({ isActive: true }).sort({ overs: 1 });
    }

    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bowling packages' });
  }
};
