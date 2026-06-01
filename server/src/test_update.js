const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yodha-nets').then(async () => {
    const { PricingRule } = require('./models/PricingRule');
    
    try {
        const rules = await PricingRule.find();
        if(rules.length > 0) {
            const rule = rules[0];
            console.log('Testing update on rule:', rule._id);
            const updated = await PricingRule.findByIdAndUpdate(rule._id, { price: rule.price + 1 }, {
                new: true,
                runValidators: true,
            });
            console.log('Update success:', updated);
        } else {
            console.log('No rules found');
        }
    } catch(err) {
        console.error('Update failed:', err.message);
    }
    
    process.exit(0);
});
