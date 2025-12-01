import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import orderReducer, {
  createOrderAsync,
  fetchUserOrdersAsync,
  fetchOrderByIdAsync,
  cancelOrderAsync,
  fetchAllOrdersAsync,
  updateOrderStatusAsync,
  clearError,
  clearCurrentOrder,
  setPage,
  setLimit,
} from "@/store/slices/orderSlice";
import {
  mockOrder,
  mockOrders,
  mockPaginatedOrders,
  mockCreateOrderData,
} from "@/test/mockData";
import { OrderStatus } from "@/types/order.types";

// Mock the order service - must be defined inline to avoid hoisting issues
vi.mock("@/services/order.service", () => ({
  orderService: {
    createOrder: vi.fn(),
    getUserOrders: vi.fn(),
    getOrderById: vi.fn(),
    cancelOrder: vi.fn(),
    getAllOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

describe("orderSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        order: orderReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().order;
      expect(state.orders).toEqual([]);
      expect(state.currentOrder).toBeNull();
      expect(state.total).toBe(0);
      expect(state.page).toBe(1);
      expect(state.limit).toBe(10);
      expect(state.totalPages).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("reducers", () => {
    it("should clear error", () => {
      store.dispatch({ type: "order/setError", payload: "Test error" });
      store.dispatch(clearError());
      const state = store.getState().order;
      expect(state.error).toBeNull();
    });

    it("should clear current order", () => {
      const stateWithOrder = {
        ...store.getState().order,
        currentOrder: mockOrder,
      };
      store = configureStore({
        reducer: { order: orderReducer },
        preloadedState: { order: stateWithOrder },
      });

      store.dispatch(clearCurrentOrder());
      const state = store.getState().order;
      expect(state.currentOrder).toBeNull();
    });

    it("should set page", () => {
      store.dispatch(setPage(2));
      const state = store.getState().order;
      expect(state.page).toBe(2);
    });

    it("should set limit", () => {
      store.dispatch(setLimit(20));
      const state = store.getState().order;
      expect(state.limit).toBe(20);
    });
  });

  describe("createOrderAsync", () => {
    it("should handle createOrder pending", () => {
      store.dispatch(createOrderAsync.pending("", mockCreateOrderData));
      const state = store.getState().order;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle createOrder fulfilled", () => {
      store.dispatch(
        createOrderAsync.fulfilled(mockOrder, "", mockCreateOrderData)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.orders).toContainEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it("should handle createOrder rejected", () => {
      const error = "Failed to create order";
      store.dispatch(
        createOrderAsync.rejected(null, "", mockCreateOrderData, error)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe("fetchUserOrdersAsync", () => {
    it("should handle fetchUserOrders pending", () => {
      store.dispatch(fetchUserOrdersAsync.pending("", undefined));
      const state = store.getState().order;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchUserOrders fulfilled", () => {
      store.dispatch(
        fetchUserOrdersAsync.fulfilled(mockPaginatedOrders, "", undefined)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.total).toBe(3);
      expect(state.page).toBe(1);
      expect(state.limit).toBe(10);
      expect(state.totalPages).toBe(1);
      expect(state.error).toBeNull();
    });

    it("should handle fetchUserOrders rejected", () => {
      const error = "Failed to fetch orders";
      store.dispatch(fetchUserOrdersAsync.rejected(null, "", undefined, error));
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe("fetchOrderByIdAsync", () => {
    it("should handle fetchOrderById pending", () => {
      store.dispatch(fetchOrderByIdAsync.pending("", "order-123"));
      const state = store.getState().order;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle fetchOrderById fulfilled", () => {
      store.dispatch(fetchOrderByIdAsync.fulfilled(mockOrder, "", "order-123"));
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it("should handle fetchOrderById rejected", () => {
      const error = "Failed to fetch order";
      store.dispatch(
        fetchOrderByIdAsync.rejected(null, "", "order-123", error)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe("cancelOrderAsync", () => {
    it("should handle cancelOrder pending", () => {
      store.dispatch(cancelOrderAsync.pending("", { orderId: "order-123" }));
      const state = store.getState().order;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle cancelOrder fulfilled", () => {
      const cancelledOrder = {
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      };

      // Preload orders state
      const stateWithOrders = {
        ...store.getState().order,
        orders: [mockOrder],
      };
      store = configureStore({
        reducer: { order: orderReducer },
        preloadedState: { order: stateWithOrders },
      });

      store.dispatch(
        cancelOrderAsync.fulfilled(cancelledOrder, "", { orderId: "order-123" })
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.currentOrder?.status).toBe(OrderStatus.CANCELLED);
      expect(state.orders[0].status).toBe(OrderStatus.CANCELLED);
      expect(state.error).toBeNull();
    });

    it("should handle cancelOrder rejected", () => {
      const error = "Failed to cancel order";
      store.dispatch(
        cancelOrderAsync.rejected(null, "", { orderId: "order-123" }, error)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe("fetchAllOrdersAsync (Admin)", () => {
    it("should handle fetchAllOrders fulfilled", () => {
      store.dispatch(
        fetchAllOrdersAsync.fulfilled(mockPaginatedOrders, "", undefined)
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.orders).toEqual(mockOrders);
      expect(state.total).toBe(3);
      expect(state.error).toBeNull();
    });

    it("should handle fetchAllOrders rejected", () => {
      const error = "Failed to fetch all orders";
      store.dispatch(fetchAllOrdersAsync.rejected(null, "", undefined, error));
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe("updateOrderStatusAsync (Admin)", () => {
    it("should handle updateOrderStatus fulfilled", () => {
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.SHIPPED,
        trackingNumber: "TRACK123456",
      };

      // Preload orders state
      const stateWithOrders = {
        ...store.getState().order,
        orders: [mockOrder],
      };
      store = configureStore({
        reducer: { order: orderReducer },
        preloadedState: { order: stateWithOrders },
      });

      store.dispatch(
        updateOrderStatusAsync.fulfilled(updatedOrder, "", {
          orderId: "order-123",
          statusData: { status: OrderStatus.SHIPPED },
        })
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.currentOrder?.status).toBe(OrderStatus.SHIPPED);
      expect(state.currentOrder?.trackingNumber).toBe("TRACK123456");
      expect(state.orders[0].status).toBe(OrderStatus.SHIPPED);
      expect(state.error).toBeNull();
    });

    it("should handle updateOrderStatus rejected", () => {
      const error = "Failed to update order status";
      store.dispatch(
        updateOrderStatusAsync.rejected(
          null,
          "",
          {
            orderId: "order-123",
            statusData: { status: OrderStatus.SHIPPED },
          },
          error
        )
      );
      const state = store.getState().order;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
