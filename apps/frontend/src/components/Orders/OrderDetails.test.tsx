import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { OrderDetails } from "@/components/Orders/OrderDetails";
import { mockOrder } from "@/test/mockData";
import { OrderStatus } from "@/types/order.types";

describe("OrderDetails", () => {
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render complete order information", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(
      screen.getByText(`Order #${mockOrder.orderNumber}`)
    ).toBeInTheDocument();
    expect(screen.getByText("Order Items")).toBeInTheDocument();
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Shipping Address")).toBeInTheDocument();
  });

  it("should display all order items", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });

  it("should show order summary with calculations", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(
      screen.getByText(`$${mockOrder.subtotal.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockOrder.tax.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockOrder.shippingCost.toFixed(2)}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`$${mockOrder.total.toFixed(2)}`)
    ).toBeInTheDocument();
  });

  it("should display shipping address", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(
      screen.getByText(mockOrder.shippingAddress.fullName)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockOrder.shippingAddress.addressLine1)
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(mockOrder.shippingAddress.city))
    ).toBeInTheDocument();
  });

  it("should show cancel button when canCancel is true and order is cancellable", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(screen.getByText("Cancel Order")).toBeInTheDocument();
  });

  it("should not show cancel button when order is delivered", () => {
    const deliveredOrder = {
      ...mockOrder,
      status: OrderStatus.DELIVERED,
      deliveredAt: "2025-12-01T15:00:00Z",
    };

    renderWithProviders(
      <OrderDetails
        order={deliveredOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(screen.queryByText("Cancel Order")).not.toBeInTheDocument();
  });

  it("should not show cancel button when order is already cancelled", () => {
    const cancelledOrder = {
      ...mockOrder,
      status: OrderStatus.CANCELLED,
      cancelledAt: "2025-12-01T15:00:00Z",
    };

    renderWithProviders(
      <OrderDetails
        order={cancelledOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    expect(screen.queryByText("Cancel Order")).not.toBeInTheDocument();
  });

  it("should call onCancel when cancel button is clicked", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={true}
      />
    );

    const cancelButton = screen.getByText("Cancel Order");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should show tracking information when available", () => {
    const orderWithTracking = {
      ...mockOrder,
      status: OrderStatus.SHIPPED,
      trackingNumber: "TRACK123456",
      shippedAt: "2025-12-01T14:00:00Z",
    };

    renderWithProviders(
      <OrderDetails
        order={orderWithTracking}
        onCancel={mockOnCancel}
        canCancel={false}
      />
    );

    expect(screen.getByText("Tracking Information")).toBeInTheDocument();
    expect(screen.getByText(/TRACK123456/i)).toBeInTheDocument();
  });

  it("should show delivery information when order is delivered", () => {
    const deliveredOrder = {
      ...mockOrder,
      status: OrderStatus.DELIVERED,
      deliveredAt: "2025-12-01T16:00:00Z",
    };

    renderWithProviders(
      <OrderDetails
        order={deliveredOrder}
        onCancel={mockOnCancel}
        canCancel={false}
      />
    );

    expect(screen.getByText("Delivery Information")).toBeInTheDocument();
    expect(screen.getByText(/Delivered on/i)).toBeInTheDocument();
  });

  it("should show cancellation information when order is cancelled", () => {
    const cancelledOrder = {
      ...mockOrder,
      status: OrderStatus.CANCELLED,
      cancelledAt: "2025-12-01T16:00:00Z",
      cancellationReason: "Changed my mind",
    };

    renderWithProviders(
      <OrderDetails
        order={cancelledOrder}
        onCancel={mockOnCancel}
        canCancel={false}
      />
    );

    expect(screen.getByText("Cancellation Information")).toBeInTheDocument();
    expect(screen.getByText(/Changed my mind/i)).toBeInTheDocument();
  });

  it("should show notes when available", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={false}
      />
    );

    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText(mockOrder.notes!)).toBeInTheDocument();
  });

  it("should show payment information when available", () => {
    renderWithProviders(
      <OrderDetails
        order={mockOrder}
        onCancel={mockOnCancel}
        canCancel={false}
      />
    );

    expect(screen.getByText("Payment Information")).toBeInTheDocument();
    expect(screen.getByText(mockOrder.paymentId!)).toBeInTheDocument();
  });
});
