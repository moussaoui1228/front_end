import mongoose, { Schema, Document } from 'mongoose';

// ------------------------------------------------------------------
// 1. Users
// ------------------------------------------------------------------
export interface IUser extends Document {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password?: string; // Hashed (Optional because of OAuth potentials)
    role: 'customer' | 'owner';
    created_at: Date;
}

const UserSchema = new Schema<IUser>({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'owner'], default: 'customer' },
    created_at: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);

// ------------------------------------------------------------------
// 2. Shipping Rates (Owner Config A)
// ------------------------------------------------------------------
export interface IShippingRate extends Document {
    wilaya: string;
    price: number;
}

const ShippingRateSchema = new Schema<IShippingRate>({
    wilaya: { type: String, required: true, unique: true },
    price: { type: mongoose.Schema.Types.Decimal128, required: true },
});

export const ShippingRate = mongoose.model<IShippingRate>('ShippingRate', ShippingRateSchema);

// ------------------------------------------------------------------
// 3. Oil Quality Settings (Owner Config B)
// ------------------------------------------------------------------
export interface IOilQualitySetting extends Document {
    quality_name: 'extra_virgin' | 'virgin' | 'third_quality';
    liters_per_kg: number;
}

const OilQualitySettingSchema = new Schema<IOilQualitySetting>({
    quality_name: {
        type: String,
        enum: ['extra_virgin', 'virgin', 'third_quality'],
        required: true,
        unique: true
    },
    liters_per_kg: { type: mongoose.Schema.Types.Decimal128, required: true },
});

export const OilQualitySetting = mongoose.model<IOilQualitySetting>('OilQualitySetting', OilQualitySettingSchema);

// ------------------------------------------------------------------
// 4. Global Settings (Owner Config C)
// ------------------------------------------------------------------
export interface IGlobalSettings extends Document {
    price_per_liter: number;
    pressing_price_per_kg: number;
    percentage_taken: number;
    updated_at: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>({
    price_per_liter: { type: mongoose.Schema.Types.Decimal128, required: true },
    pressing_price_per_kg: { type: mongoose.Schema.Types.Decimal128, required: true },
    percentage_taken: { type: mongoose.Schema.Types.Decimal128, required: true },
    updated_at: { type: Date, default: Date.now },
});

export const GlobalSettings = mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);


// ------------------------------------------------------------------
// 5. Orders (Customer Functionality A)
// ------------------------------------------------------------------
export interface IOrder extends Document {
    user_id: mongoose.Types.ObjectId;
    quantity_liters: number;
    price_per_liter: number; // Snapshot
    product_total: number;   // Calculated
    shipping: {
        type: 'delivery' | 'pickup';
        wilaya?: string;
        cost: number;          // Snapshot (0 if pickup)
        pickup_date?: Date;
    };
    total_price: number;     // Calculated
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: Date;
}

const OrderSchema = new Schema<IOrder>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantity_liters: { type: mongoose.Schema.Types.Decimal128, required: true },
    price_per_liter: { type: mongoose.Schema.Types.Decimal128, required: true },
    product_total: { type: mongoose.Schema.Types.Decimal128, required: true },
    shipping: {
        type: { type: String, enum: ['delivery', 'pickup'], required: true },
        wilaya: { type: String },
        cost: { type: mongoose.Schema.Types.Decimal128, required: true },
        pickup_date: { type: Date }
    },
    total_price: { type: mongoose.Schema.Types.Decimal128, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    created_at: { type: Date, default: Date.now },
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

// ------------------------------------------------------------------
// 6. Pressing Requests (Customer Functionality B)
// ------------------------------------------------------------------
export interface IPressingRequest extends Document {
    user_id: mongoose.Types.ObjectId;
    olive_quantity_kg: number;
    oil_quality: 'extra_virgin' | 'virgin' | 'third_quality';
    yield: {
        liters_per_kg: number;          // Snapshot
        produced_oil_liters: number;    // Calculated
    };
    payment: {
        type: 'money' | 'olives';
        pressing_price_per_kg?: number; // Snapshot
        percentage_taken?: number;      // Snapshot
    };
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    created_at: Date;
}

const PressingRequestSchema = new Schema<IPressingRequest>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    olive_quantity_kg: { type: mongoose.Schema.Types.Decimal128, required: true },
    oil_quality: { type: String, enum: ['extra_virgin', 'virgin', 'third_quality'], required: true },
    yield: {
        liters_per_kg: { type: mongoose.Schema.Types.Decimal128, required: true },
        produced_oil_liters: { type: mongoose.Schema.Types.Decimal128, required: true },
    },
    payment: {
        type: { type: String, enum: ['money', 'olives'], required: true },
        pressing_price_per_kg: { type: mongoose.Schema.Types.Decimal128 },
        percentage_taken: { type: mongoose.Schema.Types.Decimal128 },
    },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
    created_at: { type: Date, default: Date.now },
});

export const PressingRequest = mongoose.model<IPressingRequest>('PressingRequest', PressingRequestSchema);
