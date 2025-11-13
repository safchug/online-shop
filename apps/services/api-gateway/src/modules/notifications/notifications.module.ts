import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { NotificationsController } from "./notifications.controller";
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
        name: MICROSERVICES.NOTIFICATION_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.NOTIFICATION_SERVICE].host,
          port: config[MICROSERVICES.NOTIFICATION_SERVICE].port,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
