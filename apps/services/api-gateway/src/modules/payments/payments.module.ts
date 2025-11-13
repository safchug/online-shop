import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PaymentsController } from "./payments.controller";
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
        name: MICROSERVICES.PAYMENT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.PAYMENT_SERVICE].host,
          port: config[MICROSERVICES.PAYMENT_SERVICE].port,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
