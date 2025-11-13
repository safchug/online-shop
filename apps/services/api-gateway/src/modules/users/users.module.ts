import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UsersController } from "./users.controller";
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
        name: MICROSERVICES.USER_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.USER_SERVICE].host,
          port: config[MICROSERVICES.USER_SERVICE].port,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
