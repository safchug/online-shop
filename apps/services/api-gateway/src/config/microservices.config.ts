export const MICROSERVICES = {
  AUTH_SERVICE: "AUTH_SERVICE",
  USER_SERVICE: "USER_SERVICE",
  PRODUCT_SERVICE: "PRODUCT_SERVICE",
  ORDER_SERVICE: "ORDER_SERVICE",
  PAYMENT_SERVICE: "PAYMENT_SERVICE",
  NOTIFICATION_SERVICE: "NOTIFICATION_SERVICE",
} as const;

export const DEFAULT_MICROSERVICE_PORTS = {
  AUTH_SERVICE: 3001,
  USER_SERVICE: 3002,
  ORDER_SERVICE: 3003,
  PRODUCT_SERVICE: 3004,
  PAYMENT_SERVICE: 3005,
  NOTIFICATION_SERVICE: 3006,
} as const;

export interface MicroserviceConfig {
  name: string;
  host: string;
  port: number;
}

export const getMicroserviceConfig = (): Record<
  string,
  MicroserviceConfig
> => ({
  [MICROSERVICES.AUTH_SERVICE]: {
    name: MICROSERVICES.AUTH_SERVICE,
    host: process.env.AUTH_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.AUTH_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.AUTH_SERVICE),
      10
    ),
  },
  [MICROSERVICES.USER_SERVICE]: {
    name: MICROSERVICES.USER_SERVICE,
    host: process.env.USER_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.USER_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.USER_SERVICE),
      10
    ),
  },
  [MICROSERVICES.PRODUCT_SERVICE]: {
    name: MICROSERVICES.PRODUCT_SERVICE,
    host: process.env.PRODUCT_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.PRODUCT_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.PRODUCT_SERVICE),
      10
    ),
  },
  [MICROSERVICES.ORDER_SERVICE]: {
    name: MICROSERVICES.ORDER_SERVICE,
    host: process.env.ORDER_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.ORDER_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.ORDER_SERVICE),
      10
    ),
  },
  [MICROSERVICES.PAYMENT_SERVICE]: {
    name: MICROSERVICES.PAYMENT_SERVICE,
    host: process.env.PAYMENT_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.PAYMENT_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.PAYMENT_SERVICE),
      10
    ),
  },
  [MICROSERVICES.NOTIFICATION_SERVICE]: {
    name: MICROSERVICES.NOTIFICATION_SERVICE,
    host: process.env.NOTIFICATION_SERVICE_HOST || "localhost",
    port: parseInt(
      process.env.NOTIFICATION_SERVICE_PORT ||
        String(DEFAULT_MICROSERVICE_PORTS.NOTIFICATION_SERVICE),
      10
    ),
  },
});
