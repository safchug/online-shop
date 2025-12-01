# Order Service

Order management microservice for the online shop platform.

## Features

- Create orders
- Retrieve user orders
- Get order details
- Cancel orders
- Update order status (Admin)
- Get all orders (Admin)

## Tech Stack

- NestJS
- MongoDB + Mongoose
- TCP Microservice Transport

## Environment Variables

```env
NODE_ENV=development
ORDER_SERVICE_HOST=localhost
ORDER_SERVICE_PORT=3003
MONGODB_URI=mongodb://localhost:27017/order-service
```

## Running the Service

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## Testing

```bash
# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:e2e -- --coverage

# Run in watch mode
npm run test:e2e:watch
```

The service includes 46 comprehensive e2e tests covering:

- Order creation and validation
- Order retrieval and pagination
- Order cancellation
- Status management and transitions
- Admin operations
- Data validation
- Error handling

See `test/README.md` for detailed test documentation.

## Message Patterns

- `create-order` - Create a new order
- `get-user-orders` - Get all orders for a user
- `get-order` - Get a specific order by ID
- `cancel-order` - Cancel an order
- `get-all-orders` - Get all orders (Admin)
- `update-order-status` - Update order status (Admin)
