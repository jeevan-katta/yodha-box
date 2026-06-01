const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.connect('mongodb://localhost:27017/yodha-nets').then(async () => {
    const pSchema = new Schema({
        turfId: { type: String, default: 'A' },
        dayType: String,
        startHour: Number,
        endHour: Number,
        price: Number,
        isActive: Boolean
    });
    const PR = mongoose.model('PricingRule', pSchema);
    
    // Update existing rules to have turfId A
    await PR.updateMany({ turfId: { $exists: false } }, { $set: { turfId: 'A' } });

    // Find rules for A and duplicate for B if B doesn't exist
    const rulesA = await PR.find({ turfId: 'A' });
    const countB = await PR.countDocuments({ turfId: 'B' });
    if (countB === 0 && rulesA.length > 0) {
        const rulesB = rulesA.map(r => {
            const rObj = r.toObject();
            delete rObj._id;
            rObj.turfId = 'B';
            return rObj;
        });
        await PR.insertMany(rulesB);
        console.log('Duplicated ' + rulesA.length + ' rules for Turf B');
    } else {
        console.log('Turf B rules already exist or no Turf A rules to copy');
    }
    process.exit(0);
});
