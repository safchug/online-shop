import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { MICROSERVICES } from "../../config/microservices.config";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICES.AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>("AUTH_SERVICE_HOST", "localhost"),
            port: configService.get<number>("AUTH_SERVICE_PORT", 4001),
          },
        }),
        inject: [ConfigService],
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
