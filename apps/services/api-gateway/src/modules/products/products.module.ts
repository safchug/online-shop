import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ProductsController } from "./products.controller";
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
        name: MICROSERVICES.PRODUCT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.PRODUCT_SERVICE].host,
          port: config[MICROSERVICES.PRODUCT_SERVICE].port,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
