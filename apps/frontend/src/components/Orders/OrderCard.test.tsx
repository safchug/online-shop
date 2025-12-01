import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { OrderCard } from "@/components/Orders/OrderCard";
import { mockOrder } from "@/test/mockData";
import { OrderStatus } from "@/types/order.types";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("OrderCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render order information correctly", () => {
    renderWithProviders(<OrderCard order={mockOrder} />);

    expect(
      screen.getByText(`Order #${mockOrder.orderNumber}`)
    ).toBeInTheDocument();
    expect(screen.getByText(/Laptop x 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Mouse x 2/i)).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockOrder.total.toFixed(2)}`)
    ).toBeInTheDocument();
  });

  it("should display order status with correct styling", () => {
    renderWithProviders(<OrderCard order={mockOrder} />);

    const statusBadge = screen.getByText("Pending");
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-yellow-100");
  });

  it("should navigate to order detail on click", () => {
    renderWithProviders(<OrderCard order={mockOrder} />);

    const card = screen
      .getByText(`Order #${mockOrder.orderNumber}`)
      .closest("div");
    fireEvent.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith(`/orders/${mockOrder.id}`);
  });

  it("should show tracking number when available", () => {
    const orderWithTracking = {
      ...mockOrder,
      status: OrderStatus.SHIPPED,
      trackingNumber: "TRACK123456",
    };

    renderWithProviders(<OrderCard order={orderWithTracking} />);

    expect(screen.getByText(/TRACK123456/i)).toBeInTheDocument();
  });

  it("should truncate items list when more than 2 items", () => {
    const orderWithManyItems = {
      ...mockOrder,
      items: [
        ...mockOrder.items,
        {
          productId: "3",
          name: "Keyboard",
          price: 79.99,
          quantity: 1,
          subtotal: 79.99,
        },
      ],
    };

    renderWithProviders(<OrderCard order={orderWithManyItems} />);

    expect(screen.getByText("+1 more items")).toBeInTheDocument();
  });

  it("should format date correctly", () => {
    renderWithProviders(<OrderCard order={mockOrder} />);

    expect(screen.getByText(/Placed on/i)).toBeInTheDocument();
    expect(screen.getByText(/Dec/i)).toBeInTheDocument();
  });

  it("should display shipping address information", () => {
    renderWithProviders(<OrderCard order={mockOrder} />);

    expect(
      screen.getByText(new RegExp(mockOrder.shippingAddress.fullName, "i"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(
          `${mockOrder.shippingAddress.city}, ${mockOrder.shippingAddress.state}`,
          "i"
        )
      )
    ).toBeInTheDocument();
  });
});
