import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Connection } from "mongoose";
import { ProductCategory } from "../src/entities/product.entity";

let mongod: MongoMemoryServer | undefined;
let mongoUri: string | undefined;

export const initMongoMemoryServer = async () => {
  if (!mongod) {
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
  }
  return mongoUri!;
};

export const rootMongooseTestModule = (uri: string) =>
  MongooseModule.forRoot(uri);

export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};

export const clearDatabase = async (connection: Connection) => {
  const collections = connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

export const generateProductSKU = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `SKU-${timestamp}-${randomPart}`.toUpperCase();
};

export const generateVendorId = () => {
  // Generate a unique MongoDB ObjectId-like string
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomPart = Math.random().toString(16).substring(2, 18);
  return (timestamp + randomPart).padEnd(24, "0").substring(0, 24);
};

export const createTestProduct = (overrides?: any) => ({
  name: "Test Product",
  description: "This is a test product with detailed description",
  sku: generateProductSKU(),
  price: 99.99,
  compareAtPrice: 129.99,
  stock: 100,
  category: ProductCategory.ELECTRONICS,
  tags: ["test", "electronics", "gadget"],
  brand: "TestBrand",
  isActive: true,
  isFeatured: false,
  ...overrides,
});

export const createMinimalProduct = () => ({
  name: "Minimal Product",
  description: "Minimal product description",
  sku: generateProductSKU(),
  price: 19.99,
  stock: 50,
  category: ProductCategory.OTHER,
});

export const createFeaturedProduct = (overrides?: any) => ({
  name: "Featured Product",
  description: "This is a featured product",
  sku: generateProductSKU(),
  price: 149.99,
  compareAtPrice: 199.99,
  stock: 25,
  category: ProductCategory.ELECTRONICS,
  tags: ["featured", "special", "bestseller"],
  brand: "PremiumBrand",
  isActive: true,
  isFeatured: true,
  ...overrides,
});

export const createProductWithImages = (overrides?: any) => ({
  name: "Product with Images",
  description: "Product with multiple images",
  sku: generateProductSKU(),
  price: 79.99,
  stock: 75,
  category: ProductCategory.ELECTRONICS,
  images: [
    {
      url: "https://example.com/image1.jpg",
      alt: "Primary product image",
      isPrimary: true,
    },
    {
      url: "https://example.com/image2.jpg",
      alt: "Secondary product image",
      isPrimary: false,
    },
    {
      url: "https://example.com/image3.jpg",
      alt: "Third product image",
      isPrimary: false,
    },
  ],
  ...overrides,
});

export const createProductWithDimensions = (overrides?: any) => ({
  name: "Product with Dimensions",
  description: "Product with physical dimensions",
  sku: generateProductSKU(),
  price: 59.99,
  stock: 200,
  category: ProductCategory.HOME,
  dimensions: {
    length: 30,
    width: 20,
    height: 10,
    weight: 2.5,
    unit: "cm",
  },
  ...overrides,
});

export const createProductWithMetadata = (overrides?: any) => ({
  name: "Product with Metadata",
  description: "Product with custom metadata",
  sku: generateProductSKU(),
  price: 39.99,
  stock: 150,
  category: ProductCategory.CLOTHING,
  metadata: {
    color: "blue",
    size: "medium",
    material: "cotton",
    madeIn: "USA",
  },
  ...overrides,
});

export const createElectronicsProduct = (overrides?: any) =>
  createTestProduct({
    category: ProductCategory.ELECTRONICS,
    tags: ["electronics", "tech", "gadget"],
    ...overrides,
  });

export const createClothingProduct = (overrides?: any) =>
  createTestProduct({
    category: ProductCategory.CLOTHING,
    tags: ["clothing", "fashion", "apparel"],
    ...overrides,
  });

export const createBooksProduct = (overrides?: any) =>
  createTestProduct({
    category: ProductCategory.BOOKS,
    tags: ["books", "reading", "literature"],
    ...overrides,
  });

export const createHomeProduct = (overrides?: any) =>
  createTestProduct({
    category: ProductCategory.HOME,
    tags: ["home", "decor", "furniture"],
    ...overrides,
  });

export const createSportsProduct = (overrides?: any) =>
  createTestProduct({
    category: ProductCategory.SPORTS,
    tags: ["sports", "fitness", "athletic"],
    ...overrides,
  });
