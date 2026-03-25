
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import the REAL models
// We'll use require because we are running with node
// Note: This might fail if they are TS files, but let's try to just use raw mongoose with schema if it fails
try {
    const { Order } = require('./models/Order');
    const { Product } = require('./models/Product');
    const { OliveCategory } = require('./models/OliveCategory');

    async function run() {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find({}).sort({ created_at: -1 }).limit(1).populate('items.olive_category_id');
        console.log(JSON.stringify(orders[0]?.items[0], null, 2));
        await mongoose.disconnect();
    }
    run();
} catch (e) {
    console.error('Model import failed, using raw schema fallback');
    // Fallback if transpilation/import fails
    const OrderSchema = new mongoose.Schema({
        items: [{
            olive_category_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.model_type' },
            model_type: { type: String }
        }]
    });
    const Order = mongoose.model('Order', OrderSchema);
    mongoose.model('Product', new mongoose.Schema({ name: String }));
    mongoose.model('OliveCategory', new mongoose.Schema({ name: String }));

    async function runFallback() {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find({}).sort({ created_at: -1 }).limit(1).populate('items.olive_category_id');
        console.log(JSON.stringify(orders[0]?.items[0], null, 2));
        await mongoose.disconnect();
    }
    runFallback();
}
