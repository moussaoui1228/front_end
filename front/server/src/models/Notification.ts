import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user_id: mongoose.Types.ObjectId;
    order_id?: mongoose.Types.ObjectId;
    pressing_id?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    is_read: boolean;
    created_at: Date;
}

const NotificationSchema = new Schema<INotification>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
    pressing_id: { type: Schema.Types.ObjectId, ref: 'PressingRequest' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
