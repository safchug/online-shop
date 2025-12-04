import {
  Order,
  OrderStatus,
  OrderItem,
  ShippingAddress,
} from "@/types/order.types";
import {
  Product,
  ProductCategory,
  ProductImage,
  CreateProductData,
} from "@/types/product.types";

export const mockShippingAddress: ShippingAddress = {
  fullName: "John Doe",
  addressLine1: "123 Main St",
  addressLine2: "Apt 4B",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  country: "USA",
  phoneNumber: "+1234567890",
};

export const mockOrderItems: OrderItem[] = [
  {
    productId: "1",
    name: "Laptop",
    price: 999.99,
    quantity: 1,
    subtotal: 999.99,
  },
  {
    productId: "2",
    name: "Mouse",
    price: 29.99,
    quantity: 2,
    subtotal: 59.98,
  },
];

export const mockOrder: Order = {
  id: "order-123",
  userId: "user-456",
  orderNumber: "ORD-2025-001",
  items: mockOrderItems,
  subtotal: 1059.97,
  tax: 84.8,
  shippingCost: 10.0,
  total: 1154.77,
  shippingAddress: mockShippingAddress,
  status: OrderStatus.PENDING,
  paymentId: "pay-789",
  notes: "Please handle with care",
  createdAt: "2025-12-01T10:00:00Z",
  updatedAt: "2025-12-01T10:00:00Z",
};

export const mockOrders: Order[] = [
  mockOrder,
  {
    ...mockOrder,
    id: "order-124",
    orderNumber: "ORD-2025-002",
    status: OrderStatus.PROCESSING,
    createdAt: "2025-12-01T11:00:00Z",
    updatedAt: "2025-12-01T11:00:00Z",
  },
  {
    ...mockOrder,
    id: "order-125",
    orderNumber: "ORD-2025-003",
    status: OrderStatus.SHIPPED,
    trackingNumber: "TRACK123456",
    shippedAt: "2025-12-01T12:00:00Z",
    createdAt: "2025-12-01T09:00:00Z",
    updatedAt: "2025-12-01T12:00:00Z",
  },
];

export const mockPaginatedOrders = {
  orders: mockOrders,
  total: 3,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const mockCreateOrderData = {
  items: mockOrderItems,
  subtotal: 1059.97,
  tax: 84.8,
  shippingCost: 10.0,
  total: 1154.77,
  shippingAddress: mockShippingAddress,
  notes: "Please handle with care",
};

export const mockUser = {
  id: "user-456",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "user",
  isEmailVerified: true,
};

export const mockAdminUser = {
  ...mockUser,
  id: "admin-123",
  email: "admin@example.com",
  role: "admin",
};

export const mockVendorUser = {
  ...mockUser,
  id: "vendor-123",
  email: "vendor@example.com",
  role: "vendor",
};

// Product Mock Data
export const mockProductImages: ProductImage[] = [
  {
    url: "https://example.com/image1.jpg",
    alt: "Product Image 1",
    isPrimary: true,
  },
  {
    url: "https://example.com/image2.jpg",
    alt: "Product Image 2",
    isPrimary: false,
  },
];

export const mockProduct: Product = {
  _id: "product-123",
  name: "Test Laptop",
  description: "A high-performance laptop for testing",
  sku: "LAPTOP-001",
  price: 999.99,
  compareAtPrice: 1299.99,
  stock: 10,
  category: ProductCategory.ELECTRONICS,
  tags: ["electronics", "laptop", "computer"],
  images: mockProductImages,
  brand: "TestBrand",
  isActive: true,
  isFeatured: true,
  vendorId: "vendor-123",
  averageRating: 4.5,
  reviewCount: 10,
  reviews: [
    {
      userId: "user-1",
      rating: 5,
      comment: "Great product!",
      createdAt: "2025-12-01T10:00:00Z",
    },
    {
      userId: "user-2",
      rating: 4,
      comment: "Good quality",
      createdAt: "2025-12-01T11:00:00Z",
    },
  ],
  soldCount: 50,
  viewCount: 200,
  createdAt: "2025-11-01T10:00:00Z",
  updatedAt: "2025-12-01T10:00:00Z",
};

export const mockProducts: Product[] = [
  mockProduct,
  {
    ...mockProduct,
    _id: "product-124",
    name: "Wireless Mouse",
    sku: "MOUSE-001",
    price: 29.99,
    compareAtPrice: undefined,
    stock: 50,
    category: ProductCategory.ELECTRONICS,
    tags: ["electronics", "mouse", "wireless"],
    isFeatured: false,
    averageRating: 4.2,
    reviewCount: 5,
    soldCount: 100,
  },
  {
    ...mockProduct,
    _id: "product-125",
    name: "Programming Book",
    sku: "BOOK-001",
    price: 49.99,
    stock: 0,
    category: ProductCategory.BOOKS,
    tags: ["books", "programming"],
    isFeatured: false,
    averageRating: 4.8,
    reviewCount: 25,
    soldCount: 75,
  },
];

export const mockPaginatedProducts = {
  products: mockProducts,
  total: 3,
  page: 1,
  limit: 12,
  totalPages: 1,
};

export const mockCreateProductData: CreateProductData = {
  name: "New Product",
  description: "A brand new product",
  sku: "NEW-001",
  price: 199.99,
  compareAtPrice: 249.99,
  stock: 20,
  category: ProductCategory.ELECTRONICS,
  tags: ["new", "electronics"],
  images: mockProductImages,
  brand: "NewBrand",
  isActive: true,
  isFeatured: false,
};
