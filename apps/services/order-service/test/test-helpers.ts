import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";
import { OrderStatus } from "../src/entities/order.entity";

let mongod: MongoMemoryServer | undefined;
let mongoUri: string | undefined;

export const initMongoMemoryServer = async () => {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
  }
  return mongoUri!;
};

export const rootMongooseTestModule = (uri: string) =>
  MongooseModule.forRoot(uri);

export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};

export const clearDatabase = async (connection: Connection) => {
  const collections = connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export const createTestOrder = (userId: string, overrides?: any) => ({
  userId,
  items: [
    {
      productId: "prod-123",
      name: "Test Product",
      price: 29.99,
      quantity: 2,
      subtotal: 59.98,
    },
  ],
  subtotal: 59.98,
  tax: 5.4,
  shippingCost: 10.0,
  total: 75.38,
  shippingAddress: {
    fullName: "John Doe",
    addressLine1: "123 Main St",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    phoneNumber: "+1234567890",
  },
  paymentId: "pay-123",
  notes: "Test order notes",
  ...overrides,
});

export const createMultiItemOrder = (userId: string, overrides?: any) => ({
  userId,
  items: [
    {
      productId: "prod-123",
      name: "Product One",
      price: 29.99,
      quantity: 1,
      subtotal: 29.99,
    },
    {
      productId: "prod-456",
      name: "Product Two",
      price: 49.99,
      quantity: 2,
      subtotal: 99.98,
    },
    {
      productId: "prod-789",
      name: "Product Three",
      price: 19.99,
      quantity: 3,
      subtotal: 59.97,
    },
  ],
  subtotal: 189.94,
  tax: 17.09,
  shippingCost: 15.0,
  total: 222.03,
  shippingAddress: {
    fullName: "Jane Smith",
    addressLine1: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    postalCode: "90001",
    country: "USA",
    phoneNumber: "+1987654321",
  },
  ...overrides,
});

export const createMinimalOrder = (userId: string) => ({
  userId,
  items: [
    {
      productId: "prod-minimal",
      name: "Minimal Product",
      price: 9.99,
      quantity: 1,
      subtotal: 9.99,
    },
  ],
  subtotal: 9.99,
  tax: 0,
  shippingCost: 0,
  total: 9.99,
  shippingAddress: {
    fullName: "Test User",
    addressLine1: "123 Test St",
    city: "Test City",
    state: "TS",
    postalCode: "12345",
    country: "USA",
    phoneNumber: "+1111111111",
  },
});

export const generateUserId = () => {
  // Generate a unique MongoDB ObjectId-like string
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomPart = Math.random().toString(16).substring(2, 18);
  return (timestamp + randomPart).padEnd(24, "0").substring(0, 24);
};

export const generateMultipleUserIds = (count: number) => {
  const userIds: string[] = [];
  for (let i = 0; i < count; i++) {
    userIds.push(generateUserId());
  }
  return userIds;
};
