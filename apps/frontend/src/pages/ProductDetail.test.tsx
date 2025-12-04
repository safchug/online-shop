import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ProductDetailPage from "./ProductDetail";
import { renderWithProviders } from "@/test/test-utils";
import { mockProduct, mockVendorUser, mockUser } from "@/test/mockData";
import * as productService from "@/services/product.service";

const mockNavigate = vi.fn();
const mockParams = { id: "product-123" };

// Mock the product service instead of Redux actions
vi.spyOn(productService.productService, "getProductById").mockResolvedValue(
  mockProduct
);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render product details correctly", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    expect(screen.getByText(mockProduct.brand!)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockProduct.price.toFixed(2)}`)
    ).toBeInTheDocument();
  });

  it("should display loading skeleton when loading", () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: null,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: true,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    const skeletons = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display error message when product not found", async () => {
    // Mock the service to reject
    vi.spyOn(
      productService.productService,
      "getProductById"
    ).mockRejectedValueOnce(new Error("Product not found"));

    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: null,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(
      () => {
        expect(screen.getByText("Failed to fetch product")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(
      screen.getByRole("button", { name: /back to products/i })
    ).toBeInTheDocument();
  });

  it("should display discount percentage when compareAtPrice exists", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    const discount = Math.round(
      ((mockProduct.compareAtPrice! - mockProduct.price) /
        mockProduct.compareAtPrice!) *
        100
    );
    expect(screen.getByText(`Save ${discount}%`)).toBeInTheDocument();
  });

  it("should display product images and allow image selection", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    if (mockProduct.images.length > 1) {
      const thumbnails = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("img"));
      expect(thumbnails.length).toBe(mockProduct.images.length);
    }
  });

  it("should display product rating and review count", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          `${mockProduct.averageRating.toFixed(1)} (${mockProduct.reviewCount} reviews)`
        )
      ).toBeInTheDocument();
    });
  });

  it("should display product stock status", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(`${mockProduct.stock} available`)
      ).toBeInTheDocument();
    });
  });

  it("should display out of stock for products with 0 stock", async () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };

    // Mock the service to return out of stock product
    vi.spyOn(
      productService.productService,
      "getProductById"
    ).mockResolvedValueOnce(outOfStockProduct);

    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: outOfStockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(
      () => {
        expect(screen.getByText("Out of stock")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should display product tags", async () => {
    vi.spyOn(
      productService.productService,
      "getProductById"
    ).mockResolvedValueOnce(mockProduct);

    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(
      () => {
        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    mockProduct.tags.forEach((tag) => {
      // Use getAllByText since tags might appear multiple places (e.g., category and tag)
      const elements = screen.getAllByText(tag);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("should show edit button for vendors", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });

  it("should not show edit button for regular users", () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
  });

  it("should allow quantity adjustment", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    const quantityInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(quantityInput.value).toBe("1");

    const incrementButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "+");
    if (incrementButton) {
      fireEvent.click(incrementButton);
      expect(quantityInput.value).toBe("2");
    }

    const decrementButton = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent === "-");
    if (decrementButton) {
      fireEvent.click(decrementButton);
      expect(quantityInput.value).toBe("1");
    }
  });

  it("should display add to cart button for in-stock products", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add to cart/i })
      ).toBeInTheDocument();
    });
  });

  it("should not display add to cart for out of stock products", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: outOfStockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(
      screen.queryByRole("button", { name: /add to cart/i })
    ).not.toBeInTheDocument();
  });

  it("should display customer reviews", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
    });

    mockProduct.reviews.forEach((review) => {
      expect(screen.getByText(review.comment)).toBeInTheDocument();
    });
  });

  it("should navigate back to products when back button is clicked", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", {
      name: /back to products/i,
    });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/products");
  });

  it("should navigate to edit page when edit button is clicked", async () => {
    renderWithProviders(<ProductDetailPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: mockProduct,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/products/${mockProduct._id}/edit`
    );
  });
});
