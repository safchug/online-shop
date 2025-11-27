import { Module, DynamicModule, Provider } from "@nestjs/common";
import {
  MongooseModule,
  getConnectionToken,
  getModelToken,
} from "@nestjs/mongoose";
import { ModuleRef } from "@nestjs/core";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";
import { UserRole } from "../src/entities/user.entity";

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
  MongooseModule.forRoot(uri, {
    directConnection: true,
  });

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

export const createTestUser = (overrides?: any) => ({
  email: "test@example.com",
  password: "Password123!",
  firstName: "Test",
  lastName: "User",
  role: UserRole.USER,
  ...overrides,
});

export const createAdminUser = (overrides?: any) => ({
  email: "admin@example.com",
  password: "AdminPass123!",
  firstName: "Admin",
  lastName: "User",
  role: UserRole.ADMIN,
  ...overrides,
});

export const createVendorUser = (overrides?: any) => ({
  email: "vendor@example.com",
  password: "VendorPass123!",
  firstName: "Vendor",
  lastName: "User",
  role: UserRole.VENDOR,
  ...overrides,
});
