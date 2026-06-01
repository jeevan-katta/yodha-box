import mongoose from 'mongoose';
import { clear } from 'console';

async function test() {
    await mongoose.connect('mongodb://localhost:27017/yodha-nets');
    const { PricingRule } = await import('./models/PricingRule');
    
    try {
        const rules = await PricingRule.find();
        if(rules.length > 0) {
            const rule = rules[0];
            console.log('Testing update on rule:', rule._id);
            const updated = await PricingRule.findByIdAndUpdate(rule._id.toString(), { price: rule.price + 1 }, {
                new: true,
                runValidators: true,
            });
            console.log('Update success:', updated ? 'yes' : 'no');
            if (!updated) console.log('Null updated rule');
        } else {
            console.log('No rules found');
        }
    } catch(err: any) {
        console.error('Update failed:', err.message);
    }
    
    process.exit(0);
}
test();
