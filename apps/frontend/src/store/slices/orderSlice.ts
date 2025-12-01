import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orderService } from "@/services/order.service";
import {
  Order,
  CreateOrderData,
  UpdateOrderStatusData,
  CancelOrderData,
  OrderFilters,
} from "@/types/order.types";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const createOrderAsync = createAsyncThunk(
  "order/create",
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const fetchUserOrdersAsync = createAsyncThunk(
  "order/fetchUserOrders",
  async (filters: OrderFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await orderService.getUserOrders(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderByIdAsync = createAsyncThunk(
  "order/fetchById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const cancelOrderAsync = createAsyncThunk(
  "order/cancel",
  async (
    { orderId, data }: { orderId: string; data?: CancelOrderData },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.cancelOrder(orderId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

export const fetchAllOrdersAsync = createAsyncThunk(
  "order/fetchAll",
  async (filters: OrderFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all orders"
      );
    }
  }
);

export const updateOrderStatusAsync = createAsyncThunk(
  "order/updateStatus",
  async (
    {
      orderId,
      statusData,
    }: { orderId: string; statusData: UpdateOrderStatusData },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderService.updateOrderStatus(
        orderId,
        statusData
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User Orders
    builder
      .addCase(fetchUserOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchUserOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Order By ID
    builder
      .addCase(fetchOrderByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrderAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelOrderAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch All Orders (Admin)
    builder
      .addCase(fetchAllOrdersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchAllOrdersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Order Status (Admin)
    builder
      .addCase(updateOrderStatusAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrderStatusAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentOrder, setPage, setLimit } =
  orderSlice.actions;
export default orderSlice.reducer;
