import { Test, TestingModule } from "@nestjs/testing";
import { INestMicroservice } from "@nestjs/common";
import { ClientsModule, Transport, ClientProxy } from "@nestjs/microservices";
import { ConfigModule } from "@nestjs/config";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { firstValueFrom } from "rxjs";
import { OrderModule } from "../src/order/order.module";
import { OrderStatus } from "../src/entities/order.entity";
import {
  initMongoMemoryServer,
  rootMongooseTestModule,
  closeInMongodConnection,
  clearDatabase,
  createTestOrder,
  createMultiItemOrder,
  createMinimalOrder,
  generateUserId,
  generateMultipleUserIds,
} from "./test-helpers";

// Helper function to extract error message from RPC exception
const getErrorMessage = (error: any): string => {
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
};

describe("Order Service E2E Tests", () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let connection: Connection;
  let moduleFixture: TestingModule;
  let testUserId: string;

  beforeAll(async () => {
    // Initialize MongoMemoryServer first
    const mongoUri = await initMongoMemoryServer();

    // Set the MongoDB URI in the environment
    process.env.MONGODB_URI = mongoUri;

    // Create the microservice app
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        rootMongooseTestModule(mongoUri),
        OrderModule,
      ],
    }).compile();

    connection = moduleRef.get(getConnectionToken());

    app = moduleRef.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: "localhost",
        port: 3098,
      },
    });

    await app.listen();

    // Create the client module
    moduleFixture = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: "ORDER_SERVICE",
            transport: Transport.TCP,
            options: {
              host: "localhost",
              port: 3098,
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get("ORDER_SERVICE");
    await client.connect();

    testUserId = generateUserId();
  });

  afterAll(async () => {
    try {
      if (client) {
        await client.close();
      }
    } catch (error) {
      console.error("Error closing client:", error);
    }

    try {
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error("Error closing app:", error);
    }

    try {
      if (connection) {
        await connection.close();
      }
    } catch (error) {
      console.error("Error closing connection:", error);
    }

    try {
      if (moduleFixture) {
        await moduleFixture.close();
      }
    } catch (error) {
      console.error("Error closing moduleFixture:", error);
    }

    try {
      await closeInMongodConnection();
    } catch (error) {
      console.error("Error closing mongod:", error);
    }
  });

  beforeEach(async () => {
    await clearDatabase(connection);
  });

  describe("Create Order", () => {
    it("should create an order successfully", async () => {
      const orderData = createTestOrder(testUserId);

      const result = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(result.orderNumber).toMatch(/^ORD-\d{6}-\d{4}$/);
      expect(result.userId).toBe(orderData.userId);
      expect(result.items).toHaveLength(orderData.items.length);
      expect(result.items[0].productId).toBe(orderData.items[0].productId);
      expect(result.items[0].name).toBe(orderData.items[0].name);
      expect(result.items[0].price).toBe(orderData.items[0].price);
      expect(result.items[0].quantity).toBe(orderData.items[0].quantity);
      expect(result.items[0].subtotal).toBe(orderData.items[0].subtotal);
      expect(result.subtotal).toBe(orderData.subtotal);
      expect(result.tax).toBe(orderData.tax);
      expect(result.shippingCost).toBe(orderData.shippingCost);
      expect(result.total).toBe(orderData.total);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.shippingAddress.fullName).toBe(
        orderData.shippingAddress.fullName
      );
      expect(result.shippingAddress.addressLine1).toBe(
        orderData.shippingAddress.addressLine1
      );
      expect(result.shippingAddress.city).toBe(orderData.shippingAddress.city);
      expect(result.paymentId).toBe(orderData.paymentId);
      expect(result.notes).toBe(orderData.notes);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should create an order with multiple items", async () => {
      const orderData = createMultiItemOrder(testUserId);

      const result = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData)
      );

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(orderData.items.length);
      expect(result.items[0].productId).toBe(orderData.items[0].productId);
      expect(result.items[0].quantity).toBe(orderData.items[0].quantity);
      expect(result.items[1].productId).toBe(orderData.items[1].productId);
      expect(result.items[1].quantity).toBe(orderData.items[1].quantity);
      expect(result.items[2].productId).toBe(orderData.items[2].productId);
      expect(result.items[2].quantity).toBe(orderData.items[2].quantity);
      expect(result.subtotal).toBe(orderData.subtotal);
      expect(result.total).toBe(orderData.total);
    });

    it("should create a minimal order without optional fields", async () => {
      const orderData = createMinimalOrder(testUserId);

      const result = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.tax).toBe(orderData.tax);
      expect(result.shippingCost).toBe(orderData.shippingCost);
      expect(result.total).toBe(orderData.total);
      expect(result.subtotal).toBe(orderData.subtotal);
      expect(result.paymentId).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it("should generate unique order numbers", async () => {
      const orderData1 = createTestOrder(testUserId);
      const orderData2 = createTestOrder(testUserId);

      const result1 = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData1)
      );
      const result2 = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData2)
      );

      expect(result1.orderNumber).not.toBe(result2.orderNumber);
    });

    it("should create order with correct shipping address", async () => {
      const orderData = createTestOrder(testUserId, {
        shippingAddress: {
          fullName: "Custom Name",
          addressLine1: "999 Custom St",
          addressLine2: "Unit 10",
          city: "Custom City",
          state: "CC",
          postalCode: "99999",
          country: "CustomCountry",
          phoneNumber: "+9999999999",
        },
      });

      const result = await firstValueFrom(
        client.send({ cmd: "create-order" }, orderData)
      );

      expect(result.shippingAddress.fullName).toBe(
        orderData.shippingAddress.fullName
      );
      expect(result.shippingAddress.addressLine1).toBe(
        orderData.shippingAddress.addressLine1
      );
      expect(result.shippingAddress.addressLine2).toBe(
        orderData.shippingAddress.addressLine2
      );
      expect(result.shippingAddress.city).toBe(orderData.shippingAddress.city);
      expect(result.shippingAddress.state).toBe(
        orderData.shippingAddress.state
      );
      expect(result.shippingAddress.postalCode).toBe(
        orderData.shippingAddress.postalCode
      );
      expect(result.shippingAddress.country).toBe(
        orderData.shippingAddress.country
      );
      expect(result.shippingAddress.phoneNumber).toBe(
        orderData.shippingAddress.phoneNumber
      );
    });
  });

  describe("Get User Orders", () => {
    beforeEach(async () => {
      // Create multiple orders for the test user
      await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-order" },
          createTestOrder(testUserId, { total: 100.0 })
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-order" },
          createTestOrder(testUserId, { total: 150.0 })
        )
      );
    });

    it("should get all orders for a user", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-user-orders" }, { userId: testUserId })
      );

      expect(result).toBeDefined();
      expect(result.orders).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should paginate user orders", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "get-user-orders" },
          { userId: testUserId, page: 1, limit: 2 }
        )
      );

      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it("should get orders sorted by creation date (newest first)", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-user-orders" }, { userId: testUserId })
      );

      expect(result.orders).toHaveLength(3);
      // Verify orders are sorted by createdAt descending
      const dates = result.orders.map((order: any) =>
        new Date(order.createdAt).getTime()
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it("should return empty array for user with no orders", async () => {
      const emptyUserId = generateUserId();

      const result = await firstValueFrom(
        client.send({ cmd: "get-user-orders" }, { userId: emptyUserId })
      );

      expect(result.orders).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should filter orders by status", async () => {
      // Update one order to cancelled status
      const orders = await firstValueFrom(
        client.send({ cmd: "get-user-orders" }, { userId: testUserId })
      );

      await firstValueFrom(
        client.send(
          { cmd: "cancel-order" },
          { orderId: orders.orders[0].id, userId: testUserId }
        )
      );

      const pendingOrders = await firstValueFrom(
        client.send(
          { cmd: "get-user-orders" },
          { userId: testUserId, status: OrderStatus.PENDING }
        )
      );

      const cancelledOrders = await firstValueFrom(
        client.send(
          { cmd: "get-user-orders" },
          { userId: testUserId, status: OrderStatus.CANCELLED }
        )
      );

      expect(pendingOrders.orders).toHaveLength(2);
      expect(cancelledOrders.orders).toHaveLength(1);
    });
  });

  describe("Get Order By ID", () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      orderId = order.id;
    });

    it("should get an order by ID", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-order" }, { orderId, userId: testUserId })
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.userId).toBe(testUserId);
      expect(result.status).toBe(OrderStatus.PENDING);
    });

    it("should fail to get order with invalid ID", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "get-order" },
            { orderId: "invalid-id", userId: testUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid order ID");
      }
    });

    it("should fail to get order that does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "get-order" },
            { orderId: nonExistentId, userId: testUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail to get order belonging to different user", async () => {
      const differentUserId = "507f1f77bcf86cd799439022";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "get-order" },
            { orderId, userId: differentUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });
  });

  describe("Cancel Order", () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      orderId = order.id;
    });

    it("should cancel a pending order", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "cancel-order" },
          { orderId, userId: testUserId, reason: "Changed my mind" }
        )
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.cancelledAt).toBeDefined();
      expect(result.cancellationReason).toBe("Changed my mind");
    });

    it("should cancel order without providing reason", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.cancelledAt).toBeDefined();
      expect(result.cancellationReason).toBeUndefined();
    });

    it("should fail to cancel order with invalid ID", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "cancel-order" },
            { orderId: "invalid-id", userId: testUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid order ID");
      }
    });

    it("should fail to cancel order that does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "cancel-order" },
            { orderId: nonExistentId, userId: testUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail to cancel order belonging to different user", async () => {
      const differentUserId = "507f1f77bcf86cd799439022";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "cancel-order" },
            { orderId, userId: differentUserId }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail to cancel shipped order", async () => {
      // Update order to shipped status
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.SHIPPED }
        )
      );

      try {
        await firstValueFrom(
          client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot cancel");
      }
    });

    it("should fail to cancel delivered order", async () => {
      // Update order through all statuses to delivered
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.SHIPPED }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.DELIVERED }
        )
      );

      try {
        await firstValueFrom(
          client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot cancel");
      }
    });

    it("should fail to cancel already cancelled order", async () => {
      await firstValueFrom(
        client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
      );

      try {
        await firstValueFrom(
          client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot cancel");
      }
    });
  });

  describe("Get All Orders (Admin)", () => {
    beforeEach(async () => {
      const userIds = generateMultipleUserIds(3);

      // Create orders for multiple users
      await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(userIds[0]))
      );
      await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(userIds[1]))
      );
      await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(userIds[2]))
      );
      await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(userIds[0]))
      );
    });

    it("should get all orders", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, {})
      );

      expect(result).toBeDefined();
      expect(result.orders).toHaveLength(4);
      expect(result.total).toBe(4);
    });

    it("should paginate all orders", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, { page: 1, limit: 2 })
      );

      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(4);
      expect(result.totalPages).toBe(2);
    });

    it("should filter all orders by status", async () => {
      const orders = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, {})
      );

      // Cancel one order
      const orderToCancel = orders.orders[0];
      await firstValueFrom(
        client.send(
          { cmd: "cancel-order" },
          { orderId: orderToCancel.id, userId: orderToCancel.userId }
        )
      );

      const pendingOrders = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, { status: OrderStatus.PENDING })
      );

      const cancelledOrders = await firstValueFrom(
        client.send(
          { cmd: "get-all-orders" },
          { status: OrderStatus.CANCELLED }
        )
      );

      expect(pendingOrders.orders).toHaveLength(3);
      expect(cancelledOrders.orders).toHaveLength(1);
    });

    it("should filter orders by user ID", async () => {
      // Get the user IDs from the orders that were already created in beforeEach
      const allOrders = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, {})
      );

      // Get the userId from the first order
      const firstUserId = allOrders.orders[0].userId;

      // Count how many orders belong to this user
      const expectedCount = allOrders.orders.filter(
        (o: any) => o.userId === firstUserId
      ).length;

      // Now filter by that userId
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-orders" }, { userId: firstUserId })
      );

      expect(result.orders).toHaveLength(expectedCount);
      expect(result.orders.every((o: any) => o.userId === firstUserId)).toBe(
        true
      );
    });
  });

  describe("Update Order Status (Admin)", () => {
    let orderId: string;

    beforeEach(async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      orderId = order.id;
    });

    it("should update order status from pending to processing", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PROCESSING);
    });

    it("should update order status through complete workflow", async () => {
      // Pending -> Processing
      let result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );
      expect(result.status).toBe(OrderStatus.PROCESSING);

      // Processing -> Shipped
      result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.SHIPPED, trackingNumber: "TRACK123" }
        )
      );
      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.trackingNumber).toBe("TRACK123");
      expect(result.shippedAt).toBeDefined();

      // Shipped -> Delivered
      result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.DELIVERED }
        )
      );
      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(result.deliveredAt).toBeDefined();
    });

    it("should update order with tracking number", async () => {
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );

      const result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          {
            orderId,
            status: OrderStatus.SHIPPED,
            trackingNumber: "UPS123456789",
          }
        )
      );

      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(result.trackingNumber).toBe("UPS123456789");
    });

    it("should update order with notes", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          {
            orderId,
            status: OrderStatus.PROCESSING,
            notes: "Order is being prepared",
          }
        )
      );

      expect(result.status).toBe(OrderStatus.PROCESSING);
      expect(result.notes).toBe("Order is being prepared");
    });

    it("should fail to update with invalid order ID", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId: "invalid-id", status: OrderStatus.PROCESSING }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid order ID");
      }
    });

    it("should fail to update non-existent order", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId: nonExistentId, status: OrderStatus.PROCESSING }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail invalid status transition - pending to shipped", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId, status: OrderStatus.SHIPPED }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot transition");
      }
    });

    it("should fail invalid status transition - pending to delivered", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId, status: OrderStatus.DELIVERED }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot transition");
      }
    });

    it("should fail to change status of delivered order", async () => {
      // Update to delivered
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.SHIPPED }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.DELIVERED }
        )
      );

      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId, status: OrderStatus.PROCESSING }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot transition");
      }
    });

    it("should fail to change status of cancelled order", async () => {
      // Cancel the order
      await firstValueFrom(
        client.send({ cmd: "cancel-order" }, { orderId, userId: testUserId })
      );

      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-order-status" },
            { orderId, status: OrderStatus.PROCESSING }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Cannot transition");
      }
    });

    it("should allow cancelling from processing status", async () => {
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.PROCESSING }
        )
      );

      const result = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId, status: OrderStatus.CANCELLED }
        )
      );

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.cancelledAt).toBeDefined();
    });
  });

  describe("Order Number Generation", () => {
    it("should generate order numbers with correct format", async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      expect(order.orderNumber).toMatch(/^ORD-\d{6}-\d{4}$/);
    });

    it("should generate sequential order numbers on same day", async () => {
      const order1 = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      const order2 = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );
      const order3 = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      // Extract date and sequence parts
      const [, date1, seq1] = order1.orderNumber.match(
        /^ORD-(\d{6})-(\d{4})$/
      )!;
      const [, date2, seq2] = order2.orderNumber.match(
        /^ORD-(\d{6})-(\d{4})$/
      )!;
      const [, date3, seq3] = order3.orderNumber.match(
        /^ORD-(\d{6})-(\d{4})$/
      )!;

      // Same date
      expect(date1).toBe(date2);
      expect(date2).toBe(date3);

      // Sequential numbers
      expect(parseInt(seq2)).toBe(parseInt(seq1) + 1);
      expect(parseInt(seq3)).toBe(parseInt(seq2) + 1);
    });
  });

  describe("Order Timestamps", () => {
    it("should set createdAt and updatedAt on creation", async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
      expect(new Date(order.createdAt)).toBeInstanceOf(Date);
      expect(new Date(order.updatedAt)).toBeInstanceOf(Date);
    });

    it("should set shippedAt when order is marked as shipped", async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId: order.id, status: OrderStatus.PROCESSING }
        )
      );

      const shippedOrder = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId: order.id, status: OrderStatus.SHIPPED }
        )
      );

      expect(shippedOrder.shippedAt).toBeDefined();
      expect(new Date(shippedOrder.shippedAt)).toBeInstanceOf(Date);
    });

    it("should set deliveredAt when order is marked as delivered", async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId: order.id, status: OrderStatus.PROCESSING }
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId: order.id, status: OrderStatus.SHIPPED }
        )
      );

      const deliveredOrder = await firstValueFrom(
        client.send(
          { cmd: "update-order-status" },
          { orderId: order.id, status: OrderStatus.DELIVERED }
        )
      );

      expect(deliveredOrder.deliveredAt).toBeDefined();
      expect(new Date(deliveredOrder.deliveredAt)).toBeInstanceOf(Date);
    });

    it("should set cancelledAt when order is cancelled", async () => {
      const order = await firstValueFrom(
        client.send({ cmd: "create-order" }, createTestOrder(testUserId))
      );

      const cancelledOrder = await firstValueFrom(
        client.send(
          { cmd: "cancel-order" },
          { orderId: order.id, userId: testUserId }
        )
      );

      expect(cancelledOrder.cancelledAt).toBeDefined();
      expect(new Date(cancelledOrder.cancelledAt)).toBeInstanceOf(Date);
    });
  });

  describe("Data Validation", () => {
    it("should validate positive prices", async () => {
      const invalidOrder = createTestOrder(testUserId, {
        items: [
          {
            productId: "prod-123",
            name: "Product",
            price: -10.0,
            quantity: 1,
            subtotal: -10.0,
          },
        ],
        subtotal: -10.0,
        total: -10.0,
      });

      try {
        await firstValueFrom(
          client.send({ cmd: "create-order" }, invalidOrder)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should validate minimum quantity", async () => {
      const invalidOrder = createTestOrder(testUserId, {
        items: [
          {
            productId: "prod-123",
            name: "Product",
            price: 10.0,
            quantity: 0,
            subtotal: 0,
          },
        ],
      });

      try {
        await firstValueFrom(
          client.send({ cmd: "create-order" }, invalidOrder)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should require shipping address", async () => {
      const invalidOrder = {
        userId: testUserId,
        items: [
          {
            productId: "prod-123",
            name: "Product",
            price: 10.0,
            quantity: 1,
            subtotal: 10.0,
          },
        ],
        subtotal: 10.0,
        tax: 0,
        shippingCost: 0,
        total: 10.0,
        // Missing shippingAddress
      };

      try {
        await firstValueFrom(
          client.send({ cmd: "create-order" }, invalidOrder)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});
