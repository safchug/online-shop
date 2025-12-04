# Product Service Frontend

This document describes the frontend implementation for the Product Service in the Online Shop application.

## Overview

The product frontend provides a complete user interface for browsing, searching, filtering, and managing products. It includes separate views for customers (browsing/viewing) and vendors/admins (full CRUD operations).

## Features

### Customer Features
- **Browse Products**: View all available products with pagination
- **Product Details**: View detailed information about individual products
- **Search & Filter**: Search products by name/description and filter by:
  - Category
  - Price range
  - Stock availability
  - Featured products
  - Sort by various criteria (price, rating, name, etc.)
- **Product Reviews**: View customer reviews and ratings

### Vendor/Admin Features
- **Create Products**: Add new products with full details
- **Edit Products**: Update existing product information
- **Delete Products**: Remove products from the catalog
- **Product Management**: Full control over product visibility, pricing, and inventory

## File Structure

```
apps/frontend/src/
├── types/
│   └── product.types.ts          # TypeScript interfaces and enums
├── services/
│   └── product.service.ts        # API client for product endpoints
├── store/
│   └── slices/
│       └── productSlice.ts       # Redux slice for product state
├── components/
│   └── Products/
│       ├── ProductCard.tsx       # Individual product card component
│       ├── ProductList.tsx       # Grid/list of products
│       ├── ProductFilters.tsx    # Filter sidebar component
│       └── index.ts              # Barrel exports
└── pages/
    ├── Products.tsx              # Main products listing page
    ├── ProductDetail.tsx         # Product detail page
    └── ProductForm.tsx           # Create/Edit product form
```

## Components

### ProductCard
Displays a product in a card format with:
- Product image (with fallback)
- Name, brand, and description
- Price and discount information
- Rating and review count
- Stock status
- Tags
- Optional edit/delete actions for vendors/admins

**Props:**
```typescript
{
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}
```

### ProductList
Renders a grid of ProductCard components with loading and empty states.

**Props:**
```typescript
{
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}
```

### ProductFilters
Sidebar component for filtering and sorting products.

**Features:**
- Search by text
- Filter by category
- Price range filter
- Stock availability toggle
- Featured products toggle
- Sort by multiple criteria
- Clear all filters button

**Props:**
```typescript
{
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
}
```

## Pages

### Products Page (`/products`)
Main product listing page with:
- Grid view of all products
- Pagination controls
- Toggle-able filter sidebar
- Create product button (for vendors/admins)
- Loading states and error handling

### Product Detail Page (`/products/:id`)
Detailed view of a single product with:
- Image gallery with thumbnail navigation
- Full product information
- Price, stock, and availability
- Customer reviews
- Add to cart functionality
- Edit button (for vendors/admins)

### Product Form Page (`/products/create` and `/products/:id/edit`)
Form for creating new products or editing existing ones with:
- Basic information fields (name, SKU, description, etc.)
- Pricing and stock management
- Category selection
- Tag management
- Image gallery management
- Product visibility settings
- Validation and error handling

## State Management

### Redux Slice (productSlice)
Manages product-related state including:
- Products list
- Current product details
- Pagination info
- Loading states
- Error handling
- Filter state

**Actions:**
- `fetchProducts` - Get paginated product list
- `fetchProductById` - Get single product details
- `searchProducts` - Search products by query
- `createProduct` - Create new product (vendor/admin)
- `updateProduct` - Update existing product (vendor/admin)
- `deleteProduct` - Delete product (vendor/admin)
- `setFilters` - Update filter criteria
- `clearFilters` - Reset filters to default
- `clearCurrentProduct` - Clear current product details
- `clearError` - Clear error state

## API Integration

The `productService` provides methods for all product-related API calls:

```typescript
// Public endpoints
getAllProducts(filters?: ProductFilters): Promise<PaginatedProducts>
getProductById(productId: string): Promise<Product>
searchProducts(query: string): Promise<Product[]>

// Vendor/Admin endpoints (requires authentication)
createProduct(productData: CreateProductData): Promise<Product>
updateProduct(productId: string, productData: UpdateProductData): Promise<Product>
deleteProduct(productId: string): Promise<void>
addReview(productId: string, reviewData: AddReviewData): Promise<Product>
```

## Product Types

### ProductCategory
```typescript
enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  BOOKS = "books",
  HOME = "home",
  SPORTS = "sports",
  TOYS = "toys",
  FOOD = "food",
  BEAUTY = "beauty",
  OTHER = "other",
}
```

### Product Interface
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: ProductCategory;
  tags: string[];
  images: ProductImage[];
  brand?: string;
  dimensions?: ProductDimensions;
  isActive: boolean;
  isFeatured: boolean;
  vendorId?: string;
  averageRating: number;
  reviewCount: number;
  reviews: ProductReview[];
  soldCount: number;
  viewCount: number;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
```

## Routes

The following routes are registered in `App.tsx`:

- `/products` - Product listing page
- `/products/create` - Create new product (vendor/admin only)
- `/products/:id` - Product detail page
- `/products/:id/edit` - Edit product (vendor/admin only)

All routes are protected and require authentication.

## Permissions

Product management is role-based:
- **All authenticated users**: Can view products and details
- **Vendors**: Can create, edit, and delete their own products
- **Admins/Super Admins**: Can create, edit, and delete any product

## UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Loading States**: Skeleton loaders during data fetch
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no products found
- **Confirmation Dialogs**: Confirmation before deleting products
- **Image Gallery**: Multiple images with primary image selection
- **Tag Management**: Easy add/remove tags
- **Discount Display**: Automatic calculation and display of discounts
- **Stock Indicators**: Clear visual indicators for stock status
- **Rating Display**: Star ratings with review counts

## Integration with Other Services

The product frontend integrates with:
- **API Gateway**: All requests go through `/api/products` endpoints
- **Auth Service**: Uses JWT tokens for authenticated requests
- **Order Service**: Products are referenced when creating orders

## Future Enhancements

Potential improvements for the product frontend:
- [ ] Shopping cart functionality
- [ ] Wishlist/favorites
- [ ] Product comparison
- [ ] Advanced filtering (by multiple tags, rating ranges)
- [ ] Bulk product import/export
- [ ] Product variants (size, color, etc.)
- [ ] Inventory alerts for low stock
- [ ] Product analytics dashboard
- [ ] Image upload to cloud storage
- [ ] Rich text editor for descriptions

## Testing

To test the product frontend:

1. Start the backend services:
```bash
cd apps/services/product-service
npm run start:dev
```

2. Start the API gateway:
```bash
cd apps/services/api-gateway
npm run start:dev
```

3. Start the frontend:
```bash
cd apps/frontend
npm run dev
```

4. Navigate to `http://localhost:5173/products`

## Troubleshooting

### Products not loading
- Verify the API gateway is running
- Check the product service is running
- Verify the `VITE_API_URL` environment variable is set correctly
- Check browser console for network errors

### Can't create/edit products
- Ensure you're logged in as a vendor or admin
- Check JWT token is being sent in request headers
- Verify role-based permissions in the API gateway

### Images not displaying
- Verify image URLs are valid and accessible
- Check for CORS issues if images are hosted externally
- Ensure at least one image is marked as primary

## Environment Variables

Required environment variables in `.env`:
```
VITE_API_URL=http://localhost:3000
```

## Dependencies

Key dependencies used:
- `react` - UI framework
- `react-router-dom` - Routing
- `@reduxjs/toolkit` - State management
- `axios` - HTTP client
- `tailwindcss` - Styling

---

For more information about the backend product service, see the Product Service README in `apps/services/product-service/README.md`.
