import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ProductsPage from "./Products";
import { renderWithProviders } from "@/test/test-utils";
import {
  mockProducts,
  mockVendorUser,
  mockUser,
  mockPaginatedProducts,
} from "@/test/mockData";
import * as productService from "@/services/product.service";

// Mock the product service
vi.spyOn(productService.productService, "getAllProducts").mockResolvedValue(
  mockPaginatedProducts
);
vi.spyOn(productService.productService, "deleteProduct").mockResolvedValue(
  undefined
);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProductsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render products page with title", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Browse our collection of ${mockProducts.length} products`
      )
    ).toBeInTheDocument();
  });

  it("should display show/hide filters button", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    const filterButton = screen.getByRole("button", { name: /show filters/i });
    expect(filterButton).toBeInTheDocument();

    fireEvent.click(filterButton);
    expect(
      screen.getByRole("button", { name: /hide filters/i })
    ).toBeInTheDocument();
  });

  it("should show create product button for vendors", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    expect(
      screen.getByRole("button", { name: /create product/i })
    ).toBeInTheDocument();
  });

  it("should not show create product button for regular users", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(
      screen.queryByRole("button", { name: /create product/i })
    ).not.toBeInTheDocument();
  });

  it("should navigate to create product page when button is clicked", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    const createButton = screen.getByRole("button", {
      name: /create product/i,
    });
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/products/create");
  });

  it("should display error message when there is an error", async () => {
    const errorMessage = "Failed to fetch products";

    // Mock the service to reject
    vi.spyOn(
      productService.productService,
      "getAllProducts"
    ).mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: [],
          currentProduct: null,
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
          loading: false,
          error: errorMessage,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    // Wait for async operations to complete
    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    // The error should be shown in the UI
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("should render product list with products", async () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProducts[0].name)).toBeInTheDocument();
    });

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("should show filters panel when show filters is clicked", async () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    const showFiltersButton = screen.getByRole("button", {
      name: /show filters/i,
    });
    fireEvent.click(showFiltersButton);

    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
  });

  it("should display pagination when there are multiple pages", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: 50,
          page: 2,
          limit: 12,
          totalPages: 5,
          loading: false,
          error: null,
          filters: { page: 2, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(
      screen.getByRole("button", { name: /previous/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("should not display pagination when there is only one page", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    expect(
      screen.queryByRole("button", { name: /previous/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next/i })
    ).not.toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: 50,
          page: 1,
          limit: 12,
          totalPages: 5,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    const previousButton = screen.getByRole("button", { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: 50,
          page: 5,
          limit: 12,
          totalPages: 5,
          loading: false,
          error: null,
          filters: { page: 5, limit: 12 },
        },
        auth: { user: mockUser, isAuthenticated: true },
      },
    });

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it("should show actions for vendors", async () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  it("should not show actions for regular users", () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
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
    expect(
      screen.queryByRole("button", { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  it("should navigate to edit page when edit is clicked", async () => {
    renderWithProviders(<ProductsPage />, {
      preloadedState: {
        product: {
          products: mockProducts,
          currentProduct: null,
          total: mockProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          loading: false,
          error: null,
          filters: { page: 1, limit: 12 },
        },
        auth: { user: mockVendorUser, isAuthenticated: true },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(mockProducts[0].name)).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/products/${mockProducts[0]._id}/edit`
    );
  });
});
