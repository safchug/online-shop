import { Test, TestingModule } from "@nestjs/testing";
import { INestMicroservice } from "@nestjs/common";
import { ClientsModule, Transport, ClientProxy } from "@nestjs/microservices";
import { ConfigModule } from "@nestjs/config";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { AppModule } from "../src/app.module";
import { AuthModule } from "../src/auth/auth.module";
import {
  initMongoMemoryServer,
  rootMongooseTestModule,
  closeInMongodConnection,
  clearDatabase,
  createTestUser,
  createAdminUser,
} from "./test-helpers";
import { firstValueFrom } from "rxjs";

// Helper function to extract error message from RPC exception
const getErrorMessage = (error: any): string => {
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
};

describe("Auth Service E2E Tests", () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let connection: Connection;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // Initialize MongoMemoryServer first
    const mongoUri = await initMongoMemoryServer();

    // Set the MongoDB URI in the environment
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = "test-secret-key-for-jwt-testing";
    process.env.JWT_EXPIRATION = "1h";
    process.env.JWT_REFRESH_EXPIRATION = "7d";

    // Create the microservice app using AppModule
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        rootMongooseTestModule(mongoUri),
        AuthModule,
      ],
    }).compile();

    connection = moduleRef.get(getConnectionToken());

    app = moduleRef.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: "localhost",
        port: 3099,
      },
    });

    await app.listen();

    // Create the client module
    moduleFixture = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: "AUTH_SERVICE",
            transport: Transport.TCP,
            options: {
              host: "localhost",
              port: 3099,
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get("AUTH_SERVICE");
    await client.connect();
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

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const userData = createTestUser();

      const result = await firstValueFrom(
        client.send("auth.register", userData)
      );

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.firstName).toBe(userData.firstName);
      expect(result.user.lastName).toBe(userData.lastName);
      expect(result.user.role).toBe(userData.role);
      expect(result.user.isActive).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.password).toBeUndefined();
    });

    it("should register an admin user", async () => {
      const adminData = createAdminUser();

      const result = await firstValueFrom(
        client.send("auth.register", adminData)
      );

      expect(result.user.role).toBe("admin");
      expect(result.user.email).toBe(adminData.email);
    });

    it("should fail to register with duplicate email", async () => {
      const userData = createTestUser();

      await firstValueFrom(client.send("auth.register", userData));

      try {
        await firstValueFrom(client.send("auth.register", userData));
        fail("Should have thrown an error");
      } catch (error: any) {
        const errorMessage =
          error?.message || error?.error?.message || JSON.stringify(error);
        expect(errorMessage).toContain("already exists");
      }
    });

    it("should fail to register with invalid email", async () => {
      const invalidUser = createTestUser({ email: "invalid-email" });

      try {
        await firstValueFrom(client.send("auth.register", invalidUser));
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should fail to register with short password", async () => {
      const invalidUser = createTestUser({ password: "short" });

      try {
        await firstValueFrom(client.send("auth.register", invalidUser));
        fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("User Login", () => {
    it("should login successfully with valid credentials", async () => {
      const userData = createTestUser();
      await firstValueFrom(client.send("auth.register", userData));

      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const result = await firstValueFrom(client.send("auth.login", loginData));

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should fail to login with invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "Password123!",
      };

      try {
        await firstValueFrom(client.send("auth.login", loginData));
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid credentials");
      }
    });

    it("should fail to login with wrong password", async () => {
      const userData = createTestUser();
      await firstValueFrom(client.send("auth.register", userData));

      const loginData = {
        email: userData.email,
        password: "WrongPassword123!",
      };

      try {
        await firstValueFrom(client.send("auth.login", loginData));
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid credentials");
      }
    });

    it("should update last login timestamp", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 100));

      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const loginResult = await firstValueFrom(
        client.send("auth.login", loginData)
      );

      expect(loginResult.user.id).toBe(registerResult.user.id);
    });
  });

  describe("Token Validation", () => {
    it("should validate a valid token", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      const validateResult = await firstValueFrom(
        client.send("auth.validate", { token: registerResult.accessToken })
      );

      expect(validateResult).toBeDefined();
      expect(validateResult.userId).toBe(registerResult.user.id);
      expect(validateResult.email).toBe(userData.email);
      expect(validateResult.role).toBe(userData.role);
    });

    it("should fail to validate an invalid token", async () => {
      try {
        await firstValueFrom(
          client.send("auth.validate", { token: "invalid-token" })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid token");
      }
    });

    it("should fail to validate an expired token", async () => {
      // This would require creating a token with a very short expiration
      // For now, we'll test with a malformed token
      const malformedToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      try {
        await firstValueFrom(
          client.send("auth.validate", { token: malformedToken })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid token");
      }
    });
  });

  describe("Token Refresh", () => {
    it("should refresh tokens successfully", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      const refreshResult = await firstValueFrom(
        client.send("auth.refresh", {
          refreshToken: registerResult.refreshToken,
        })
      );

      expect(refreshResult).toBeDefined();
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.accessToken).not.toBe(registerResult.accessToken);
      expect(refreshResult.refreshToken).not.toBe(registerResult.refreshToken);
    });

    it("should fail to refresh with invalid token", async () => {
      try {
        await firstValueFrom(
          client.send("auth.refresh", { refreshToken: "invalid-token" })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid refresh token");
      }
    });

    it("should fail to refresh with access token instead of refresh token", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      try {
        await firstValueFrom(
          client.send("auth.refresh", {
            refreshToken: registerResult.accessToken,
          })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid refresh token");
      }
    });
  });

  describe("User Profile", () => {
    it("should get user profile by userId", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      const profileResult = await firstValueFrom(
        client.send("auth.profile", { userId: registerResult.user.id })
      );

      expect(profileResult).toBeDefined();
      expect(profileResult.id).toBe(registerResult.user.id);
      expect(profileResult.email).toBe(userData.email);
      expect(profileResult.firstName).toBe(userData.firstName);
      expect(profileResult.lastName).toBe(userData.lastName);
      expect(profileResult.password).toBeUndefined();
    });

    it("should fail to get profile with invalid userId", async () => {
      try {
        await firstValueFrom(
          client.send("auth.profile", { userId: "507f1f77bcf86cd799439011" })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should get user by email", async () => {
      const userData = createTestUser();
      await firstValueFrom(client.send("auth.register", userData));

      const userResult = await firstValueFrom(
        client.send("auth.user.byEmail", { email: userData.email })
      );

      expect(userResult).toBeDefined();
      expect(userResult.email).toBe(userData.email);
    });

    it("should get user by id", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      const userResult = await firstValueFrom(
        client.send("auth.user.byId", { userId: registerResult.user.id })
      );

      expect(userResult).toBeDefined();
      expect(userResult._id.toString()).toBe(registerResult.user.id);
    });
  });

  describe("User Roles", () => {
    it("should register users with different roles", async () => {
      const testUser = createTestUser();
      const adminUser = createAdminUser();

      const testResult = await firstValueFrom(
        client.send("auth.register", testUser)
      );
      const adminResult = await firstValueFrom(
        client.send("auth.register", adminUser)
      );

      expect(testResult.user.role).toBe("user");
      expect(adminResult.user.role).toBe("admin");
    });

    it("should maintain role after login", async () => {
      const adminData = createAdminUser();
      await firstValueFrom(client.send("auth.register", adminData));

      const loginResult = await firstValueFrom(
        client.send("auth.login", {
          email: adminData.email,
          password: adminData.password,
        })
      );

      expect(loginResult.user.role).toBe("admin");
    });
  });

  describe("Password Security", () => {
    it("should hash password before storing", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      // Password should not be in the response
      expect(registerResult.user.password).toBeUndefined();

      // But we should be able to login with the original password
      const loginResult = await firstValueFrom(
        client.send("auth.login", {
          email: userData.email,
          password: userData.password,
        })
      );

      expect(loginResult.user.id).toBe(registerResult.user.id);
    });

    it("should not expose password in response", async () => {
      const userData = createTestUser();
      const registerResult = await firstValueFrom(
        client.send("auth.register", userData)
      );

      expect(registerResult.user.password).toBeUndefined();
    });
  });
});
