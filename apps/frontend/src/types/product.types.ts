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
  createdAt: string;
}

export interface Product {
  _id: string;
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
  reviews: ProductReview[];
  soldCount: number;
  viewCount: number;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: ProductCategory;
  tags?: string[];
  images?: ProductImage[];
  brand?: string;
  dimensions?: ProductDimensions;
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, string>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating' | 'sold';
  sortOrder?: 'asc' | 'desc';
}

export interface AddReviewData {
  rating: number;
  comment: string;
}
