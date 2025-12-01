import axios, { AxiosInstance } from "axios";
import {
  Order,
  CreateOrderData,
  UpdateOrderStatusData,
  CancelOrderData,
  PaginatedOrders,
  OrderFilters,
} from "@/types/order.types";

class OrderService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await this.api.post<Order>("/orders", orderData);
    return response.data;
  }

  async getUserOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await this.api.get<PaginatedOrders>(
      `/orders?${params.toString()}`
    );
    return response.data;
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await this.api.get<Order>(`/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId: string, data?: CancelOrderData): Promise<Order> {
    const response = await this.api.put<Order>(
      `/orders/${orderId}/cancel`,
      data
    );
    return response.data;
  }

  // Admin endpoints
  async getAllOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.userId) params.append("userId", filters.userId);

    const response = await this.api.get<PaginatedOrders>(
      `/orders/all?${params.toString()}`
    );
    return response.data;
  }

  async updateOrderStatus(
    orderId: string,
    statusData: UpdateOrderStatusData
  ): Promise<Order> {
    const response = await this.api.put<Order>(
      `/orders/${orderId}/status`,
      statusData
    );
    return response.data;
  }
}

export const orderService = new OrderService();
