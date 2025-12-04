import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductFilters } from "./ProductFilters";
import { renderWithProviders } from "@/test/test-utils";
import { ProductCategory } from "@/types/product.types";

describe("ProductFilters", () => {
  const mockFilters = {
    page: 1,
    limit: 12,
  };

  const mockOnFilterChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all filter controls", () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    expect(screen.getByText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/in stock only/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/featured only/i)).toBeInTheDocument();
    expect(screen.getByText(/^sort by$/i)).toBeInTheDocument();
  });

  it("should display clear all button", () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(
      screen.getByRole("button", { name: /clear all/i })
    ).toBeInTheDocument();
  });

  it("should call onClearFilters when clear button is clicked", () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it("should call onFilterChange when search input changes", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search products...");
    fireEvent.change(searchInput, { target: { value: "laptop" } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "laptop" })
      );
    });
  });

  it("should call onFilterChange when category is selected", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Find select by finding the one that has "All Categories" as an option
    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects.find((select) =>
      select.innerHTML.includes("All Categories")
    ) as HTMLSelectElement;

    fireEvent.change(categorySelect, {
      target: { value: ProductCategory.ELECTRONICS },
    });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: ProductCategory.ELECTRONICS })
      );
    });
  });

  it("should display all category options", () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Find category select
    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects.find((select) =>
      select.innerHTML.includes("All Categories")
    ) as HTMLSelectElement;

    const options = categorySelect.querySelectorAll("option");

    // +1 for "All Categories" option
    expect(options.length).toBe(Object.values(ProductCategory).length + 1);
  });

  it("should call onFilterChange when price range is set", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const minPriceInput = screen.getByPlaceholderText("Min");
    fireEvent.change(minPriceInput, { target: { value: "100" } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ minPrice: 100 })
      );
    });

    const maxPriceInput = screen.getByPlaceholderText("Max");
    fireEvent.change(maxPriceInput, { target: { value: "1000" } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: 1000 })
      );
    });
  });

  it("should call onFilterChange when in stock checkbox is toggled", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const inStockCheckbox = screen.getByLabelText(/in stock only/i);
    fireEvent.click(inStockCheckbox);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ inStock: true })
      );
    });
  });

  it("should call onFilterChange when featured checkbox is toggled", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const featuredCheckbox = screen.getByLabelText(/featured only/i);
    fireEvent.click(featuredCheckbox);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ isFeatured: true })
      );
    });
  });

  it("should call onFilterChange when sort by is selected", async () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Find sort by select (has "Default" option)
    const selects = screen.getAllByRole("combobox");
    const sortBySelect = selects.find((select) =>
      select.innerHTML.includes("Default")
    ) as HTMLSelectElement;

    fireEvent.change(sortBySelect, { target: { value: "price" } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: "price" })
      );
    });
  });

  it("should show sort order dropdown when sortBy is selected", async () => {
    const filtersWithSort = {
      ...mockFilters,
      sortBy: "price" as const,
    };

    renderWithProviders(
      <ProductFilters
        filters={filtersWithSort}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText(/^sort order$/i)).toBeInTheDocument();
  });

  it("should not show sort order dropdown when sortBy is not selected", () => {
    renderWithProviders(
      <ProductFilters
        filters={mockFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.queryByText(/^sort order$/i)).not.toBeInTheDocument();
  });

  it("should call onFilterChange when sort order is selected", async () => {
    const filtersWithSort = {
      ...mockFilters,
      sortBy: "price" as const,
    };

    renderWithProviders(
      <ProductFilters
        filters={filtersWithSort}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    // Find sort order select (has "Ascending" option)
    const selects = screen.getAllByRole("combobox");
    const sortOrderSelect = selects.find((select) =>
      select.innerHTML.includes("Ascending")
    ) as HTMLSelectElement;

    fireEvent.change(sortOrderSelect, { target: { value: "desc" } });

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: "desc" })
      );
    });
  });

  it("should display current filter values", () => {
    const filtersWithValues = {
      page: 1,
      limit: 12,
      search: "laptop",
      category: ProductCategory.ELECTRONICS,
      minPrice: 100,
      maxPrice: 1000,
      inStock: true,
      isFeatured: true,
      sortBy: "price" as const,
      sortOrder: "asc" as const,
    };

    renderWithProviders(
      <ProductFilters
        filters={filtersWithValues}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      "Search products..."
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("laptop");

    // Find category select
    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects.find((select) =>
      select.innerHTML.includes("All Categories")
    ) as HTMLSelectElement;
    expect(categorySelect.value).toBe(ProductCategory.ELECTRONICS);

    const minPriceInput = screen.getByPlaceholderText(
      "Min"
    ) as HTMLInputElement;
    expect(minPriceInput.value).toBe("100");

    const inStockCheckbox = screen.getByLabelText(
      /in stock only/i
    ) as HTMLInputElement;
    expect(inStockCheckbox.checked).toBe(true);
  });
});
