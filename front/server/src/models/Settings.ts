import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    pressing_percentage_taken: number;
    updated_at: Date;
}

const SettingsSchema = new Schema<ISettings>({
    pressing_percentage_taken: { type: Number, required: true, default: 30 },
    updated_at: { type: Date, default: Date.now },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
