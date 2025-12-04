import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { ProductCategory } from "@/types/product.types";
import {
  mockProduct,
  mockProducts,
  mockPaginatedProducts,
  mockCreateProductData,
} from "@/test/mockData";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Create a mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
};

describe("ProductService", () => {
  let productService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    // Setup axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    // Reset modules and import fresh
    vi.resetModules();
    const module = await import("./product.service");
    productService = module.productService;
  });

  describe("getAllProducts", () => {
    it("should fetch all products without filters", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockPaginatedProducts });

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockPaginatedProducts);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });

    it("should fetch products with filters", async () => {
      const filters = {
        page: 2,
        limit: 20,
        category: ProductCategory.ELECTRONICS,
        search: "laptop",
        minPrice: 100,
        maxPrice: 1000,
        inStock: true,
        isFeatured: true,
        sortBy: "price" as const,
        sortOrder: "desc" as const,
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockPaginatedProducts });

      const result = await productService.getAllProducts(filters);

      expect(result).toEqual(mockPaginatedProducts);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });

    it("should handle API errors", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Network error"));

      await expect(productService.getAllProducts()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getProductById", () => {
    it("should fetch a product by ID", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockProduct });

      const result = await productService.getProductById("product-123");

      expect(result).toEqual(mockProduct);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/products/product-123"
      );
    });

    it("should handle non-existent product", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { status: 404, data: { message: "Product not found" } },
      });

      await expect(
        productService.getProductById("non-existent")
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe("searchProducts", () => {
    it("should search products by query", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockProducts });

      const result = await productService.searchProducts("laptop");

      expect(result).toEqual(mockProducts);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        "/products/search?q=laptop"
      );
    });

    it("should return empty array for no results", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await productService.searchProducts("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.post.mockResolvedValue({ data: mockProduct });

      const result = await productService.createProduct(mockCreateProductData);

      expect(result).toEqual(mockProduct);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/products",
        mockCreateProductData
      );
    });

    it("should handle validation errors", async () => {
      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Invalid product data" },
        },
      });

      await expect(
        productService.createProduct(mockCreateProductData)
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it("should handle unauthorized access", async () => {
      mockAxiosInstance.post.mockRejectedValue({
        response: { status: 401, data: { message: "Unauthorized" } },
      });

      await expect(
        productService.createProduct(mockCreateProductData)
      ).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const updateData = { name: "Updated Laptop", price: 899.99 };
      const updatedProduct = { ...mockProduct, ...updateData };

      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.put.mockResolvedValue({ data: updatedProduct });

      const result = await productService.updateProduct(
        "product-123",
        updateData
      );

      expect(result).toEqual(updatedProduct);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        "/products/product-123",
        updateData
      );
    });

    it("should handle partial updates", async () => {
      const updateData = { stock: 5 };
      const updatedProduct = { ...mockProduct, stock: 5 };

      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.put.mockResolvedValue({ data: updatedProduct });

      const result = await productService.updateProduct(
        "product-123",
        updateData
      );

      expect(result).toEqual(updatedProduct);
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await productService.deleteProduct("product-123");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        "/products/product-123"
      );
    });

    it("should handle delete errors", async () => {
      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.delete.mockRejectedValue({
        response: { status: 403, data: { message: "Forbidden" } },
      });

      await expect(
        productService.deleteProduct("product-123")
      ).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  describe("addReview", () => {
    it("should add a review to a product", async () => {
      const reviewData = { rating: 5, comment: "Excellent product!" };
      const updatedProduct = {
        ...mockProduct,
        reviews: [
          ...mockProduct.reviews,
          {
            ...reviewData,
            userId: "user-3",
            createdAt: new Date().toISOString(),
          },
        ],
      };

      localStorage.setItem("accessToken", "test-token");
      mockAxiosInstance.post.mockResolvedValue({ data: updatedProduct });

      const result = await productService.addReview("product-123", reviewData);

      expect(result).toEqual(updatedProduct);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/products/product-123/reviews",
        reviewData
      );
    });
  });

  describe("Authorization Token", () => {
    it("should setup request interceptor", () => {
      // Verify interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it("should make requests successfully", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockPaginatedProducts });

      const result = await productService.getAllProducts();

      expect(result).toEqual(mockPaginatedProducts);
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });
});
