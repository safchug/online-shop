# Order Service E2E Tests

Comprehensive end-to-end tests for the Order Service microservice.

## Test Coverage

### Test Suites (8 suites, 46 tests)

1. **Create Order** (5 tests)
   - Creating orders successfully with various configurations
   - Unique order number generation
   - Shipping address validation
   - Multi-item orders

2. **Get User Orders** (5 tests)
   - Retrieving all orders for a user
   - Pagination
   - Sorting by creation date
   - Status filtering
   - Empty results handling

3. **Get Order By ID** (4 tests)
   - Retrieving specific orders
   - Invalid ID handling
   - Non-existent order handling
   - User ownership validation

4. **Cancel Order** (7 tests)
   - Cancelling orders in valid states
   - Cancellation with/without reasons
   - Invalid state transition prevention
   - User ownership validation

5. **Get All Orders (Admin)** (4 tests)
   - Admin view of all orders
   - Pagination
   - Status filtering
   - User ID filtering

6. **Update Order Status (Admin)** (11 tests)
   - Status transitions through complete workflow
   - Tracking number updates
   - Order notes
   - Invalid transition prevention
   - Terminal state protection (delivered, cancelled)

7. **Order Number Generation** (2 tests)
   - Format validation (ORD-YYMMDD-XXXX)
   - Sequential numbering within same day

8. **Order Timestamps** (4 tests)
   - Creation timestamps
   - Status change timestamps (shipped, delivered, cancelled)

9. **Data Validation** (3 tests)
   - Price validation
   - Quantity validation
   - Required fields validation

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run with coverage
npm run test:e2e -- --coverage

# Run in watch mode
npm run test:e2e:watch

# Run specific test suite
npm run test:e2e -- -t "Create Order"
```

## Test Infrastructure

- **In-Memory MongoDB**: Uses `mongodb-memory-server` for fast, isolated testing
- **TCP Microservice**: Tests against actual microservice transport layer
- **Clean State**: Database cleared between tests for isolation
- **Helper Functions**: Reusable test data generators in `test-helpers.ts`

## Test Helpers

### Order Generators

- `createTestOrder(userId, overrides?)` - Standard test order
- `createMultiItemOrder(userId, overrides?)` - Order with multiple items
- `createMinimalOrder(userId)` - Minimal valid order

### Utility Functions

- `generateUserId()` - Generate unique MongoDB ObjectId
- `generateMultipleUserIds(count)` - Generate multiple user IDs
- `clearDatabase(connection)` - Clean database between tests

## Key Test Scenarios

### Order Lifecycle

```
PENDING → PROCESSING → SHIPPED → DELIVERED ✓
PENDING → CANCELLED ✓
PROCESSING → CANCELLED ✓
SHIPPED → CANCELLED ✗ (prevented)
DELIVERED → * ✗ (terminal state)
```

### Business Rules Tested

- Orders can only be cancelled before shipping
- Sequential order numbers per day
- Automatic timestamp tracking for status changes
- User can only access their own orders (except admin)
- Status transitions must follow valid paths

## Error Handling

Tests verify proper error responses for:

- Invalid order IDs
- Non-existent orders
- Unauthorized access
- Invalid status transitions
- Invalid data (negative prices, zero quantities)
- Missing required fields

## Performance Considerations

- Tests complete in ~2.5 seconds
- Uses in-memory database for speed
- Parallel test execution where possible
- Proper cleanup to prevent memory leaks
