
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Define ALL models explicitly for this test
        const OrderItemSchema = new mongoose.Schema({
            olive_category_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.model_type' },
            model_type: { type: String }
        });
        const OrderSchema = new mongoose.Schema({
            items: [OrderItemSchema]
        }, { collection: 'orders' });

        const ProductSchema = new mongoose.Schema({ name: String }, { collection: 'products' });
        const OliveCategorySchema = new mongoose.Schema({ name: String }, { collection: 'olivecategories' });

        const Order = mongoose.models.TestOrder || mongoose.model('TestOrder', OrderSchema);
        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
        const OliveCategory = mongoose.models.OliveCategory || mongoose.model('OliveCategory', OliveCategorySchema);

        console.log('Testing with refPath: items.model_type');
        const orders = await Order.find({}).sort({ created_at: -1 }).limit(1).populate('items.olive_category_id');
        console.log('Result:', JSON.stringify(orders[0]?.items[0], null, 2));

        // Try again with different schema
        delete mongoose.models.TestOrder2;
        const OrderItemSchema2 = new mongoose.Schema({
            olive_category_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'model_type' },
            model_type: { type: String }
        });
        const OrderSchema2 = new mongoose.Schema({ items: [OrderItemSchema2] }, { collection: 'orders' });
        const Order2 = mongoose.model('TestOrder2', OrderSchema2);
        
        console.log('\nTesting with refPath: model_type');
        const orders2 = await Order2.find({}).sort({ created_at: -1 }).limit(1).populate('items.olive_category_id');
        console.log('Result:', JSON.stringify(orders2[0]?.items[0], null, 2));

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
run();
