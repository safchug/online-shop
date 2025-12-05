import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { productService } from "@/services/product.service";
import { Product, ProductCategory } from "@/types/product.types";

// Mock the product service
vi.mock("@/services/product.service", () => ({
  productService: {
    searchProducts: vi.fn(),
  },
}));

const mockProducts: Product[] = [
  {
    _id: "1",
    name: "Test Product",
    description: "Test Description",
    sku: "TEST-001",
    price: 99.99,
    stock: 10,
    category: ProductCategory.ELECTRONICS,
    tags: ["test", "product"],
    images: [
      {
        url: "https://example.com/image.jpg",
        alt: "Test Image",
        isPrimary: true,
      },
    ],
    isActive: true,
    isFeatured: false,
    averageRating: 4.5,
    reviewCount: 10,
    reviews: [],
    soldCount: 5,
    viewCount: 100,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    _id: "2",
    name: "Another Test Product",
    description: "Another Test Description",
    sku: "TEST-002",
    price: 49.99,
    stock: 0,
    category: ProductCategory.CLOTHING,
    tags: ["test", "another"],
    images: [],
    isActive: true,
    isFeatured: false,
    averageRating: 3.5,
    reviewCount: 5,
    reviews: [],
    soldCount: 2,
    viewCount: 50,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("SearchAutocomplete", () => {
  const mockOnChange = vi.fn();
  const mockOnSelectProduct = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the search input", () => {
    render(<SearchAutocomplete value="" onChange={mockOnChange} />);

    expect(
      screen.getByPlaceholderText("Search products...")
    ).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    render(<SearchAutocomplete value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText("Search products...");
    fireEvent.change(input, { target: { value: "test" } });

    expect(mockOnChange).toHaveBeenCalledWith("test");
  });

  it("displays suggestions when search results are available", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    // Simulate typing
    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    // Wait for debounce and API call
    await waitFor(
      () => {
        expect(productService.searchProducts).toHaveBeenCalledWith("test");
      },
      { timeout: 500 }
    );

    // Check if suggestions are displayed
    await waitFor(() => {
      expect(screen.getByAltText("Test Product")).toBeInTheDocument();
      // Check for the second product by finding options (second product has no image)
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);
    });
  });

  it("highlights matching text in suggestions", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(productService.searchProducts).toHaveBeenCalled();
    });

    // Check for highlighted text (mark elements)
    await waitFor(() => {
      const marks = screen.getAllByText(/test/i);
      expect(marks.length).toBeGreaterThan(0);
    });
  });

  it("calls onSelectProduct when a suggestion is clicked", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete
        value=""
        onChange={mockOnChange}
        onSelectProduct={mockOnSelectProduct}
      />
    );

    rerender(
      <SearchAutocomplete
        value="test"
        onChange={mockOnChange}
        onSelectProduct={mockOnSelectProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Test Product")).toBeInTheDocument();
    });

    // Click on a suggestion - find by the list item containing the product
    const productItem = screen.getByAltText("Test Product").closest("li");
    fireEvent.click(productItem!);

    expect(mockOnSelectProduct).toHaveBeenCalledWith(mockProducts[0]);
    expect(mockOnChange).toHaveBeenCalledWith("Test Product");
  });

  it("displays loading indicator while fetching suggestions", async () => {
    // Mock a delayed response
    (productService.searchProducts as any).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockProducts), 100))
    );

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    // Check for loading spinner
    await waitFor(() => {
      const spinners = document.querySelectorAll(".animate-spin");
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  it("displays 'no results' message when no products found", async () => {
    (productService.searchProducts as any).mockResolvedValue([]);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    rerender(
      <SearchAutocomplete value="nonexistent" onChange={mockOnChange} />
    );

    await waitFor(() => {
      expect(productService.searchProducts).toHaveBeenCalledWith("nonexistent");
    });

    await waitFor(() => {
      expect(
        screen.getByText(/No products found matching/i)
      ).toBeInTheDocument();
    });
  });

  it("displays stock status in suggestions", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText("In Stock")).toBeInTheDocument();
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });
  });

  it("displays price in suggestions", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText("$99.99")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });
  });

  it("handles keyboard navigation", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete
        value=""
        onChange={mockOnChange}
        onSelectProduct={mockOnSelectProduct}
      />
    );

    const input = screen.getByPlaceholderText("Search products...");

    rerender(
      <SearchAutocomplete
        value="test"
        onChange={mockOnChange}
        onSelectProduct={mockOnSelectProduct}
      />
    );

    await waitFor(() => {
      expect(screen.getByAltText("Test Product")).toBeInTheDocument();
    });

    // Press arrow down
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Press enter to select
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnSelectProduct).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("closes suggestions on Escape key", async () => {
    (productService.searchProducts as any).mockResolvedValue(mockProducts);

    const { rerender } = render(
      <SearchAutocomplete value="" onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText("Search products...");

    rerender(<SearchAutocomplete value="test" onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByAltText("Test Product")).toBeInTheDocument();
    });

    // Press escape
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByAltText("Test Product")).not.toBeInTheDocument();
    });
  });
});
