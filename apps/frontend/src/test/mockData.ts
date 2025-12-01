import {
  Order,
  OrderStatus,
  OrderItem,
  ShippingAddress,
} from "@/types/order.types";

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
