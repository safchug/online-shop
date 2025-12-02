import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProductDocument = Product & Document;

export enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  BOOKS = "books",
  HOME = "home",
  SPORTS = "sports",
  TOYS = "toys",
  FOOD = "food",
  BEAUTY = "beauty",
  OTHER = "other",
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: string;
}

export interface ProductReview {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

@Schema({
  timestamps: true,
  collection: "products",
})
export class Product {
  @Prop({ required: true, type: String, trim: true })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: String, unique: true })
  sku: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, min: 0 })
  compareAtPrice?: number;

  @Prop({ required: true, type: Number, min: 0, default: 0 })
  stock: number;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ProductCategory),
    default: ProductCategory.OTHER,
  })
  category: ProductCategory;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  images: ProductImage[];

  @Prop({ type: String })
  brand?: string;

  @Prop({
    type: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      weight: { type: Number },
      unit: { type: String, default: "cm" },
    },
  })
  dimensions?: ProductDimensions;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Types.ObjectId })
  vendorId?: Types.ObjectId;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  averageRating: number;

  @Prop({ type: Number, min: 0, default: 0 })
  reviewCount: number;

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reviews: ProductReview[];

  @Prop({ type: Number, default: 0 })
  soldCount: number;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Map, of: String })
  metadata?: Map<string, string>;

  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Create indexes
ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ vendorId: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ soldCount: -1 });
