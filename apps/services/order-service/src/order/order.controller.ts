import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OrderService } from "./order.service";
import {
  CreateOrderDto,
  GetUserOrdersDto,
  GetOrderDto,
  CancelOrderDto,
  UpdateOrderStatusDto,
  GetAllOrdersDto,
} from "./dto";

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: "create-order" })
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    console.log(
      "Received create-order request:",
      JSON.stringify(createOrderDto, null, 2)
    );
    return this.orderService.createOrder(createOrderDto);
  }

  @MessagePattern({ cmd: "get-user-orders" })
  async getUserOrders(@Payload() getUserOrdersDto: GetUserOrdersDto) {
    return this.orderService.getUserOrders(getUserOrdersDto);
  }

  @MessagePattern({ cmd: "get-order" })
  async getOrderById(@Payload() getOrderDto: GetOrderDto) {
    return this.orderService.getOrderById(getOrderDto);
  }

  @MessagePattern({ cmd: "cancel-order" })
  async cancelOrder(@Payload() cancelOrderDto: CancelOrderDto) {
    return this.orderService.cancelOrder(cancelOrderDto);
  }

  @MessagePattern({ cmd: "get-all-orders" })
  async getAllOrders(@Payload() getAllOrdersDto: GetAllOrdersDto) {
    return this.orderService.getAllOrders(getAllOrdersDto);
  }

  @MessagePattern({ cmd: "update-order-status" })
  async updateOrderStatus(
    @Payload() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateOrderStatus(updateOrderStatusDto);
  }
}
