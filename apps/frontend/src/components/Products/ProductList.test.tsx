import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { ProductList } from "./ProductList";
import { renderWithProviders } from "@/test/test-utils";
import { mockProducts } from "@/test/mockData";

describe("ProductList", () => {
  it("should render all products", () => {
    renderWithProviders(<ProductList products={mockProducts} />);

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it("should show loading skeleton when loading is true", () => {
    renderWithProviders(<ProductList products={[]} loading={true} />);

    const skeletons = screen
      .getAllByRole("generic")
      .filter((el) => el.className.includes("animate-pulse"));

    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should display empty state when no products", () => {
    renderWithProviders(<ProductList products={[]} loading={false} />);

    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search or filter criteria.")
    ).toBeInTheDocument();
  });

  it("should pass onEdit handler to ProductCards", () => {
    const onEdit = vi.fn();

    renderWithProviders(
      <ProductList products={mockProducts} onEdit={onEdit} showActions={true} />
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    expect(editButtons.length).toBe(mockProducts.length);
  });

  it("should pass onDelete handler to ProductCards", () => {
    const onDelete = vi.fn();

    renderWithProviders(
      <ProductList
        products={mockProducts}
        onDelete={onDelete}
        showActions={true}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons.length).toBe(mockProducts.length);
  });

  it("should not show actions when showActions is false", () => {
    renderWithProviders(
      <ProductList products={mockProducts} showActions={false} />
    );

    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  it("should render products in a grid layout", () => {
    const { container } = renderWithProviders(
      <ProductList products={mockProducts} />
    );

    const gridElement = container.querySelector(".grid");
    expect(gridElement).toBeInTheDocument();
    expect(gridElement?.className).toMatch(/grid-cols/);
  });

  it("should handle single product", () => {
    const singleProduct = [mockProducts[0]];
    renderWithProviders(<ProductList products={singleProduct} />);

    expect(screen.getByText(singleProduct[0].name)).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("should show correct number of loading skeletons", () => {
    renderWithProviders(<ProductList products={[]} loading={true} />);

    const skeletonCards = screen
      .getAllByRole("generic")
      .filter((el) =>
        el.className.includes(
          "bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        )
      );

    // Should show 8 skeleton cards
    expect(skeletonCards.length).toBe(8);
  });
});
