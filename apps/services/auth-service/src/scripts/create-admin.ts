import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { AuthService } from "../auth/auth.service";
import { UserRole } from "../entities/user.entity";

async function createAdminUser() {
  console.log("Creating admin user...");

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  // Admin user details - change these as needed
  const adminData = {
    email: "admin@example.com",
    password: "Admin123456",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
  };

  try {
    const result = await authService.register(adminData);
    console.log("✅ Admin user created successfully!");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
    console.log("Role:", adminData.role);
    console.log("\nUser ID:", result.user.id);
  } catch (error) {
    if (error.message?.includes("duplicate key error")) {
      console.log("⚠️  User with this email already exists");
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
  }

  await app.close();
}

createAdminUser();
