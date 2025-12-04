import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import productReducer, {
  fetchProducts,
  fetchProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  setFilters,
  clearFilters,
  clearCurrentProduct,
  clearError,
} from "./productSlice";
import { productService } from "@/services/product.service";
import {
  mockProduct,
  mockProducts,
  mockPaginatedProducts,
  mockCreateProductData,
} from "@/test/mockData";
import { ProductCategory } from "@/types/product.types";

vi.mock("@/services/product.service");

describe("productSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        product: productReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = store.getState().product;
      expect(state).toEqual({
        products: [],
        currentProduct: null,
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        loading: false,
        error: null,
        filters: {
          page: 1,
          limit: 12,
        },
      });
    });
  });

  describe("synchronous actions", () => {
    it("should handle setFilters", () => {
      const newFilters = {
        page: 2,
        category: ProductCategory.ELECTRONICS,
        search: "laptop",
      };

      store.dispatch(setFilters(newFilters));
      const state = store.getState().product;

      expect(state.filters).toEqual({
        page: 2,
        limit: 12,
        category: ProductCategory.ELECTRONICS,
        search: "laptop",
      });
    });

    it("should handle clearFilters", () => {
      store.dispatch(
        setFilters({ page: 2, category: ProductCategory.ELECTRONICS })
      );
      store.dispatch(clearFilters());
      const state = store.getState().product;

      expect(state.filters).toEqual({
        page: 1,
        limit: 12,
      });
    });

    it("should handle clearCurrentProduct", () => {
      // First set a current product through fetchProductById
      vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);

      store.dispatch(fetchProductById("product-123") as any).then(() => {
        store.dispatch(clearCurrentProduct());
        const state = store.getState().product;
        expect(state.currentProduct).toBeNull();
      });
    });

    it("should handle clearError", () => {
      vi.mocked(productService.getAllProducts).mockRejectedValue(
        new Error("Test error")
      );

      store.dispatch(fetchProducts({}) as any).then(() => {
        store.dispatch(clearError());
        const state = store.getState().product;
        expect(state.error).toBeNull();
      });
    });
  });

  describe("fetchProducts", () => {
    it("should fetch products successfully", async () => {
      vi.mocked(productService.getAllProducts).mockResolvedValue(
        mockPaginatedProducts
      );

      await store.dispatch(fetchProducts({}) as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.products).toEqual(mockProducts);
      expect(state.total).toBe(3);
      expect(state.page).toBe(1);
      expect(state.totalPages).toBe(1);
      expect(state.error).toBeNull();
    });

    it("should set loading state during fetch", () => {
      vi.mocked(productService.getAllProducts).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      store.dispatch(fetchProducts({}) as any);
      const state = store.getState().product;

      expect(state.loading).toBe(true);
    });

    it("should handle fetch products error", async () => {
      const errorMessage = "Failed to fetch products";
      vi.mocked(productService.getAllProducts).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(fetchProducts({}) as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("should fetch products with filters", async () => {
      const filters = {
        category: ProductCategory.ELECTRONICS,
        minPrice: 100,
        maxPrice: 1000,
      };

      vi.mocked(productService.getAllProducts).mockResolvedValue(
        mockPaginatedProducts
      );

      await store.dispatch(fetchProducts(filters) as any);

      expect(productService.getAllProducts).toHaveBeenCalledWith(filters);
    });
  });

  describe("fetchProductById", () => {
    it("should fetch a product by ID successfully", async () => {
      vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);

      await store.dispatch(fetchProductById("product-123") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.currentProduct).toEqual(mockProduct);
      expect(state.error).toBeNull();
    });

    it("should handle fetch product error", async () => {
      const errorMessage = "Product not found";
      vi.mocked(productService.getProductById).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(fetchProductById("invalid-id") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.currentProduct).toBeNull();
    });
  });

  describe("searchProducts", () => {
    it("should search products successfully", async () => {
      vi.mocked(productService.searchProducts).mockResolvedValue(mockProducts);

      await store.dispatch(searchProducts("laptop") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.products).toEqual(mockProducts);
      expect(state.total).toBe(mockProducts.length);
      expect(state.error).toBeNull();
    });

    it("should handle empty search results", async () => {
      vi.mocked(productService.searchProducts).mockResolvedValue([]);

      await store.dispatch(searchProducts("nonexistent") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.products).toEqual([]);
      expect(state.total).toBe(0);
    });

    it("should handle search error", async () => {
      const errorMessage = "Search failed";
      vi.mocked(productService.searchProducts).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(searchProducts("laptop") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      vi.mocked(productService.createProduct).mockResolvedValue(mockProduct);

      await store.dispatch(createProduct(mockCreateProductData) as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.products[0]).toEqual(mockProduct);
      expect(state.total).toBe(1);
      expect(state.error).toBeNull();
    });

    it("should handle create product error", async () => {
      const errorMessage = "Failed to create product";
      vi.mocked(productService.createProduct).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(createProduct(mockCreateProductData) as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("updateProduct", () => {
    it("should update a product successfully", async () => {
      // First, add products to state
      vi.mocked(productService.getAllProducts).mockResolvedValue(
        mockPaginatedProducts
      );
      await store.dispatch(fetchProducts({}) as any);

      const updatedProduct = { ...mockProduct, name: "Updated Laptop" };
      vi.mocked(productService.updateProduct).mockResolvedValue(updatedProduct);

      await store.dispatch(
        updateProduct({
          productId: "product-123",
          productData: { name: "Updated Laptop" },
        }) as any
      );
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.products.find((p) => p._id === "product-123")?.name).toBe(
        "Updated Laptop"
      );
      expect(state.error).toBeNull();
    });

    it("should update current product if it matches", async () => {
      vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);
      await store.dispatch(fetchProductById("product-123") as any);

      const updatedProduct = { ...mockProduct, price: 899.99 };
      vi.mocked(productService.updateProduct).mockResolvedValue(updatedProduct);

      await store.dispatch(
        updateProduct({
          productId: "product-123",
          productData: { price: 899.99 },
        }) as any
      );
      const state = store.getState().product;

      expect(state.currentProduct?.price).toBe(899.99);
    });

    it("should handle update product error", async () => {
      const errorMessage = "Failed to update product";
      vi.mocked(productService.updateProduct).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(
        updateProduct({
          productId: "product-123",
          productData: { name: "Updated" },
        }) as any
      );
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      // First, add products to state
      vi.mocked(productService.getAllProducts).mockResolvedValue(
        mockPaginatedProducts
      );
      await store.dispatch(fetchProducts({}) as any);

      vi.mocked(productService.deleteProduct).mockResolvedValue();

      await store.dispatch(deleteProduct("product-123") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(
        state.products.find((p) => p._id === "product-123")
      ).toBeUndefined();
      expect(state.total).toBe(2);
      expect(state.error).toBeNull();
    });

    it("should clear current product if it matches deleted product", async () => {
      vi.mocked(productService.getProductById).mockResolvedValue(mockProduct);
      await store.dispatch(fetchProductById("product-123") as any);

      vi.mocked(productService.deleteProduct).mockResolvedValue();

      await store.dispatch(deleteProduct("product-123") as any);
      const state = store.getState().product;

      expect(state.currentProduct).toBeNull();
    });

    it("should handle delete product error", async () => {
      const errorMessage = "Failed to delete product";
      vi.mocked(productService.deleteProduct).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(deleteProduct("product-123") as any);
      const state = store.getState().product;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
});
