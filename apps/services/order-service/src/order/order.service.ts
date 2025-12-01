import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order, OrderDocument, OrderStatus } from "../entities/order.entity";
import {
  CreateOrderDto,
  GetUserOrdersDto,
  GetOrderDto,
  CancelOrderDto,
  UpdateOrderStatusDto,
  GetAllOrdersDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from "./dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create the order
    const order = new this.orderModel({
      userId: new Types.ObjectId(createOrderDto.userId),
      orderNumber,
      items: createOrderDto.items,
      subtotal: createOrderDto.subtotal,
      tax: createOrderDto.tax,
      shippingCost: createOrderDto.shippingCost,
      total: createOrderDto.total,
      shippingAddress: createOrderDto.shippingAddress,
      paymentId: createOrderDto.paymentId,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    await order.save();

    return this.formatOrderResponse(order);
  }

  async getUserOrders(
    getUserOrdersDto: GetUserOrdersDto
  ): Promise<PaginatedOrdersResponseDto> {
    const { userId, status, page = 1, limit = 10 } = getUserOrdersDto;

    const query: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(getOrderDto: GetOrderDto): Promise<OrderResponseDto> {
    const { orderId, userId } = getOrderDto;

    if (!Types.ObjectId.isValid(orderId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid order ID",
      });
    }

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: "Order not found",
      });
    }

    return this.formatOrderResponse(order);
  }

  async cancelOrder(cancelOrderDto: CancelOrderDto): Promise<OrderResponseDto> {
    const { orderId, userId, reason } = cancelOrderDto;

    if (!Types.ObjectId.isValid(orderId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid order ID",
      });
    }

    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();

    return this.formatOrderResponse(order);
  }

  async getAllOrders(
    getAllOrdersDto: GetAllOrdersDto
  ): Promise<PaginatedOrdersResponseDto> {
    const { status, page = 1, limit = 10, userId } = getAllOrdersDto;

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(
    updateOrderStatusDto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    const { orderId, status, trackingNumber, notes } = updateOrderStatusDto;

    if (!Types.ObjectId.isValid(orderId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid order ID",
      });
    }

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: "Order not found",
      });
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Update order
    order.status = status;

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    // Update timestamps based on status
    if (status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    if (status === OrderStatus.CANCELLED && !order.cancelledAt) {
      order.cancelledAt = new Date();
    }

    await order.save();

    return this.formatOrderResponse(order);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    // Define valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      });
    }
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Get count of orders today for sequence number
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const todayOrdersCount = await this.orderModel.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const sequence = (todayOrdersCount + 1).toString().padStart(4, "0");

    return `ORD-${year}${month}${day}-${sequence}`;
  }

  private formatOrderResponse(order: OrderDocument): OrderResponseDto {
    return {
      id: order._id.toString(),
      userId: order.userId.toString(),
      orderNumber: order.orderNumber,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentId: order.paymentId,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
