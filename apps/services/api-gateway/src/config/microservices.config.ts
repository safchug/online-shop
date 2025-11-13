export const MICROSERVICES = {
  AUTH_SERVICE: "AUTH_SERVICE",
  USER_SERVICE: "USER_SERVICE",
  PRODUCT_SERVICE: "PRODUCT_SERVICE",
  ORDER_SERVICE: "ORDER_SERVICE",
  PAYMENT_SERVICE: "PAYMENT_SERVICE",
  NOTIFICATION_SERVICE: "NOTIFICATION_SERVICE",
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
    port: parseInt(process.env.AUTH_SERVICE_PORT || "3001", 10),
  },
  [MICROSERVICES.USER_SERVICE]: {
    name: MICROSERVICES.USER_SERVICE,
    host: process.env.USER_SERVICE_HOST || "localhost",
    port: parseInt(process.env.USER_SERVICE_PORT || "3002", 10),
  },
  [MICROSERVICES.PRODUCT_SERVICE]: {
    name: MICROSERVICES.PRODUCT_SERVICE,
    host: process.env.PRODUCT_SERVICE_HOST || "localhost",
    port: parseInt(process.env.PRODUCT_SERVICE_PORT || "3003", 10),
  },
  [MICROSERVICES.ORDER_SERVICE]: {
    name: MICROSERVICES.ORDER_SERVICE,
    host: process.env.ORDER_SERVICE_HOST || "localhost",
    port: parseInt(process.env.ORDER_SERVICE_PORT || "3004", 10),
  },
  [MICROSERVICES.PAYMENT_SERVICE]: {
    name: MICROSERVICES.PAYMENT_SERVICE,
    host: process.env.PAYMENT_SERVICE_HOST || "localhost",
    port: parseInt(process.env.PAYMENT_SERVICE_PORT || "3005", 10),
  },
  [MICROSERVICES.NOTIFICATION_SERVICE]: {
    name: MICROSERVICES.NOTIFICATION_SERVICE,
    host: process.env.NOTIFICATION_SERVICE_HOST || "localhost",
    port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || "3006", 10),
  },
});
