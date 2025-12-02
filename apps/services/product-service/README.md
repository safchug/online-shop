# Product Service

A NestJS-based microservice for managing products in the online shop platform. This service handles all product-related operations including CRUD operations, search, inventory management, and product categorization.

## Features

- ✅ **Product Management**: Create, read, update, and delete products
- ✅ **Advanced Search**: Full-text search with MongoDB text indexing
- ✅ **Inventory Tracking**: Real-time stock management
- ✅ **Product Categories**: Support for multiple product categories
- ✅ **Image Management**: Multiple images per product with primary image support
- ✅ **Product Metadata**: Flexible metadata storage for custom attributes
- ✅ **Product Analytics**: Track views, ratings, and sales
- ✅ **Vendor Support**: Multi-vendor product management
- ✅ **Featured Products**: Highlight special products

## Tech Stack

- **NestJS**: Progressive Node.js framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **TCP Transport**: Microservices communication
- **Class Validator**: DTO validation
- **TypeScript**: Type-safe development

## Architecture

This service follows a microservice architecture pattern:

- Communicates via TCP transport protocol
- Uses message patterns for inter-service communication
- Implements RPC exception handling
- Integrates with the API Gateway

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## Configuration

The service requires the following environment variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27020/product-service

# Service Configuration
PRODUCT_SERVICE_HOST=localhost
PRODUCT_SERVICE_PORT=3004

# Node Environment
NODE_ENV=development
```

## Running the Service

### Development Mode

```bash
# Start with watch mode
npm run dev

# Or use standard watch mode
npm run start:dev
```

### Production Mode

```bash
# Build the service
npm run build

# Start production server
npm run start:prod
```

### Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f product-service

# Stop services
docker-compose down
```

## Database

### MongoDB Setup

The service uses MongoDB with Mongoose ODM. The database includes:

- **Products Collection**: Stores all product data
- **Indexes**: Optimized for search and queries
  - Text index on name, description, and tags
  - Indexes on category, price, SKU, vendorId
  - Compound indexes for featured and active products

### Product Schema

```typescript
{
  name: string;              // Product name
  description: string;       // Detailed description
  sku: string;              // Unique SKU
  price: number;            // Current price
  compareAtPrice?: number;  // Original price (for discounts)
  stock: number;            // Available quantity
  category: ProductCategory; // Product category
  tags: string[];           // Search tags
  images: ProductImage[];   // Product images
  brand?: string;           // Brand name
  dimensions?: ProductDimensions; // Physical dimensions
  isActive: boolean;        // Active status
  isFeatured: boolean;      // Featured status
  vendorId?: ObjectId;      // Vendor reference
  averageRating: number;    // Average rating (0-5)
  reviewCount: number;      // Number of reviews
  soldCount: number;        // Total units sold
  viewCount: number;        // Total views
  metadata?: Map;           // Custom attributes
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Update timestamp
}
```

## API Operations

The service exposes the following message patterns:

### Create Product

```typescript
{
  cmd: "create-product";
}
// Creates a new product with provided details
```

### Get All Products

```typescript
{
  cmd: "get-all-products";
}
// Retrieves paginated list of products with optional filters
// Supports: category, vendorId, isActive, isFeatured
```

### Get Product by ID

```typescript
{
  cmd: "get-product";
}
// Retrieves a single product by ID
// Automatically increments view count
```

### Update Product

```typescript
{
  cmd: "update-product";
}
// Updates existing product details
// Validates SKU uniqueness
```

### Delete Product

```typescript
{
  cmd: "delete-product";
}
// Permanently removes a product
```

### Search Products

```typescript
{
  cmd: "search-products";
}
// Full-text search across name, description, and tags
// Returns paginated results sorted by relevance
```

## Product Categories

The service supports the following product categories:

- Electronics
- Clothing
- Books
- Home
- Sports
- Toys
- Food
- Beauty
- Other

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Integration with API Gateway

The Product Service integrates with the API Gateway on port 3004. The gateway exposes the following REST endpoints:

- `GET /products` - Get all products (with pagination and filters)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product (Vendor/Admin only)
- `PUT /products/:id` - Update product (Vendor/Admin only)
- `DELETE /products/:id` - Delete product (Vendor/Admin only)
- `GET /products/search?q=query` - Search products

## Error Handling

The service implements comprehensive error handling:

- **400 Bad Request**: Invalid input data or IDs
- **404 Not Found**: Product does not exist
- **500 Internal Server Error**: Server-side errors

All errors are properly formatted using the RPC exception filter.

## Performance Considerations

- MongoDB indexes for optimized queries
- Pagination for large datasets
- Text search with relevance scoring
- Efficient stock management
- Connection pooling

## Security

- Input validation using class-validator
- DTO transformation and sanitization
- Environment-based configuration
- MongoDB injection prevention

## Monitoring

The service logs:

- Service startup and port information
- Database connection status
- Error details for debugging

## Future Enhancements

- [ ] Product reviews and ratings management
- [ ] Bulk import/export functionality
- [ ] Product variants support
- [ ] Advanced filtering and sorting
- [ ] Image upload and processing
- [ ] Product recommendations
- [ ] Price history tracking
- [ ] Low stock alerts
- [ ] Product analytics dashboard

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation as needed
4. Use TypeScript strict mode
5. Follow NestJS best practices

## License

This service is part of the online-shop monorepo project.

## Support

For issues and questions, please refer to the main project documentation.
