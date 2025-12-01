# Order Service Frontend

This directory contains the frontend implementation for the Order Service in the Online Shop application.

## Overview

The Order Service frontend provides a complete user interface for managing orders, including:

- **User Features:**
  - View all personal orders with filtering and pagination
  - View detailed order information
  - Create new orders with shopping cart functionality
  - Cancel pending orders
- **Admin Features:**
  - View all orders across all users
  - Update order status (pending, processing, shipped, delivered, cancelled)
  - Add tracking numbers and notes to orders
  - Filter orders by status and user

## Architecture

### File Structure

```
src/
├── components/
│   └── Orders/
│       ├── OrderCard.tsx         # Order card component for list view
│       ├── OrderList.tsx         # Orders list with filtering
│       ├── OrderDetails.tsx      # Detailed order view
│       └── index.ts             # Component exports
├── pages/
│   ├── Orders.tsx               # User orders page
│   ├── OrderDetail.tsx          # Single order detail page
│   ├── CreateOrder.tsx          # Order creation page
│   └── AdminOrders.tsx          # Admin order management page
├── services/
│   └── order.service.ts         # Order API service
├── store/
│   └── slices/
│       └── orderSlice.ts        # Redux state management
└── types/
    └── order.types.ts           # TypeScript type definitions
```

### Key Components

#### OrderCard

Displays a summary of an order in card format:

- Order number and date
- Order status badge
- Items list (with truncation for many items)
- Shipping address summary
- Total amount
- Tracking information (if available)

#### OrderList

Displays a list of orders with:

- Status filtering
- Pagination controls
- Loading and error states

#### OrderDetails

Shows comprehensive order information:

- All order items with pricing
- Order summary (subtotal, tax, shipping)
- Shipping address
- Tracking information
- Delivery/cancellation details
- Payment information
- Order notes

#### CreateOrder

Shopping cart and checkout interface:

- Product selection
- Cart management
- Shipping address form
- Order summary with calculations

### Redux Store

The `orderSlice` manages the following state:

```typescript
interface OrderState {
  orders: Order[]; // List of orders
  currentOrder: Order | null; // Currently viewed order
  total: number; // Total count for pagination
  page: number; // Current page
  limit: number; // Items per page
  totalPages: number; // Total pages
  isLoading: boolean; // Loading state
  error: string | null; // Error message
}
```

#### Actions

- `createOrderAsync` - Create a new order
- `fetchUserOrdersAsync` - Fetch user's orders with filters
- `fetchOrderByIdAsync` - Fetch a single order by ID
- `cancelOrderAsync` - Cancel an order
- `fetchAllOrdersAsync` - Fetch all orders (admin only)
- `updateOrderStatusAsync` - Update order status (admin only)

### Service Layer

The `orderService` provides API methods:

```typescript
class OrderService {
  createOrder(orderData: CreateOrderData): Promise<Order>;
  getUserOrders(filters?: OrderFilters): Promise<PaginatedOrders>;
  getOrderById(orderId: string): Promise<Order>;
  cancelOrder(orderId: string, data?: CancelOrderData): Promise<Order>;
  getAllOrders(filters?: OrderFilters): Promise<PaginatedOrders>;
  updateOrderStatus(
    orderId: string,
    statusData: UpdateOrderStatusData
  ): Promise<Order>;
}
```

### Type Definitions

Key types include:

- `Order` - Complete order entity
- `OrderItem` - Individual product in an order
- `ShippingAddress` - Delivery address information
- `OrderStatus` - Enum for order states
- `CreateOrderData` - Data required to create an order
- `UpdateOrderStatusData` - Data for updating order status
- `OrderFilters` - Filtering options for order lists

## Routes

The following routes are available:

| Route            | Component       | Protection | Description        |
| ---------------- | --------------- | ---------- | ------------------ |
| `/orders`        | OrdersPage      | User       | List user's orders |
| `/orders/create` | CreateOrderPage | User       | Create new order   |
| `/orders/:id`    | OrderDetailPage | User       | View order details |
| `/admin/orders`  | AdminOrdersPage | Admin      | Manage all orders  |

## Features

### Order Status Flow

```
PENDING → PROCESSING → SHIPPED → DELIVERED
   ↓
CANCELLED
```

### Status Colors

- **Pending**: Yellow
- **Processing**: Blue
- **Shipped**: Purple
- **Delivered**: Green
- **Cancelled**: Red

### Filtering

Users can filter orders by:

- Status (all, pending, processing, shipped, delivered, cancelled)
- Pagination (page, limit)

Admins can additionally filter by:

- User ID

### Order Calculations

Orders automatically calculate:

- **Subtotal**: Sum of all item subtotals
- **Tax**: 8% of subtotal (configurable)
- **Shipping**: Flat rate of $10 (configurable)
- **Total**: Subtotal + Tax + Shipping

## Usage Examples

### Creating an Order

```typescript
import { useAppDispatch } from "@/store/hooks";
import { createOrderAsync } from "@/store/slices/orderSlice";

const dispatch = useAppDispatch();

const orderData = {
  items: [
    {
      productId: "1",
      name: "Laptop",
      price: 999.99,
      quantity: 1,
      subtotal: 999.99,
    },
  ],
  subtotal: 999.99,
  tax: 79.99,
  shippingCost: 10.0,
  total: 1089.98,
  shippingAddress: {
    fullName: "John Doe",
    addressLine1: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    phoneNumber: "+1234567890",
  },
};

await dispatch(createOrderAsync(orderData));
```

### Fetching Orders

```typescript
import { fetchUserOrdersAsync } from "@/store/slices/orderSlice";

// Fetch all orders
dispatch(fetchUserOrdersAsync());

// Fetch filtered orders
dispatch(
  fetchUserOrdersAsync({
    status: OrderStatus.SHIPPED,
    page: 1,
    limit: 10,
  })
);
```

### Updating Order Status (Admin)

```typescript
import { updateOrderStatusAsync } from "@/store/slices/orderSlice";

dispatch(
  updateOrderStatusAsync({
    orderId: "order-id",
    statusData: {
      status: OrderStatus.SHIPPED,
      trackingNumber: "TRACK123456",
      notes: "Shipped via FedEx",
    },
  })
);
```

## Styling

The components use Tailwind CSS for styling with:

- Responsive design (mobile-first)
- Consistent color scheme
- Hover effects and transitions
- Loading states with spinners
- Modal overlays for actions

## Error Handling

All async operations include error handling:

- Network errors display user-friendly messages
- Loading states prevent duplicate submissions
- Error messages can be cleared from state
- Failed operations can be retried

## Accessibility

Components include:

- Semantic HTML structure
- Proper button labels
- Form validation
- Keyboard navigation support
- Screen reader friendly

## Future Enhancements

Potential improvements:

- [ ] Order search functionality
- [ ] Export orders to PDF/CSV
- [ ] Order history timeline
- [ ] Email notifications integration
- [ ] Real-time order status updates via WebSocket
- [ ] Order review and rating system
- [ ] Saved shipping addresses
- [ ] Multiple payment methods
- [ ] Order templates for repeat orders
- [ ] Bulk order operations (admin)

## Testing

To test the order functionality:

1. **User Flow:**
   - Login as a regular user
   - Navigate to "My Orders"
   - Click "Create New Order"
   - Add items to cart
   - Fill shipping address
   - Submit order
   - View order details
   - Cancel order (if status allows)

2. **Admin Flow:**
   - Login as an admin user
   - Navigate to "Manage Orders"
   - View all orders
   - Filter by status
   - Update order status
   - Add tracking information

## Dependencies

- React 18+
- Redux Toolkit
- React Router v6
- Axios
- TypeScript
- Tailwind CSS

## API Integration

The frontend integrates with the backend API Gateway at:

- Base URL: `process.env.VITE_API_URL || '/api'`
- Authentication: JWT Bearer token
- Endpoints: `/orders/*`

Ensure the backend order-service is running and accessible through the API Gateway.
