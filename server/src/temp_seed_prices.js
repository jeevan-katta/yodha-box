const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yodha-nets').then(async () => {
    const pSchema = new mongoose.Schema({
        turfId: { type: String, default: 'A' },
        dayType: String,
        startHour: Number,
        endHour: Number,
        price: Number,
        isActive: Boolean
    });
    const PR = mongoose.model('PricingRule', pSchema);
    
    // Clear all existing pricing rules to start fresh
    await PR.deleteMany({});

    const newRules = [
        // Turf A
        { turfId: 'A', dayType: 'weekday', startHour: 6,  endHour: 18, price: 800, isActive: true },
        { turfId: 'A', dayType: 'weekday', startHour: 18, endHour: 6,  price: 700, isActive: true },
        { turfId: 'A', dayType: 'weekend', startHour: 6,  endHour: 18, price: 900, isActive: true },
        { turfId: 'A', dayType: 'weekend', startHour: 18, endHour: 6,  price: 1000, isActive: true },

        // Turf B
        { turfId: 'B', dayType: 'weekday', startHour: 6,  endHour: 18, price: 900, isActive: true },
        { turfId: 'B', dayType: 'weekday', startHour: 18, endHour: 6,  price: 800, isActive: true },
        { turfId: 'B', dayType: 'weekend', startHour: 6,  endHour: 18, price: 900, isActive: true },
        { turfId: 'B', dayType: 'weekend', startHour: 18, endHour: 6,  price: 1000, isActive: true },
    ];

    await PR.insertMany(newRules);
    console.log('Successfully set specific Turf A and Turf B prices!');
    
    process.exit(0);
});
