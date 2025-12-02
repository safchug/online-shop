import {
  Controller,
  Get,
  Post,
  Put,
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

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    @Inject(MICROSERVICES.ORDER_SERVICE)
    private readonly orderService: ClientProxy
  ) {}

  @Post()
  @ApiOperation({ summary: "Create new order" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  async createOrder(@CurrentUser() user: any, @Body() orderData: any) {
    const payload = { userId: user.userId, ...orderData };
    return await firstValueFrom(
      this.orderService.send({ cmd: "create-order" }, payload)
    );
  }

  @Get()
  @ApiOperation({ summary: "Get current user orders" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully" })
  async getUserOrders(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.orderService.send(
        { cmd: "get-user-orders" },
        { userId: user.userId }
      )
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get order by ID" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  async getOrderById(@CurrentUser() user: any, @Param("id") id: string) {
    return await firstValueFrom(
      this.orderService.send(
        { cmd: "get-order" },
        { orderId: id, userId: user.userId }
      )
    );
  }

  @Put(":id/cancel")
  @ApiOperation({ summary: "Cancel order" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  async cancelOrder(@CurrentUser() user: any, @Param("id") id: string) {
    return await firstValueFrom(
      this.orderService.send(
        { cmd: "cancel-order" },
        { orderId: id, userId: user.userId }
      )
    );
  }

  @Get("all")
  @Roles("admin", "super_admin")
  @ApiOperation({ summary: "Get all orders (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "All orders retrieved successfully",
  })
  async getAllOrders() {
    return await firstValueFrom(
      this.orderService.send({ cmd: "get-all-orders" }, {})
    );
  }

  @Put(":id/status")
  @Roles("admin", "super_admin")
  @ApiOperation({ summary: "Update order status (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Order status updated successfully",
  })
  async updateOrderStatus(
    @Param("id") id: string,
    @Body() statusData: { status: string }
  ) {
    return await firstValueFrom(
      this.orderService.send(
        { cmd: "update-order-status" },
        { orderId: id, ...statusData }
      )
    );
  }
}
