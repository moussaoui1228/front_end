
import mongoose from 'mongoose';
import { Order } from './models/Order';
import { OliveCategory } from './models/OliveCategory';
import { Product } from './models/Product';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function debug() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const orders = await Order.find({}).sort({ created_at: -1 }).limit(5);
        console.log(`Checking ${orders.length} orders...`);

        for (const order of orders) {
            console.log(`\nOrder: ${order._id}`);
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                console.log(`  Item ${i}:`);
                console.log(`    olive_category_id: ${item.olive_category_id} (Type: ${typeof item.olive_category_id}, IsObjectId: ${item.olive_category_id instanceof mongoose.Types.ObjectId})`);
                console.log(`    model_type: ${item.model_type}`);
                
                const model = item.model_type === 'Product' ? Product : OliveCategory;
                const doc = await model.findById(item.olive_category_id);
                if (doc) {
                    console.log(`    FOUND in ${item.model_type}: ${doc.name}`);
                } else {
                    console.log(`    NOT FOUND in ${item.model_type}`);
                    // Check other one just in case
                    const altModel = item.model_type === 'Product' ? OliveCategory : Product;
                    const altDoc = await altModel.findById(item.olive_category_id);
                    if (altDoc) {
                        console.log(`    WARNING: Found in WRONG model (${item.model_type === 'Product' ? 'OliveCategory' : 'Product'}): ${altDoc.name}`);
                    }
                }
            }
        }

        console.log('\n--- Population Test ---');
        const populated = await Order.find({}).sort({ created_at: -1 }).limit(5).populate('items.olive_category_id');
        populated.forEach(o => {
            console.log(`Order ${o._id}:`);
            o.items.forEach((it: any, idx) => {
                console.log(`  Item ${idx}: Populated=${it.olive_category_id && typeof it.olive_category_id === 'object'}`);
                if (it.olive_category_id && typeof it.olive_category_id === 'object') {
                    console.log(`    Name: ${it.olive_category_id.name}`);
                }
            });
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Debug Error:', err);
    }
}

debug();
