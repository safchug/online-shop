import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { AuthService } from "../auth/auth.service";
import { UserRole } from "../entities/user.entity";

async function createAdminUser() {
  console.log("Creating admin user...");

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  // Admin user details - can be overridden via environment variables
  const adminData = {
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "Admin123456",
    firstName: process.env.ADMIN_FIRST_NAME || "Admin",
    lastName: process.env.ADMIN_LAST_NAME || "User",
    role: UserRole.ADMIN,
  };

  try {
    const result = await authService.register(adminData);
    console.log("✅ Admin user created successfully!");
    console.log("Email:", adminData.email);
    console.log("Password: ********");
    console.log("Role:", adminData.role);
    console.log("\nUser ID:", result?.user?.id || "N/A");
  } catch (error: any) {
    // Check for MongoDB duplicate key error (code 11000)
    if (
      error.code === 11000 ||
      error.message?.includes("duplicate key error")
    ) {
      console.log("⚠️  User with this email already exists");
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
  }

  await app.close();
}

createAdminUser();
