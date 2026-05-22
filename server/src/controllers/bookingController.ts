import { Request, Response } from 'express';
import { Booking } from '../models/Booking';
import { SlotLock } from '../models/SlotLock';
import { isSlotAvailable } from '../services/slotService';
import { createOrder, verifyPaymentSignature } from '../services/paymentService';
import { getSlotPrice } from '../services/pricingService';
import { isValidDate, isValidHour, isFutureOrToday } from '../utils/helpers';
import { TurfId } from '../types';
import { config } from '../config/env';
import mongoose from 'mongoose';

/**
 * Create a booking order (initiate payment).
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { turfId, date, startHours, paymentType = 'full', ballType = 'none' } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!turfId || !['A', 'B'].includes(turfId)) {
      res.status(400).json({ success: false, message: 'Invalid turf ID' });
      return;
    }

    if (!date || !isValidDate(date) || !isFutureOrToday(date)) {
      res.status(400).json({ success: false, message: 'Invalid or past date' });
      return;
    }

    const hours = Array.isArray(startHours) ? startHours : [req.body.startHour];

    if (hours.length === 0 || hours.some((h: any) => !isValidHour(h))) {
      res.status(400).json({ success: false, message: 'Invalid hours selected' });
      return;
    }

    const BALL_PRICES: Record<string, number> = {
      light_tennis: 80,
      hard_tennis: 100,
      old_ball: 0,
      none: 0
    };
    const ballAmount = BALL_PRICES[ballType] || 0;

    let totalBookingAmount = ballAmount;
    const bookingsData = [];

    // Verify locks and availability for all slots
    for (const hour of hours) {
      const lock = await SlotLock.findOne({
        turfId,
        date,
        startHour: hour,
        userId: new mongoose.Types.ObjectId(userId),
        expiresAt: { $gt: new Date() },
      });

      if (!lock) {
        res.status(409).json({
          success: false,
          message: `Slot lock for ${hour}:00 expired or not found.`,
        });
        return;
      }

      const available = await isSlotAvailable(turfId as TurfId, date, hour);
      if (!available) {
        res.status(409).json({ success: false, message: `Slot ${hour}:00 is no longer available` });
        return;
      }

      const price = await getSlotPrice(date, hour, turfId as string);
      totalBookingAmount += price;
      bookingsData.push({ hour, price });
    }

    // Calculate amount to pay now
    const amountToPay = paymentType === 'advance' ? Math.round(totalBookingAmount * 0.3) : totalBookingAmount;
    console.log('--- DEBUG ---', { ballType, ballAmount, totalBookingAmount, bookingsData });

    // Create Razorpay order for the amount to pay
    // Shorten bookingRef to stay under Razorpay's 40-char limit for receipt
    const bookingRef = `VSY-${turfId}-${Date.now().toString(36)}`;
    const order = await createOrder(amountToPay, bookingRef);

    // Create multiple pending bookings
    const bookings = await Promise.all(
      bookingsData.map(async (data, index) => {
        // Add the ball cost to the first booking only to avoid duplication and fractions
        const isFirstBooking = index === 0;
        const currentBallAmount = isFirstBooking ? ballAmount : 0;
        const currentBallType = isFirstBooking ? ballType : 'none';
        
        const slotPrice = data.price + currentBallAmount;
        // For individual records, we split the paid amount proportionally
        const individualPaidAmount = paymentType === 'advance' ? Math.round(slotPrice * 0.3) : slotPrice;

        return await Booking.create({
          userId: new mongoose.Types.ObjectId(userId),
          turfId,
          date,
          startHour: data.hour,
          totalAmount: slotPrice,
          paidAmount: individualPaidAmount,
          paymentType,
          status: 'pending',
          razorpayOrderId: order.orderId,
          ballType: currentBallType,
          ballAmount: currentBallAmount,
        });
      })
    );

    res.status(201).json({
      success: true,
      message: `Order created for ${paymentType} payment.`,
      data: {
        bookingIds: bookings.map((b) => b._id),
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: config.razorpay.keyId,
        turfId,
        date,
        startHours: hours,
        paymentType,
        totalBookingAmount,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Verify payment and confirm booking.
 */
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ success: false, message: 'Missing payment verification data' });
      return;
    }

    // Verify Razorpay signature first
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      // Mark all pending bookings for this order as failed
      await Booking.updateMany(
        { razorpayOrderId, status: 'pending' },
        { status: 'failed' }
      );
      res.status(400).json({ success: false, message: 'Payment verification failed' });
      return;
    }

    // Find all pending bookings for this order
    const bookings = await Booking.find({
      razorpayOrderId,
      status: 'pending',
    });

    if (bookings.length === 0) {
      res.status(404).json({ success: false, message: 'No pending bookings found for this order' });
      return;
    }

    // Confirm all bookings
    for (const booking of bookings) {
      booking.status = 'confirmed';
      booking.razorpayPaymentId = razorpayPaymentId;
      booking.razorpaySignature = razorpaySignature;
      await booking.save();

      // Remove the slot lock
      await SlotLock.deleteOne({
        turfId: booking.turfId,
        date: booking.date,
        startHour: booking.startHour,
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment verified! ${bookings.length} slot(s) confirmed.`,
      data: {
        count: bookings.length,
        razorpayOrderId,
        status: 'confirmed',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Get user's booking history.
 */
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Cleanup expired pending bookings
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Booking.updateMany(
      { status: 'pending', createdAt: { $lt: fiveMinsAgo } },
      { $set: { status: 'cancelled' } }
    );

    const bookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved',
      data: bookings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get bookings';
    res.status(500).json({ success: false, message });
  }
};

/**
 * Cancel a booking.
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'confirmed',
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found or cannot be cancelled' });
      return;
    }

    // Check if booking date is in the future
    const bookingDate = new Date(booking.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      res.status(400).json({ success: false, message: 'Cannot cancel past bookings' });
      return;
    }

    await Booking.updateMany(
      { razorpayOrderId: booking.razorpayOrderId, userId: new mongoose.Types.ObjectId(userId) },
      { $set: { status: 'cancelled' } }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel booking';
    res.status(500).json({ success: false, message });
  }
};
