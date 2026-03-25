import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ShippingRate } from './models/ShippingRate';
import { OilQualitySetting } from './models/OilQualitySetting';
import { Settings } from './models/Settings';
import { OliveCategory } from './models/OliveCategory';
import { PressingService } from './models/PressingService';

dotenv.config();

const wilayas = [
    // ... (wilayas array remains same)
];

const oilQualities = [
    { quality_name: 'extra_virgin', liters_per_kg: 5, price_per_liter: 2500, processing_price_per_kg: 40 },
    { quality_name: 'virgin', liters_per_kg: 4.5, price_per_liter: 1800, processing_price_per_kg: 35 },
    { quality_name: 'third_quality', liters_per_kg: 4, price_per_liter: 1200, processing_price_per_kg: 30 },
];

const oliveCategories = [
    { name: 'Récolte Précoce (Vert)', price_per_liter: 1200 },
    { name: 'Récolte Standard (Noir)', price_per_liter: 800 },
    { name: 'Biologique Certifié', price_per_liter: 1500 },
];

const pressingServices = [
    { name: 'Service de Trituration (Semi-Automatique)', category: 'extra_virgin', fee: 35 },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Shipping rates
    await ShippingRate.deleteMany({});
    // ... (insertion logic remains same)
    console.log('✅ Shipping rates seeded');

    // Oil quality settings
    await OilQualitySetting.deleteMany({});
    await OilQualitySetting.insertMany(oilQualities);
    console.log('✅ Oil quality settings seeded');

    // Olive Categories (NEW)
    await OliveCategory.deleteMany({});
    await OliveCategory.insertMany(oliveCategories);
    console.log('✅ Olive categories seeded');

    // Pressing Services (NEW)
    await PressingService.deleteMany({});
    await PressingService.insertMany(pressingServices);
    console.log('✅ Pressing services seeded');

    // Global settings
    await Settings.deleteMany({});
    await Settings.create({ pressing_percentage_taken: 30 });
    console.log('✅ Global settings seeded');

    await mongoose.disconnect();
    console.log('🎉 Seeding complete!');
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
