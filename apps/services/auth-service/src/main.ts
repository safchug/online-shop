import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllRpcExceptionsFilter } from "./common/filters/rpc-exception.filter";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_SERVICE_HOST || "localhost",
        port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
      },
    }
  );

  app.useGlobalFilters(new AllRpcExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen();
  console.log(
    `Auth microservice is running on port ${process.env.AUTH_SERVICE_PORT || 3001}`
  );
}

bootstrap();
