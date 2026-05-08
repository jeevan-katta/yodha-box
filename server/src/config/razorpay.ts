import Razorpay from 'razorpay';
import { config } from './env';

export const razorpayInstance = (config.razorpay.keyId && !config.razorpay.keyId.includes('YOUR_KEY_HERE')) 
  ? new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    })
  : ({} as any);
