import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    category: 'extra_virgin' | 'virgin' | 'third_quality';
    price_per_liter: number;
    stock_liters: number;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['extra_virgin', 'virgin', 'third_quality'],
            required: true,
        },
        price_per_liter: { type: Number, required: true },
        stock_liters: { type: Number, default: 0 },
        is_available: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
