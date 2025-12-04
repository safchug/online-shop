import axios, { AxiosInstance } from "axios";
import {
  Product,
  CreateProductData,
  UpdateProductData,
  PaginatedProducts,
  ProductFilters,
  AddReviewData,
} from "@/types/product.types";

class ProductService {
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

  async getAllProducts(filters?: ProductFilters): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("q", filters.search);
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.inStock !== undefined) params.append("inStock", filters.inStock.toString());
    if (filters?.isFeatured !== undefined) params.append("isFeatured", filters.isFeatured.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const response = await this.api.get<PaginatedProducts>(
      `/products?${params.toString()}`
    );
    return response.data;
  }

  async getProductById(productId: string): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${productId}`);
    return response.data;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.api.get<Product[]>(`/products/search?q=${query}`);
    return response.data;
  }

  // Vendor/Admin endpoints
  async createProduct(productData: CreateProductData): Promise<Product> {
    const response = await this.api.post<Product>("/products", productData);
    return response.data;
  }

  async updateProduct(
    productId: string,
    productData: UpdateProductData
  ): Promise<Product> {
    const response = await this.api.put<Product>(
      `/products/${productId}`,
      productData
    );
    return response.data;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.api.delete(`/products/${productId}`);
  }

  // Review endpoints (if implemented in backend)
  async addReview(productId: string, reviewData: AddReviewData): Promise<Product> {
    const response = await this.api.post<Product>(
      `/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  }
}

export const productService = new ProductService();
