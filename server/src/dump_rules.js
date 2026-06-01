const mongoose = require('mongoose');

async function test() {
    await mongoose.connect('mongodb://localhost:27017/yodha-nets');
    const db = mongoose.connection.useDb('yodha-nets');
    const rules = await db.collection('pricingrules').find({}).toArray();
    console.log(rules);
    process.exit(0);
}
test();
