import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    olive_category_id: mongoose.Types.ObjectId; // Generic ID field
    model_type: 'OliveCategory' | 'Product';
    pressing_service_id?: mongoose.Types.ObjectId;
    quantity: number;
    olive_price_at_order: number; // Snapshot
    pressing_fee_at_order: number; // Snapshot
    subtotal: number;
}

export interface IOrder extends Document {
    user_id: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shipping?: {
        type: 'delivery' | 'pickup';
        wilaya?: string;
        cost: number;
        pickup_date?: Date;
        pickup_range_start?: Date;
        pickup_range_end?: Date;
        pickup_hours?: string;
        pickup_status?: 'pending' | 'proposed' | 'accepted' | 'rejected' | 'collected';
    };
    total_price: number;
    status: 'pending' | 'in-progress' | 'completed' | 'delivered' | 'cancelled';
    owner_notes?: string;
    tracking_code: string;
    is_archived: boolean;
    created_at: Date;
    updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    olive_category_id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'items.model_type'
    },
    model_type: {
        type: String,
        required: true,
        enum: ['OliveCategory', 'Product'],
        default: 'OliveCategory'
    },
    pressing_service_id: { type: Schema.Types.ObjectId, ref: 'PressingService' },
    quantity: { type: Number, required: true },
    olive_price_at_order: { type: Number, required: true },
    pressing_fee_at_order: { type: Number, required: true },
    subtotal: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shipping: {
        type: { type: String, enum: ['delivery', 'pickup'] },
        wilaya: { type: String },
        cost: { type: Number, default: 0 },
        pickup_date: { type: Date },
        pickup_range_start: { type: Date },
        pickup_range_end: { type: Date },
        pickup_hours: { type: String },
        pickup_status: { 
            type: String, 
            enum: ['pending', 'proposed', 'accepted', 'rejected', 'collected'],
            default: 'pending'
        },
    },
    total_price: { type: Number, required: true },
    tracking_code: { type: String, unique: true, sparse: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'delivered', 'cancelled'],
        default: 'pending',
    },
    owner_notes: { type: String, default: "" },
    is_archived: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
