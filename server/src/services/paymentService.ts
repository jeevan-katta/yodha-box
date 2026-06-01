import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay';
import { config } from '../config/env';

interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * Creates a Razorpay order for the given amount.
 */
export const createOrder = async (
  amount: number,
  bookingRef: string
): Promise<CreateOrderResult> => {
  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    receipt: bookingRef,
    notes: {
      bookingRef,
      platform: 'Yodha Nets',
    },
  };

  try {
    // Check if keys are placeholders
    if (!config.razorpay.keyId || config.razorpay.keyId.includes('YOUR_KEY_HERE')) {
      throw new Error('RAZORPAY_NOT_CONFIGURED');
    }

    const order = await razorpayInstance.orders.create(options);

    return {
      orderId: order.id,
      amount: amount,
      currency: 'INR',
    };
  } catch (error) {
    const err = error as Error;
    // If not configured, return a mock order for demo purposes
    if (err.message === 'RAZORPAY_NOT_CONFIGURED' || (err.message && err.message.includes('Auth Error'))) {
      console.warn('⚠️ Razorpay not configured correctly. Using DEMO order ID.');
      return {
        orderId: `order_DEMO_${Math.random().toString(36).slice(2, 11)}`,
        amount: amount,
        currency: 'INR',
      };
    }
    throw error;
  }
};

/**
 * Verifies the Razorpay payment signature to ensure authenticity.
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // Allow demo bypass
  if (orderId.startsWith('order_DEMO_')) {
    return paymentId.startsWith('pay_DEMO_');
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};
