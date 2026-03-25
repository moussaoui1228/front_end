
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const OrderSchema = new mongoose.Schema({
    items: [{
        olive_category_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.model_type' },
        model_type: { type: String }
    }]
});
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const DynamicSchema = new mongoose.Schema({ name: String }, { strict: false });
const OliveCategory = mongoose.models.OliveCategory || mongoose.model('OliveCategory', DynamicSchema, 'olivecategories');
const Product = mongoose.models.Product || mongoose.model('Product', DynamicSchema, 'products');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const orders = await Order.find({}).sort({ created_at: -1 }).limit(3);
        console.log(`Found ${orders.length} orders`);

        for (const order of orders) {
            console.log(`\nOrder: ${order._id}`);
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                const id = item.olive_category_id;
                const type = item.model_type;
                console.log(`  Item ${i}: ID=${id} (${typeof id}), type=${type}`);
                
                const model = type === 'Product' ? Product : OliveCategory;
                const doc = await model.findById(id);
                if (doc) {
                    console.log(`    FOUND in ${type}: ${doc.name}`);
                } else {
                    console.log(`    NOT FOUND in ${type}`);
                    const altType = type === 'Product' ? 'OliveCategory' : 'Product';
                    const altModel = type === 'Product' ? OliveCategory : Product;
                    const altDoc = await altModel.findById(id);
                    if (altDoc) {
                        console.log(`    WARNING: Found in WRONG collection (${altType}): ${altDoc.name}`);
                    }
                }
            }
        }

        console.log('\n--- POPULATION TEST ---');
        const populated = await Order.find({}).sort({ created_at: -1 }).limit(3).populate('items.olive_category_id');
        populated.forEach(o => {
            console.log(`Order ${o._id}:`);
            o.items.forEach((it, idx) => {
                console.log(`  Item ${idx}: Populated=${it.olive_category_id && typeof it.olive_category_id === 'object'}`);
                if (it.olive_category_id && typeof it.olive_category_id === 'object') {
                    console.log(`    Name: ${it.olive_category_id.name}`);
                }
            });
        });

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
debug();
