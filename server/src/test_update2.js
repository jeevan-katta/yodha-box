const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yodha-nets').then(async () => {
    try {
        const PR = mongoose.connection.collection('pricingrules');
        const docs = await PR.find({}).toArray();
        console.log("Found docs:", docs.length);
        if(docs.length > 0) {
            const docId = docs[0]._id;
            console.log("Updating rule:", docId);
            const { PricingRule } = require('./models/PricingRule');
            const rule = await PricingRule.findByIdAndUpdate(docId, { price: 999 }, {
              new: true,
              runValidators: true
            });
            console.log("Updated:", rule);
        }
    } catch(err) {
        console.error("Error:", err);
    }
    process.exit(0);
});
