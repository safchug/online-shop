# API Gateway

API Gateway for the Online Shop microservices architecture. This gateway serves as the single entry point for all client requests and routes them to appropriate microservices using TCP transport.

## Architecture

The API Gateway follows the NestJS microservices pattern with TCP transport for inter-service communication.

### Microservices

The gateway connects to the following microservices:

- **Auth Service** (Port 3001) - Authentication and authorization
- **User Service** (Port 3002) - User management
- **Product Service** (Port 3003) - Product catalog
- **Order Service** (Port 3004) - Order processing
- **Payment Service** (Port 3005) - Payment processing
- **Notification Service** (Port 3006) - Notifications

## Features

- ✅ RESTful API Gateway
- ✅ TCP communication with microservices
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Swagger/OpenAPI documentation
- ✅ Global exception handling
- ✅ Request/response logging
- ✅ CORS support
- ✅ Input validation

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
# API Gateway Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1h

# Microservices TCP Configuration
AUTH_SERVICE_HOST=localhost
AUTH_SERVICE_PORT=3001

USER_SERVICE_HOST=localhost
USER_SERVICE_PORT=3002

PRODUCT_SERVICE_HOST=localhost
PRODUCT_SERVICE_PORT=3003

ORDER_SERVICE_HOST=localhost
ORDER_SERVICE_PORT=3004

PAYMENT_SERVICE_HOST=localhost
PAYMENT_SERVICE_PORT=3005

NOTIFICATION_SERVICE_HOST=localhost
NOTIFICATION_SERVICE_PORT=3006

# CORS
CORS_ORIGIN=*
```

## Running the Gateway

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

The API Gateway will be available at:

- API: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api/docs`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `DELETE /api/users/profile` - Delete current user account
- `GET /api/users/:id` - Get user by ID (Admin only)
- `GET /api/users` - Get all users (Admin only)

### Products

- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product (Vendor/Admin)
- `PUT /api/products/:id` - Update product (Vendor/Admin)
- `DELETE /api/products/:id` - Delete product (Vendor/Admin)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get current user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments

- `POST /api/payments/process` - Process payment
- `GET /api/payments/methods` - Get user payment methods
- `POST /api/payments/methods` - Add payment method
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/refund` - Process refund (Admin only)

### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/preferences` - Get notification preferences
- `POST /api/notifications/preferences` - Update notification preferences

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- `customer` - Regular customer
- `vendor` - Product vendor
- `admin` - Administrator
- `super_admin` - Super administrator

## Communication Pattern

The gateway uses NestJS microservices with TCP transport:

```typescript
// Example: Sending a message to Auth Service
const result = await firstValueFrom(
  this.authService.send({ cmd: "login" }, { email, password })
);
```

Each microservice listens on its designated TCP port and responds to command patterns like `{ cmd: 'command-name' }`.

## Error Handling

The gateway includes a global exception filter that:

- Catches all exceptions
- Formats error responses consistently
- Logs errors with context
- Returns appropriate HTTP status codes

## Logging

Request/response logging is enabled via a global interceptor that logs:

- Incoming requests (method, URL, user agent)
- Request body (in debug mode)
- Response status and timing
- Errors with stack traces

## Development

```bash
# Run in watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint
```

## Project Structure

```
src/
├── common/
│   ├── filters/          # Exception filters
│   └── interceptors/     # Request interceptors
├── config/
│   └── microservices.config.ts  # Microservice configurations
├── modules/
│   ├── auth/             # Authentication module
│   ├── users/            # Users module
│   ├── products/         # Products module
│   ├── orders/           # Orders module
│   ├── payments/         # Payments module
│   └── notifications/    # Notifications module
├── app.module.ts         # Root module
└── main.ts              # Application entry point
```

## Security Considerations

- JWT tokens should be stored securely (httpOnly cookies recommended)
- Use strong JWT secrets in production
- Implement rate limiting for API endpoints
- Enable HTTPS in production
- Validate all input data
- Implement request timeouts for microservice calls

## Production Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables
3. Run with a process manager (PM2, systemd)
4. Use a reverse proxy (nginx, Apache)
5. Enable HTTPS
6. Set up monitoring and logging

## Troubleshooting

### Cannot connect to microservice

- Ensure the microservice is running on the specified host:port
- Check network connectivity
- Verify firewall rules
- Check environment variables

### JWT validation fails

- Verify JWT_SECRET matches across services
- Check token expiration
- Ensure token is properly formatted in Authorization header

## License

MIT
