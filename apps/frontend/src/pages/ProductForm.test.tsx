import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import ProductFormPage from "./ProductForm";
import { renderWithProviders } from "@/test/test-utils";
import { mockProduct, mockVendorUser } from "@/test/mockData";
import { ProductCategory } from "@/types/product.types";
import * as productService from "@/services/product.service";

const mockNavigate = vi.fn();
const mockParams: { id: string | undefined } = { id: undefined };

// Mock the product service
vi.spyOn(productService.productService, "getProductById").mockResolvedValue(
  mockProduct
);
vi.spyOn(productService.productService, "createProduct").mockResolvedValue(
  mockProduct
);
vi.spyOn(productService.productService, "updateProduct").mockResolvedValue(
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

describe("ProductFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render create product form", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(() => {
        expect(screen.getByText("Create New Product")).toBeInTheDocument();
      });

      expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
      expect(container.querySelector('input[name="sku"]')).toBeInTheDocument();
      expect(
        container.querySelector('textarea[name="description"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[name="price"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[name="stock"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('select[name="category"]')
      ).toBeInTheDocument();
    });

    it("should display all category options", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(() => {
        expect(screen.getByText("Create New Product")).toBeInTheDocument();
      });

      const categorySelect = container.querySelector('select[name="category"]');
      expect(categorySelect).toBeInTheDocument();
      const options = categorySelect!.querySelectorAll("option");

      expect(options.length).toBe(Object.values(ProductCategory).length);
    });

    it("should allow adding tags", async () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      const tagInput = screen.getByPlaceholderText("Add a tag");
      const addButton = screen.getAllByRole("button", { name: /add/i })[0];

      fireEvent.change(tagInput, { target: { value: "new-tag" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("new-tag")).toBeInTheDocument();
      });
    });

    it("should allow removing tags", async () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      const tagInput = screen.getByPlaceholderText("Add a tag");
      const addButton = screen.getAllByRole("button", { name: /add/i })[0];

      fireEvent.change(tagInput, { target: { value: "test-tag" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("test-tag")).toBeInTheDocument();
      });

      const removeButton = screen.getByText("×");
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText("test-tag")).not.toBeInTheDocument();
      });
    });

    it("should allow adding images", async () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      const imageUrlInput = screen.getByPlaceholderText("Image URL");
      const imageAltInput = screen.getByPlaceholderText("Alt text (optional)");
      const addImageButton = screen.getAllByRole("button", {
        name: /add image/i,
      })[0];

      fireEvent.change(imageUrlInput, {
        target: { value: "https://example.com/image.jpg" },
      });
      fireEvent.change(imageAltInput, { target: { value: "Test image" } });
      fireEvent.click(addImageButton);

      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(
          images.some(
            (img) => img.getAttribute("src") === "https://example.com/image.jpg"
          )
        ).toBe(true);
      });
    });

    it("should handle form submission for creating product", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(() => {
        expect(screen.getByText("Create New Product")).toBeInTheDocument();
      });

      // Fill in required fields
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement;
      const skuInput = container.querySelector(
        'input[name="sku"]'
      ) as HTMLInputElement;
      const descInput = container.querySelector(
        'textarea[name="description"]'
      ) as HTMLTextAreaElement;
      const priceInput = container.querySelector(
        'input[name="price"]'
      ) as HTMLInputElement;
      const stockInput = container.querySelector(
        'input[name="stock"]'
      ) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: "Test Product" } });
      fireEvent.change(skuInput, { target: { value: "TEST-001" } });
      fireEvent.change(descInput, { target: { value: "Test description" } });
      fireEvent.change(priceInput, { target: { value: "99.99" } });
      fireEvent.change(stockInput, { target: { value: "10" } });

      const submitButton = screen.getByRole("button", {
        name: /create product/i,
      });
      fireEvent.click(submitButton);

      // Form should attempt submission
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/products");
      });
    });

    it("should display back to products button", () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      expect(
        screen.getByRole("button", { name: /back to products/i })
      ).toBeInTheDocument();
    });

    it("should navigate back when cancel button is clicked", () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith("/products");
    });

    it("should show active and featured checkboxes", () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      expect(
        screen.getByLabelText(/active \(visible to customers\)/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/featured product/i)).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    beforeEach(() => {
      mockParams.id = "product-123";
    });

    afterEach(() => {
      mockParams.id = undefined;
    });

    it("should render edit product form with existing data", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
        expect(screen.getByText("Edit Product")).toBeInTheDocument();
      });

      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement;
      expect(nameInput.value).toBe(mockProduct.name);

      const skuInput = container.querySelector(
        'input[name="sku"]'
      ) as HTMLInputElement;
      expect(skuInput.value).toBe(mockProduct.sku);
    });

    it("should display loading skeleton in edit mode while loading", () => {
      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      const skeletons = screen
        .getAllByRole("generic")
        .filter((el) => el.className.includes("animate-pulse"));
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should show update product button in edit mode", async () => {
      renderWithProviders(<ProductFormPage />, {
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
        expect(
          screen.getByRole("button", { name: /update product/i })
        ).toBeInTheDocument();
      });
    });

    it("should display existing tags", async () => {
      renderWithProviders(<ProductFormPage />, {
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
        expect(screen.getByText("Edit Product")).toBeInTheDocument();
      });

      mockProduct.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });

    it("should display existing images", async () => {
      renderWithProviders(<ProductFormPage />, {
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
        const images = screen.getAllByRole("img");
        expect(images.length).toBeGreaterThan(0);
      });

      // Check for primary badge
      expect(screen.getByText("Primary")).toBeInTheDocument();
    });

    it("should display error message if exists", async () => {
      mockParams.id = "product-456"; // Set to edit mode
      const errorMessage = "Failed to load product";

      // Mock the service to reject so the error state is set
      vi.spyOn(
        productService.productService,
        "getProductById"
      ).mockRejectedValueOnce(new Error(errorMessage));

      renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(
        () => {
          // The Redux thunk will set the error to "Failed to fetch product"
          expect(
            screen.getByText(/Failed to fetch product/i)
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      mockParams.id = undefined; // Reset
    });
  });

  describe("Form Validation", () => {
    it("should have required fields marked as required", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(() => {
        expect(screen.getByText("Create New Product")).toBeInTheDocument();
      });

      const nameInput = container.querySelector('input[name="name"]');
      expect(nameInput).toHaveAttribute("required");

      const skuInput = container.querySelector('input[name="sku"]');
      expect(skuInput).toHaveAttribute("required");

      const descInput = container.querySelector('textarea[name="description"]');
      expect(descInput).toHaveAttribute("required");
    });

    it("should show min/max attributes for numeric inputs", async () => {
      const { container } = renderWithProviders(<ProductFormPage />, {
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
          auth: { user: mockVendorUser, isAuthenticated: true },
        },
      });

      await waitFor(() => {
        expect(screen.getByText("Create New Product")).toBeInTheDocument();
      });

      const priceInput = container.querySelector('input[name="price"]');
      expect(priceInput).toHaveAttribute("min", "0");
      expect(priceInput).toHaveAttribute("step", "0.01");

      const stockInput = container.querySelector('input[name="stock"]');
      expect(stockInput).toHaveAttribute("min", "0");
    });
  });
});
