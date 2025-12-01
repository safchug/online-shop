import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mockOrder,
  mockPaginatedOrders,
  mockCreateOrderData,
} from "@/test/mockData";
import { OrderStatus } from "@/types/order.types";

// Create mock API methods
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

// Mock axios
vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        post: mockPost,
        put: mockPut,
        delete: mockDelete,
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      })),
    },
  };
});

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("createOrder", () => {
    it("should create a new order successfully", async () => {
      const mockResponse = { data: mockOrder };
      mockPost.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.createOrder(mockCreateOrderData);

      expect(mockPost).toHaveBeenCalledWith("/orders", mockCreateOrderData);
      expect(result).toEqual(mockOrder);
    });

    it("should handle create order errors", async () => {
      const mockError = new Error("Failed to create order");
      mockPost.mockRejectedValue(mockError);

      const { orderService } = await import("@/services/order.service");

      await expect(
        orderService.createOrder(mockCreateOrderData)
      ).rejects.toThrow("Failed to create order");
    });
  });

  describe("getUserOrders", () => {
    it("should fetch user orders without filters", async () => {
      const mockResponse = { data: mockPaginatedOrders };
      mockGet.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.getUserOrders();

      expect(mockGet).toHaveBeenCalledWith("/orders?");
      expect(result).toEqual(mockPaginatedOrders);
    });

    it("should fetch user orders with filters", async () => {
      const mockResponse = { data: mockPaginatedOrders };
      mockGet.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const filters = {
        status: OrderStatus.PENDING,
        page: 1,
        limit: 10,
      };

      await orderService.getUserOrders(filters);

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("status=pending")
      );
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=1"));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("limit=10"));
    });
  });

  describe("getOrderById", () => {
    it("should fetch a single order by ID", async () => {
      const mockResponse = { data: mockOrder };
      mockGet.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.getOrderById("order-123");

      expect(mockGet).toHaveBeenCalledWith("/orders/order-123");
      expect(result).toEqual(mockOrder);
    });
  });

  describe("cancelOrder", () => {
    it("should cancel an order without reason", async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      const mockResponse = { data: cancelledOrder };
      mockPut.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.cancelOrder("order-123");

      expect(mockPut).toHaveBeenCalledWith(
        "/orders/order-123/cancel",
        undefined
      );
      expect(result).toEqual(cancelledOrder);
    });

    it("should cancel an order with reason", async () => {
      const cancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
        cancellationReason: "Changed my mind",
      };
      const mockResponse = { data: cancelledOrder };
      mockPut.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.cancelOrder("order-123", {
        reason: "Changed my mind",
      });

      expect(mockPut).toHaveBeenCalledWith("/orders/order-123/cancel", {
        reason: "Changed my mind",
      });
      expect(result.cancellationReason).toBe("Changed my mind");
    });
  });

  describe("getAllOrders (Admin)", () => {
    it("should fetch all orders for admin", async () => {
      const mockResponse = { data: mockPaginatedOrders };
      mockGet.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const result = await orderService.getAllOrders();

      expect(mockGet).toHaveBeenCalledWith("/orders/all?");
      expect(result).toEqual(mockPaginatedOrders);
    });

    it("should fetch all orders with filters", async () => {
      const mockResponse = { data: mockPaginatedOrders };
      mockGet.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      await orderService.getAllOrders({
        status: OrderStatus.SHIPPED,
        userId: "user-456",
      });

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("status=shipped")
      );
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("userId=user-456")
      );
    });
  });

  describe("updateOrderStatus (Admin)", () => {
    it("should update order status", async () => {
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        trackingNumber: "TRACK123456",
      };
      const mockResponse = { data: updatedOrder };
      mockPut.mockResolvedValue(mockResponse);

      const { orderService } = await import("@/services/order.service");

      const statusData = {
        status: OrderStatus.SHIPPED,
        trackingNumber: "TRACK123456",
      };

      const result = await orderService.updateOrderStatus(
        "order-123",
        statusData
      );

      expect(mockPut).toHaveBeenCalledWith(
        "/orders/order-123/status",
        statusData
      );
      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.trackingNumber).toBe("TRACK123456");
    });
  });
});
