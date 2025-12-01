# Quick Start Guide - Order Service Frontend

## Prerequisites

Ensure the following services are running:

1. MongoDB (for order-service)
2. Auth Service (on port 3001)
3. Order Service (on port 3003)
4. API Gateway (on port 3000)

## Start Frontend

```bash
cd apps/frontend
npm install  # if not already done
npm run dev
```

The frontend will start on `http://localhost:5173`

## Test User Credentials

### Regular User

```
Email: user@example.com
Password: [your password]
```

### Admin User

```
Email: admin@example.com
Password: [your password]
```

## Quick Test Flow

### 1. Create an Order (Regular User)

1. Login at `http://localhost:5173/login`
2. Click "My Orders" in the navigation
3. Click "Create New Order" button
4. Add products to cart:
   - Laptop ($999.99)
   - Mouse ($29.99)
   - Keyboard ($79.99)
   - Monitor ($299.99)
   - Headphones ($149.99)
5. Adjust quantities as needed
6. Fill in shipping address:
   ```
   Full Name: John Doe
   Address Line 1: 123 Main Street
   City: New York
   State: NY
   Postal Code: 10001
   Country: USA
   Phone: +1 (555) 123-4567
   ```
7. Click "Place Order"
8. You'll be redirected to the order details page

### 2. View Orders

1. Go to "My Orders" from navigation
2. See your order list with status badges
3. Click on any order to view full details
4. Try filtering by status

### 3. Cancel an Order

1. Open an order in PENDING or PROCESSING status
2. Click "Cancel Order" button
3. Optionally provide a cancellation reason
4. Confirm cancellation
5. Order status updates to CANCELLED

### 4. Admin Functions

1. Login as admin user
2. Click "Manage Orders" in navigation
3. View all orders from all users
4. Click "Update Status" on any order
5. Change status (e.g., from PENDING to PROCESSING)
6. Add tracking number: `TRACK123456789`
7. Add notes: `Order is being prepared for shipment`
8. Click "Update Status"
9. See the changes reflected immediately

### 5. Test Pagination

1. Create multiple orders (at least 10)
2. Navigate between pages
3. Test different page sizes

### 6. Test Filtering

1. Create orders with different statuses
2. Use the status filter dropdown
3. Select "Shipped" to see only shipped orders
4. Select "Delivered" to see completed orders
5. Select "All Orders" to see everything

## API Endpoints Being Used

The frontend makes calls to these API Gateway endpoints:

```
GET    /api/orders              - Get user's orders
POST   /api/orders              - Create order
GET    /api/orders/:id          - Get order details
PUT    /api/orders/:id/cancel   - Cancel order
GET    /api/orders/all          - Get all orders (admin)
PUT    /api/orders/:id/status   - Update status (admin)
```

## Troubleshooting

### Orders not loading

- Check that API Gateway is running on port 3000
- Check that Order Service is running on port 3003
- Check browser console for errors
- Verify JWT token in localStorage

### Cannot create order

- Ensure you're logged in
- Check that cart has items
- Verify all required fields in shipping address
- Check network tab for API errors

### Admin features not visible

- Ensure logged in as admin user
- Check user role in localStorage
- Verify backend returns correct user role

### 401 Unauthorized errors

- Login again to refresh token
- Check that Auth Service is running
- Verify token in localStorage

## Environment Setup

Create `.env` file in `apps/frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

## File Locations

Key files created:

```
apps/frontend/src/
├── components/Orders/       # Order UI components
├── pages/
│   ├── Orders.tsx          # Orders list
│   ├── OrderDetail.tsx     # Single order
│   ├── CreateOrder.tsx     # Create order
│   └── AdminOrders.tsx     # Admin management
├── services/
│   └── order.service.ts    # API calls
├── store/slices/
│   └── orderSlice.ts       # State management
└── types/
    └── order.types.ts      # TypeScript types
```

## Common Issues

**Issue**: "Failed to fetch orders"
**Solution**: Make sure order-service is running and accessible

**Issue**: Create order button is disabled
**Solution**: Add items to cart and fill all required fields

**Issue**: Cannot cancel order
**Solution**: Only PENDING and PROCESSING orders can be cancelled

**Issue**: Admin features not showing
**Solution**: Login with admin credentials (role must be 'admin' or 'super_admin')

## Next Steps

After testing basic functionality:

1. Integrate with real Product Service (replace mock products)
2. Add Payment Service integration
3. Implement WebSocket for real-time updates
4. Add order search functionality
5. Export orders feature
6. Email notifications

## Support

If you encounter issues:

1. Check browser console for errors
2. Check network tab for failed requests
3. Verify all microservices are running
4. Check MongoDB connection
5. Review backend logs

---

Happy Testing! 🚀
