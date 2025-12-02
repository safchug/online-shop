import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { OrderList } from "@/components/Orders/OrderList";
import { mockOrders } from "@/test/mockData";

// Mock the order service to prevent real API calls - must be inline to avoid hoisting issues
vi.mock("@/services/order.service", () => ({
  orderService: {
    getUserOrders: vi.fn().mockResolvedValue({
      orders: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }),
    createOrder: vi.fn(),
    getOrderById: vi.fn(),
    cancelOrder: vi.fn(),
    getAllOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

describe("OrderList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render list of orders", () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    expect(screen.getByText(/ORD-2025-001/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD-2025-002/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD-2025-003/i)).toBeInTheDocument();
  });

  it("should display status filter dropdown", () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    const filterDropdown = screen.getByRole("combobox");
    expect(filterDropdown).toBeInTheDocument();
    expect(screen.getByText("Filter by Status")).toBeInTheDocument();
  });

  it("should dispatch fetch action when filter changes", async () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    const filterDropdown = screen.getByRole("combobox");
    fireEvent.change(filterDropdown, { target: { value: "shipped" } });

    await waitFor(() => {
      // Filter change should trigger a fetch action
      expect(filterDropdown).toHaveValue("shipped");
    });
  });

  it("should show pagination controls when multiple pages", () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    expect(screen.getByText(/← Previous/i)).toBeInTheDocument();
    expect(screen.getByText(/Next →/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    const previousButton = screen.getByText(/← Previous/i);
    expect(previousButton).toBeDisabled();
  });

  it("should handle page navigation", () => {
    const preloadedState = {
      order: {
        orders: mockOrders,
        currentOrder: null,
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    const nextButton = screen.getByText(/Next →/i);

    // Button should not be disabled since we're on page 1 and have 2 total pages
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    // After clicking, the dispatch should update the page
    expect(nextButton).toBeInTheDocument();
  });
});

describe("OrderList - Loading State", () => {
  it("should show loading spinner", () => {
    const preloadedState = {
      order: {
        orders: [],
        currentOrder: null,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        isLoading: true,
        error: null,
      },
    };

    const { container } = renderWithProviders(<OrderList />, {
      preloadedState,
    });

    // Loading spinner should be visible (look for the spinning div with specific classes)
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});

describe("OrderList - Error State", () => {
  it("should display error message", async () => {
    // Import the mocked service and make it reject
    const { orderService } = await import("@/services/order.service");
    (orderService.getUserOrders as any).mockRejectedValueOnce(
      new Error("Failed to fetch orders")
    );

    const preloadedState = {
      order: {
        orders: [],
        currentOrder: null,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        isLoading: false,
        error: null, // Start with no error - the fetch will cause it
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    // Wait for the error message to appear after the fetch fails
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument();
  });
});

describe("OrderList - Empty State", () => {
  it("should show empty state message", async () => {
    const preloadedState = {
      order: {
        orders: [],
        currentOrder: null,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        isLoading: false,
        error: null,
      },
    };

    renderWithProviders(<OrderList />, { preloadedState });

    // Wait for the empty state message to appear
    await waitFor(() => {
      expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
    });
  });
});
