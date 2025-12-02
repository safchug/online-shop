import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

@Schema({
  timestamps: true,
  collection: "orders",
})
export class Order {
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  orderNumber: string;

  @Prop({
    required: true,
    type: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
  })
  items: OrderItem[];

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ required: true, type: Number, default: 0 })
  tax: number;

  @Prop({ required: true, type: Number, default: 0 })
  shippingCost: number;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({
    required: true,
    type: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
  })
  shippingAddress: ShippingAddress;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ type: String })
  paymentId?: string;

  @Prop({ type: String })
  trackingNumber?: string;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: String })
  cancellationReason?: string;

  @Prop({ type: String })
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Create indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
// orderNumber index already created by unique: true in @Prop
OrderSchema.index({ status: 1 });
