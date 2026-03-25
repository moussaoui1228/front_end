// MongoDB specific Types

export type UserRole = 'customer' | 'owner';
export type ShippingMethod = 'delivery' | 'pickup';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type OilQualityEnum = 'extra_virgin' | 'virgin' | 'third_quality';
export type PaymentMethod = 'money' | 'olives';
export type PressingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

// Base entity interface for common properties
export interface BaseEntity {
    _id?: string;
    created_at?: Date;
}

export interface User extends BaseEntity {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    role: UserRole;
}

export interface ShippingRate extends BaseEntity {
    wilaya: string;
    price: number;
}

export interface OilQualitySetting extends BaseEntity {
    quality_name: OilQualityEnum;
    liters_per_kg: number;
}

export interface GlobalSettings extends BaseEntity {
    price_per_liter: number;
    pressing_price_per_kg: number;
    percentage_taken: number;
    updated_at: Date;
}

export interface Order extends BaseEntity {
    user_id: string; // Ref: Users
    quantity_liters: number;
    price_per_liter: number; // Snapshot
    product_total: number;
    shipping: {
        type: ShippingMethod;
        wilaya?: string;
        cost: number; // Snapshot
        pickup_date?: string; // ISODate string
    };
    total_price: number;
    status: OrderStatus;
}

export interface PressingRequest extends BaseEntity {
    user_id: string; // Ref: Users
    olive_quantity_kg: number;
    oil_quality: OilQualityEnum;
    yield: {
        liters_per_kg: number; // Snapshot
        produced_oil_liters: number;
    };
    payment: {
        type: PaymentMethod;
        pressing_price_per_kg?: number; // Snapshot
        percentage_taken?: number; // Snapshot
    };
    status: PressingStatus;
}
