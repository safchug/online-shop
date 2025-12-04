import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { renderWithProviders } from "@/test/test-utils";
import { mockProduct, mockProducts } from "@/test/mockData";

describe("ProductCard", () => {
  it("should render product information correctly", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.brand!)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockProduct.price.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(screen.getByText(`Stock: ${mockProduct.stock}`)).toBeInTheDocument();
  });

  it("should display primary image", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const images = screen.getAllByRole("img");
    const primaryImage = mockProduct.images.find((img) => img.isPrimary);
    const mainImage = images.find((img) =>
      img.getAttribute("src")?.includes(primaryImage!.url)
    );

    expect(mainImage).toBeInTheDocument();
  });

  it("should show discount badge when compareAtPrice exists", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const discount = Math.round(
      ((mockProduct.compareAtPrice! - mockProduct.price) /
        mockProduct.compareAtPrice!) *
        100
    );
    expect(screen.getByText(`-${discount}%`)).toBeInTheDocument();
  });

  it("should not show discount badge when no compareAtPrice", () => {
    const productWithoutDiscount = {
      ...mockProduct,
      compareAtPrice: undefined,
    };
    renderWithProviders(<ProductCard product={productWithoutDiscount} />);

    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it("should display featured badge", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("should display inactive badge when product is not active", () => {
    const inactiveProduct = { ...mockProduct, isActive: false };
    renderWithProviders(<ProductCard product={inactiveProduct} />);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should show out of stock overlay when stock is 0", () => {
    const outOfStockProduct = { ...mockProducts[2] };
    renderWithProviders(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("should display star rating", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const reviewCountText = `(${mockProduct.reviewCount})`;
    expect(screen.getByText(reviewCountText)).toBeInTheDocument();
  });

  it("should display product tags (up to 3)", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    mockProduct.tags.slice(0, 3).forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("should show edit and delete buttons when showActions is true", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <ProductCard
        product={mockProduct}
        onEdit={onEdit}
        onDelete={onDelete}
        showActions={true}
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should not show action buttons when showActions is false", () => {
    renderWithProviders(
      <ProductCard product={mockProduct} showActions={false} />
    );

    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i })
    ).not.toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();

    renderWithProviders(
      <ProductCard product={mockProduct} onEdit={onEdit} showActions={true} />
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockProduct);
  });

  it("should show confirmation dialog and call onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    window.confirm = vi.fn(() => true);

    renderWithProviders(
      <ProductCard
        product={mockProduct}
        onDelete={onDelete}
        showActions={true}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this product?"
    );
    expect(onDelete).toHaveBeenCalledWith(mockProduct._id);
  });

  it("should not call onDelete when confirmation is cancelled", () => {
    const onDelete = vi.fn();
    window.confirm = vi.fn(() => false);

    renderWithProviders(
      <ProductCard
        product={mockProduct}
        onDelete={onDelete}
        showActions={true}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should render with no image placeholder when images array is empty", () => {
    const productWithoutImages = { ...mockProduct, images: [] };
    renderWithProviders(<ProductCard product={productWithoutImages} />);

    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("should link to product detail page", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const links = screen.getAllByRole("link");
    expect(
      links.some(
        (link) => link.getAttribute("href") === `/products/${mockProduct._id}`
      )
    ).toBe(true);
  });
});
