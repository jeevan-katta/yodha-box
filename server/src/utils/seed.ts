import { Admin } from '../models/Admin';
import { PricingRule } from '../models/PricingRule';

/**
 * Seeds a default admin user if none exists.
 */
export const seedAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: 'VSY Admin',
        email: process.env.ADMIN_EMAIL || 'admin@vsyboxcricket.com',
        password: process.env.ADMIN_PASSWORD || 'adminpassword123',
      });
      console.log(`✅ Default admin seeded: ${process.env.ADMIN_EMAIL || 'admin@vsyboxcricket.com'}`);
    }
    
    // Also seed default pricing if empty or outdated
    const existingRules = await PricingRule.find();
    const needsUpdate = existingRules.length < 16 || existingRules.some(r => r.endHour !== 18 && r.endHour !== 6);

    if (needsUpdate) {
      console.log('🌱 Generating/Repairing default pricing rules...');
      const defaultRules = [];
      const turfs: TurfId[] = ['A', 'B', 'C', 'D'];
      
      // Clear existing if incomplete to avoid duplicates during re-seed
      if (existingRules.length > 0) {
        await PricingRule.deleteMany({});
      }
      
      for (const turfId of turfs) {
        const isBowling = turfId === 'C';
        // Day (6 AM - 6 PM)
        defaultRules.push({ turfId, dayType: 'weekday', startHour: 6, endHour: 18, price: isBowling ? 60 : 800 });
        // Night (6 PM - 6 AM)
        defaultRules.push({ turfId, dayType: 'weekday', startHour: 18, endHour: 6, price: isBowling ? 60 : 1200 });
        // Weekend Day (6 AM - 6 PM)
        defaultRules.push({ turfId, dayType: 'weekend', startHour: 6, endHour: 18, price: isBowling ? 60 : 1000 });
        // Weekend Night (6 PM - 6 AM)
        defaultRules.push({ turfId, dayType: 'weekend', startHour: 18, endHour: 6, price: isBowling ? 60 : 1500 });
      }
      
      await PricingRule.insertMany(defaultRules);
      console.log('✅ Default pricing rules seeded successfully for all 4 turfs');
    } else {
      console.log('✅ Pricing rules already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};
