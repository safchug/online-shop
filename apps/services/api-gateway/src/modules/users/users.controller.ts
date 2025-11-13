import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { MICROSERVICES } from "../../config/microservices.config";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    @Inject(MICROSERVICES.USER_SERVICE)
    private readonly userService: ClientProxy
  ) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  async getProfile(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.userService.send({ cmd: "get-user" }, { userId: user.userId })
    );
  }

  @Put("profile")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
    return await firstValueFrom(
      this.userService.send(
        { cmd: "update-user" },
        { userId: user.userId, ...updateData }
      )
    );
  }

  @Delete("profile")
  @ApiOperation({ summary: "Delete current user account" })
  @ApiResponse({ status: 200, description: "Account deleted successfully" })
  async deleteAccount(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.userService.send({ cmd: "delete-user" }, { userId: user.userId })
    );
  }

  @Get(":id")
  @Roles("admin", "super_admin")
  @ApiOperation({ summary: "Get user by ID (Admin only)" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  async getUserById(@Param("id") id: string) {
    return await firstValueFrom(
      this.userService.send({ cmd: "get-user" }, { userId: id })
    );
  }

  @Get()
  @Roles("admin", "super_admin")
  @ApiOperation({ summary: "Get all users (Admin only)" })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async getAllUsers() {
    return await firstValueFrom(
      this.userService.send({ cmd: "get-all-users" }, {})
    );
  }
}
