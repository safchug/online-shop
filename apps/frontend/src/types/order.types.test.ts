import { describe, it, expect } from "vitest";
import {
  Order,
  OrderStatus,
  OrderItem,
  ShippingAddress,
  CreateOrderData,
  UpdateOrderStatusData,
  CancelOrderData,
  OrderFilters,
} from "@/types/order.types";

describe("Order Types", () => {
  describe("OrderStatus", () => {
    it("should have all required status values", () => {
      expect(OrderStatus.PENDING).toBe("pending");
      expect(OrderStatus.PROCESSING).toBe("processing");
      expect(OrderStatus.SHIPPED).toBe("shipped");
      expect(OrderStatus.DELIVERED).toBe("delivered");
      expect(OrderStatus.CANCELLED).toBe("cancelled");
    });
  });

  describe("OrderItem", () => {
    it("should match OrderItem interface", () => {
      const item: OrderItem = {
        productId: "1",
        name: "Test Product",
        price: 99.99,
        quantity: 2,
        subtotal: 199.98,
      };

      expect(item.productId).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.price).toBeDefined();
      expect(item.quantity).toBeDefined();
      expect(item.subtotal).toBeDefined();
    });
  });

  describe("ShippingAddress", () => {
    it("should match ShippingAddress interface", () => {
      const address: ShippingAddress = {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phoneNumber: "+1234567890",
      };

      expect(address.fullName).toBeDefined();
      expect(address.addressLine1).toBeDefined();
      expect(address.city).toBeDefined();
      expect(address.state).toBeDefined();
      expect(address.postalCode).toBeDefined();
      expect(address.country).toBeDefined();
      expect(address.phoneNumber).toBeDefined();
    });

    it("should allow optional addressLine2", () => {
      const address: ShippingAddress = {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA",
        phoneNumber: "+1234567890",
      };

      expect(address.addressLine2).toBe("Apt 4B");
    });
  });

  describe("Order", () => {
    it("should match Order interface", () => {
      const order: Order = {
        id: "order-123",
        userId: "user-456",
        orderNumber: "ORD-2025-001",
        items: [
          {
            productId: "1",
            name: "Laptop",
            price: 999.99,
            quantity: 1,
            subtotal: 999.99,
          },
        ],
        subtotal: 999.99,
        tax: 79.99,
        shippingCost: 10.0,
        total: 1089.98,
        shippingAddress: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA",
          phoneNumber: "+1234567890",
        },
        status: OrderStatus.PENDING,
        createdAt: "2025-12-01T10:00:00Z",
        updatedAt: "2025-12-01T10:00:00Z",
      };

      expect(order.id).toBeDefined();
      expect(order.userId).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.items).toHaveLength(1);
      expect(order.subtotal).toBeDefined();
      expect(order.tax).toBeDefined();
      expect(order.shippingCost).toBeDefined();
      expect(order.total).toBeDefined();
      expect(order.shippingAddress).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });

    it("should allow optional fields", () => {
      const order: Order = {
        id: "order-123",
        userId: "user-456",
        orderNumber: "ORD-2025-001",
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
        shippingAddress: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA",
          phoneNumber: "+1234567890",
        },
        status: OrderStatus.SHIPPED,
        paymentId: "pay-123",
        trackingNumber: "TRACK123",
        shippedAt: "2025-12-01T12:00:00Z",
        deliveredAt: "2025-12-01T15:00:00Z",
        cancelledAt: undefined,
        cancellationReason: undefined,
        notes: "Test notes",
        createdAt: "2025-12-01T10:00:00Z",
        updatedAt: "2025-12-01T15:00:00Z",
      };

      expect(order.paymentId).toBe("pay-123");
      expect(order.trackingNumber).toBe("TRACK123");
      expect(order.shippedAt).toBeDefined();
      expect(order.deliveredAt).toBeDefined();
      expect(order.notes).toBe("Test notes");
    });
  });

  describe("CreateOrderData", () => {
    it("should match CreateOrderData interface", () => {
      const data: CreateOrderData = {
        items: [
          {
            productId: "1",
            name: "Laptop",
            price: 999.99,
            quantity: 1,
            subtotal: 999.99,
          },
        ],
        subtotal: 999.99,
        tax: 79.99,
        shippingCost: 10.0,
        total: 1089.98,
        shippingAddress: {
          fullName: "John Doe",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA",
          phoneNumber: "+1234567890",
        },
      };

      expect(data.items).toBeDefined();
      expect(data.subtotal).toBeDefined();
      expect(data.tax).toBeDefined();
      expect(data.shippingCost).toBeDefined();
      expect(data.total).toBeDefined();
      expect(data.shippingAddress).toBeDefined();
    });
  });

  describe("UpdateOrderStatusData", () => {
    it("should match UpdateOrderStatusData interface", () => {
      const data: UpdateOrderStatusData = {
        status: OrderStatus.SHIPPED,
        trackingNumber: "TRACK123",
        notes: "Shipped via FedEx",
      };

      expect(data.status).toBe(OrderStatus.SHIPPED);
      expect(data.trackingNumber).toBe("TRACK123");
      expect(data.notes).toBe("Shipped via FedEx");
    });
  });

  describe("CancelOrderData", () => {
    it("should match CancelOrderData interface", () => {
      const data: CancelOrderData = {
        reason: "Changed my mind",
      };

      expect(data.reason).toBe("Changed my mind");
    });

    it("should allow optional reason", () => {
      const data: CancelOrderData = {};
      expect(data.reason).toBeUndefined();
    });
  });

  describe("OrderFilters", () => {
    it("should match OrderFilters interface", () => {
      const filters: OrderFilters = {
        status: OrderStatus.PENDING,
        page: 1,
        limit: 10,
        userId: "user-123",
      };

      expect(filters.status).toBe(OrderStatus.PENDING);
      expect(filters.page).toBe(1);
      expect(filters.limit).toBe(10);
      expect(filters.userId).toBe("user-123");
    });

    it("should allow all optional fields", () => {
      const filters: OrderFilters = {};
      expect(filters.status).toBeUndefined();
      expect(filters.page).toBeUndefined();
      expect(filters.limit).toBeUndefined();
      expect(filters.userId).toBeUndefined();
    });
  });
});
