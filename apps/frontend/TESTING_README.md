# Order Service Frontend Tests

Comprehensive test suite for the Order Service frontend implementation.

## Test Coverage

### Unit Tests

#### 1. **Types Tests** (`src/types/order.types.test.ts`)

- OrderStatus enum validation
- OrderItem interface compliance
- ShippingAddress interface compliance
- Order interface with all fields
- CreateOrderData validation
- UpdateOrderStatusData validation
- CancelOrderData validation
- OrderFilters validation

#### 2. **Service Layer Tests** (`src/services/order.service.test.ts`)

- `createOrder()` - Create order API calls
- `getUserOrders()` - Fetch user orders with/without filters
- `getOrderById()` - Fetch single order
- `cancelOrder()` - Cancel order with/without reason
- `getAllOrders()` - Admin fetch all orders
- `updateOrderStatus()` - Admin update order status
- Error handling for all methods
- Query parameter building

#### 3. **Redux Slice Tests** (`src/store/slices/orderSlice.test.ts`)

- Initial state validation
- Synchronous reducers:
  - `clearError()`
  - `clearCurrentOrder()`
  - `setPage()`
  - `setLimit()`
- Async thunks (pending/fulfilled/rejected states):
  - `createOrderAsync`
  - `fetchUserOrdersAsync`
  - `fetchOrderByIdAsync`
  - `cancelOrderAsync`
  - `fetchAllOrdersAsync`
  - `updateOrderStatusAsync`
- State updates after actions
- Error handling

### Component Tests

#### 4. **OrderCard Tests** (`src/components/Orders/OrderCard.test.tsx`)

- Renders order information correctly
- Displays order status with correct styling
- Navigates to order detail on click
- Shows tracking number when available
- Truncates items list when more than 2
- Formats dates correctly
- Displays shipping address

#### 5. **OrderList Tests** (`src/components/Orders/OrderList.test.tsx`)

- Renders list of orders
- Displays status filter dropdown
- Dispatches fetch action on filter change
- Shows pagination controls
- Handles page navigation
- Loading state with spinner
- Error state with message
- Empty state message

#### 6. **OrderDetails Tests** (`src/components/Orders/OrderDetails.test.tsx`)

- Renders complete order information
- Displays all order items
- Shows order summary with calculations
- Displays shipping address
- Shows cancel button conditionally
- Calls onCancel when button clicked
- Shows tracking information
- Shows delivery information
- Shows cancellation information
- Displays notes and payment info

### Integration Tests

#### 7. **OrdersPage Integration** (`src/pages/Orders.test.tsx`)

- Renders page with title and button
- Navigates to create order page
- Displays order list
- Has filter dropdown
- Handles filter selection

## Test Configuration

### Files

- **`vitest.config.ts`** - Vitest configuration
- **`src/test/setup.ts`** - Test environment setup
- **`src/test/test-utils.tsx`** - Custom render utilities
- **`src/test/mockData.ts`** - Mock data for tests

### Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @redux-devtools/extension redux-mock-store
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test -- --watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests with UI

```bash
npm run test:ui
```

### Run specific test file

```bash
npm test -- order.service.test.ts
```

### Run tests matching pattern

```bash
npm test -- --grep "OrderCard"
```

## Test Utilities

### renderWithProviders

Custom render function that wraps components with Redux Provider and React Router:

```typescript
import { renderWithProviders } from "@/test/test-utils";

const { store } = renderWithProviders(<MyComponent />, {
  preloadedState: {
    order: {
      orders: mockOrders,
      // ... other state
    },
  },
});
```

### Mock Data

Reusable mock data available in `src/test/mockData.ts`:

- `mockShippingAddress` - Sample shipping address
- `mockOrderItems` - Array of order items
- `mockOrder` - Complete order object
- `mockOrders` - Array of orders
- `mockPaginatedOrders` - Paginated response
- `mockCreateOrderData` - Order creation data
- `mockUser` - Regular user
- `mockAdminUser` - Admin user

## Test Patterns

### Testing Async Redux Actions

```typescript
it("should create order successfully", async () => {
  mockOrderService.createOrder.mockResolvedValue(mockOrder);

  await store.dispatch(createOrderAsync(mockCreateOrderData));

  const state = store.getState().order;
  expect(state.currentOrder).toEqual(mockOrder);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
});
```

### Testing Component with Redux

```typescript
it("should display orders", () => {
  const { store } = renderWithProviders(<OrderList />, {
    preloadedState: {
      order: {
        orders: mockOrders,
        isLoading: false,
        error: null,
      },
    },
  });

  expect(screen.getByText(/ORD-2025-001/)).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
it("should handle filter change", async () => {
  renderWithProviders(<OrderList />);

  const filterDropdown = screen.getByRole("combobox");
  await userEvent.selectOptions(filterDropdown, "shipped");

  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalled();
  });
});
```

### Testing Navigation

```typescript
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

it("should navigate on click", () => {
  renderWithProviders(<OrderCard order={mockOrder} />);

  fireEvent.click(screen.getByText(/Order #/));

  expect(mockNavigate).toHaveBeenCalledWith("/orders/order-123");
});
```

## Coverage Goals

Target coverage metrics:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Coverage Report

View coverage in browser:

```bash
npm run test:coverage
open coverage/index.html
```

## Mocking Strategies

### Mocking Axios

```typescript
vi.mock("axios");
const mockedAxios = axios as any;

mockedAxios.create.mockReturnValue({
  get: vi.fn().mockResolvedValue({ data: mockData }),
  post: vi.fn(),
  // ...
});
```

### Mocking Redux Hooks

```typescript
const mockDispatch = vi.fn();
vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector(mockState),
}));
```

### Mocking React Router

```typescript
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

## Best Practices

1. **Clear mocks between tests**: Use `beforeEach(() => vi.clearAllMocks())`
2. **Test user behavior**: Focus on what users see and do
3. **Avoid implementation details**: Test outcomes, not internals
4. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
5. **Test error states**: Don't just test happy paths
6. **Keep tests focused**: One concept per test
7. **Use descriptive test names**: Should read like documentation

## Debugging Tests

### View component output

```typescript
import { screen } from "@testing-library/react";

screen.debug(); // Prints entire DOM
screen.debug(screen.getByRole("button")); // Prints specific element
```

### Use testing-library queries interactively

```typescript
import { screen } from "@testing-library/react";

screen.logTestingPlaygroundURL(); // Opens testing playground
```

### Run specific test with console logs

```bash
npm test -- order.service.test.ts --reporter=verbose
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Pre-push hooks

CI command:

```bash
npm run test:coverage -- --run
```

## Future Enhancements

Tests to add:

- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Performance tests
- [ ] API integration tests
- [ ] Cross-browser tests

## Test Files Summary

| File                    | Tests | Coverage            |
| ----------------------- | ----- | ------------------- |
| `order.types.test.ts`   | 15    | Type validation     |
| `order.service.test.ts` | 12    | API calls           |
| `orderSlice.test.ts`    | 25    | State management    |
| `OrderCard.test.tsx`    | 8     | Component rendering |
| `OrderList.test.tsx`    | 11    | List functionality  |
| `OrderDetails.test.tsx` | 13    | Detail view         |
| `Orders.test.tsx`       | 6     | Page integration    |

**Total Tests**: 90+

## Troubleshooting

### Tests not running

- Check Node version (>= 18)
- Clear node_modules and reinstall
- Check vitest.config.ts paths

### Import errors

- Verify tsconfig paths
- Check vite.config.ts aliases
- Restart TypeScript server

### Mock not working

- Ensure mock is before import
- Use `vi.clearAllMocks()` in beforeEach
- Check mock return values

---

**Test Framework**: Vitest
**Testing Library**: React Testing Library
**Last Updated**: December 1, 2025
