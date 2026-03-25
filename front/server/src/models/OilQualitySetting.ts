import mongoose, { Schema, Document } from 'mongoose';

export interface IOilQualitySetting extends Document {
    quality_name: 'extra_virgin' | 'virgin' | 'third_quality';
    liters_per_kg: number;
    price_per_liter: number;
    processing_price_per_kg: number;
}

const OilQualitySettingSchema = new Schema<IOilQualitySetting>({
    quality_name: {
        type: String,
        enum: ['extra_virgin', 'virgin', 'third_quality'],
        required: true,
        unique: true,
    },
    liters_per_kg: { type: Number, required: true },
    price_per_liter: { type: Number, required: true },
    processing_price_per_kg: { type: Number, required: true },
});

export const OilQualitySetting = mongoose.model<IOilQualitySetting>(
    'OilQualitySetting',
    OilQualitySettingSchema
);
