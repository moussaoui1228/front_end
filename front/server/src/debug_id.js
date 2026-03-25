
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DynamicSchema = new mongoose.Schema({ name: String }, { strict: false });
const OliveCategory = mongoose.models.OliveCategory || mongoose.model('OliveCategory', DynamicSchema, 'olivecategories');
const Product = mongoose.models.Product || mongoose.model('Product', DynamicSchema, 'products');
const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({ items: Array }, { strict: false }));

async function search() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const target = '69b194a61e1b475a1f3a7079';
        console.log(`Searching for ID: ${target}`);

        // 1. Search in products
        const p = await Product.findById(target);
        if (p) console.log(`Found in Products: ${p.name}`);
        else console.log('Not in Products');

        // 2. Search in olivecategories
        const c = await OliveCategory.findById(target);
        if (c) console.log(`Found in OliveCategories: ${c.name}`);
        else console.log('Not in OliveCategories');

        // 3. Search in all orders
        const orders = await Order.find({ "items.olive_category_id": new mongoose.Types.ObjectId(target) });
        console.log(`Found in ${orders.length} orders`);
        
        if (orders.length > 0) {
            orders.forEach(o => {
                const item = o.items.find(it => it.olive_category_id.toString() === target);
                console.log(`  Order ${o._id}: model_type=${item?.model_type}`);
            });
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
search();
