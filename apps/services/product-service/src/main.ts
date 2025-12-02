import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AllRpcExceptionsFilter } from "./common/filters/rpc-exception.filter";

async function bootstrap() {
  const port = parseInt(process.env.PRODUCT_SERVICE_PORT, 10) || 3004;
  const host = process.env.PRODUCT_SERVICE_HOST || "localhost";

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
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
  console.log(`Product microservice is running on ${host}:${port}`);
}

bootstrap().catch((error) => {
  console.error("Failed to start the microservice:", error);
  process.exit(1);
});
