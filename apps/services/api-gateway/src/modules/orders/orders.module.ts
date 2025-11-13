import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { OrdersController } from "./orders.controller";
import {
  MICROSERVICES,
  getMicroserviceConfig,
} from "../../config/microservices.config";
import { AuthModule } from "../auth/auth.module";

const config = getMicroserviceConfig();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.ORDER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.ORDER_SERVICE].host,
          port: config[MICROSERVICES.ORDER_SERVICE].port,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
