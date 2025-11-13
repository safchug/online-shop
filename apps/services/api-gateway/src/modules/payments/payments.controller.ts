import {
  Controller,
  Get,
  Post,
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

@ApiTags("Payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    @Inject(MICROSERVICES.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy
  ) {}

  @Post("process")
  @ApiOperation({ summary: "Process payment" })
  @ApiResponse({ status: 200, description: "Payment processed successfully" })
  async processPayment(@CurrentUser() user: any, @Body() paymentData: any) {
    return await firstValueFrom(
      this.paymentService.send(
        { cmd: "process-payment" },
        { userId: user.userId, ...paymentData }
      )
    );
  }

  @Get("methods")
  @ApiOperation({ summary: "Get user payment methods" })
  @ApiResponse({
    status: 200,
    description: "Payment methods retrieved successfully",
  })
  async getPaymentMethods(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.paymentService.send(
        { cmd: "get-payment-methods" },
        { userId: user.userId }
      )
    );
  }

  @Post("methods")
  @ApiOperation({ summary: "Add payment method" })
  @ApiResponse({
    status: 201,
    description: "Payment method added successfully",
  })
  async addPaymentMethod(@CurrentUser() user: any, @Body() methodData: any) {
    return await firstValueFrom(
      this.paymentService.send(
        { cmd: "add-payment-method" },
        { userId: user.userId, ...methodData }
      )
    );
  }

  @Get("history")
  @ApiOperation({ summary: "Get payment history" })
  @ApiResponse({
    status: 200,
    description: "Payment history retrieved successfully",
  })
  async getPaymentHistory(@CurrentUser() user: any) {
    return await firstValueFrom(
      this.paymentService.send(
        { cmd: "get-payment-history" },
        { userId: user.userId }
      )
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiResponse({ status: 200, description: "Payment retrieved successfully" })
  async getPaymentById(@CurrentUser() user: any, @Param("id") id: string) {
    return await firstValueFrom(
      this.paymentService.send(
        { cmd: "get-payment" },
        { paymentId: id, userId: user.userId }
      )
    );
  }

  @Post("refund")
  @Roles("admin", "super_admin")
  @ApiOperation({ summary: "Process refund (Admin only)" })
  @ApiResponse({ status: 200, description: "Refund processed successfully" })
  async processRefund(@Body() refundData: any) {
    return await firstValueFrom(
      this.paymentService.send({ cmd: "process-refund" }, refundData)
    );
  }
}
