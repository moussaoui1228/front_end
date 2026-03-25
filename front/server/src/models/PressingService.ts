import mongoose, { Schema, Document } from 'mongoose';

export interface IPressingService extends Document {
    name: string;
    category: 'extra_virgin' | 'virgin' | 'third_quality';
    fee: number;
    yield_per_kg: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

const PressingServiceSchema = new Schema<IPressingService>({
    name: { type: String, required: true, unique: true, trim: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['extra_virgin', 'virgin', 'third_quality'] 
    },
    fee: { type: Number, required: true },
    yield_per_kg: { type: Number, required: true, default: 0.2 },
    active: { type: Boolean, default: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const PressingService = mongoose.model<IPressingService>('PressingService', PressingServiceSchema);
