import mongoose, { Schema, Document } from 'mongoose';

export interface IOliveCategory extends Document {
    name: string;
    price_per_liter: number;
    stock_liters: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

const OliveCategorySchema = new Schema<IOliveCategory>({
    name: { type: String, required: true, unique: true, trim: true },
    price_per_liter: { type: Number, required: true },
    stock_liters: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const OliveCategory = mongoose.model<IOliveCategory>('OliveCategory', OliveCategorySchema);
