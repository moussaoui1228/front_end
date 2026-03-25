import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingRate extends Document {
    wilaya: string;
    wilaya_code: number;
    price: number;
}

const ShippingRateSchema = new Schema<IShippingRate>({
    wilaya: { type: String, required: true, unique: true },
    wilaya_code: { type: Number, required: true, unique: true },
    price: { type: Number, required: true },
});

export const ShippingRate = mongoose.model<IShippingRate>('ShippingRate', ShippingRateSchema);
