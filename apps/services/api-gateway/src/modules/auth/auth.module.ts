import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import {
  MICROSERVICES,
  getMicroserviceConfig,
} from "../../config/microservices.config";
import { JwtStrategy } from "./strategies/jwt.strategy";

const config = getMicroserviceConfig();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: config[MICROSERVICES.AUTH_SERVICE].host,
          port: config[MICROSERVICES.AUTH_SERVICE].port,
        },
      },
    ]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
