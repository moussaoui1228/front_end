import mongoose, { Schema, Document } from 'mongoose';

export interface IPressingRequest extends Document {
    user_id: mongoose.Types.ObjectId;
    olive_quantity_kg: number;
    oil_quality: 'extra_virgin' | 'virgin' | 'third_quality';
    yield: {
        liters_per_kg: number;
        produced_oil_liters: number;
    };
    payment: {
        type: 'money' | 'olives';
        pressing_price_per_kg?: number;
        percentage_taken?: number;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    bring_olives_date?: Date;
    collect_oil_date?: Date;
    owner_notes?: string;
    tracking_code: string;
    is_archived: boolean;
    created_at: Date;
    updated_at: Date;
}

const PressingRequestSchema = new Schema<IPressingRequest>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    olive_quantity_kg: { type: Number, required: true },
    oil_quality: {
        type: String,
        enum: ['extra_virgin', 'virgin', 'third_quality'],
        required: true,
    },
    yield: {
        liters_per_kg: { type: Number, required: true },
        produced_oil_liters: { type: Number, required: true },
    },
    payment: {
        type: { type: String, enum: ['money', 'olives'], required: true },
        pressing_price_per_kg: { type: Number },
        percentage_taken: { type: Number },
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending',
    },
    bring_olives_date: { type: Date },
    collect_oil_date: { type: Date },
    owner_notes: { type: String, default: "" },
    tracking_code: { type: String, unique: true, sparse: true },
    is_archived: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const PressingRequest = mongoose.model<IPressingRequest>(
    'PressingRequest',
    PressingRequestSchema
);
