import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import OrdersPage from "@/pages/Orders";
import { mockOrders } from "@/test/mockData";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) =>
    selector({
      order: {
        orders: mockOrders,
        isLoading: false,
        error: null,
        page: 1,
        totalPages: 1,
      },
    }),
}));

describe("OrdersPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the orders page with title and button", () => {
    renderWithProviders(<OrdersPage />);

    expect(screen.getByText("My Orders")).toBeInTheDocument();
    expect(
      screen.getByText("View and manage your order history")
    ).toBeInTheDocument();
    expect(screen.getByText("Create New Order")).toBeInTheDocument();
  });

  it("should navigate to create order page when clicking button", () => {
    renderWithProviders(<OrdersPage />);

    const createButton = screen.getByText("Create New Order");
    fireEvent.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith("/orders/create");
  });

  it("should display order list", () => {
    renderWithProviders(<OrdersPage />);

    expect(screen.getByText(/ORD-2025-001/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD-2025-002/i)).toBeInTheDocument();
  });

  it("should have filter dropdown", () => {
    renderWithProviders(<OrdersPage />);

    const filterDropdown = screen.getByRole("combobox");
    expect(filterDropdown).toBeInTheDocument();
  });
});

describe("OrdersPage - User Interactions", () => {
  it("should handle filter selection", async () => {
    renderWithProviders(<OrdersPage />);

    const filterDropdown = screen.getByRole("combobox");
    await userEvent.selectOptions(filterDropdown, "shipped");

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
