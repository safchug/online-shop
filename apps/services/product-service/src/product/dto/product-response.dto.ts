import {
  ProductCategory,
  ProductImage,
  ProductDimensions,
} from "../../entities/product.entity";

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: ProductCategory;
  tags: string[];
  images: ProductImage[];
  brand?: string;
  dimensions?: ProductDimensions;
  isActive: boolean;
  isFeatured: boolean;
  vendorId?: string;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
