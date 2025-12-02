import { Test, TestingModule } from "@nestjs/testing";
import { INestMicroservice } from "@nestjs/common";
import { ClientsModule, Transport, ClientProxy } from "@nestjs/microservices";
import { ConfigModule } from "@nestjs/config";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { firstValueFrom } from "rxjs";
import { ProductModule } from "../src/product/product.module";
import { ProductCategory } from "../src/entities/product.entity";
import {
  initMongoMemoryServer,
  rootMongooseTestModule,
  closeInMongodConnection,
  clearDatabase,
  createTestProduct,
  createFeaturedProduct,
  createMinimalProduct,
  createProductWithImages,
  createProductWithDimensions,
  generateProductSKU,
  generateVendorId,
} from "./test-helpers";

// Helper function to extract error message from RPC exception
const getErrorMessage = (error: any): string => {
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
};

describe("Product Service E2E Tests", () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let connection: Connection;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // Initialize MongoMemoryServer first
    const mongoUri = await initMongoMemoryServer();

    // Set the MongoDB URI in the environment
    process.env.MONGODB_URI = mongoUri;

    // Create the microservice app
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        rootMongooseTestModule(mongoUri),
        ProductModule,
      ],
    }).compile();

    connection = moduleRef.get(getConnectionToken());

    app = moduleRef.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: "localhost",
        port: 3099,
      },
    });

    await app.listen();

    // Create the client module
    moduleFixture = await Test.createTestingModule({
      imports: [
        ClientsModule.register([
          {
            name: "PRODUCT_SERVICE",
            transport: Transport.TCP,
            options: {
              host: "localhost",
              port: 3099,
            },
          },
        ]),
      ],
    }).compile();

    client = moduleFixture.get("PRODUCT_SERVICE");
    await client.connect();
  });

  afterAll(async () => {
    try {
      if (client) {
        await client.close();
      }
    } catch (error) {
      console.error("Error closing client:", error);
    }

    try {
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error("Error closing app:", error);
    }

    try {
      if (connection) {
        await connection.close();
      }
    } catch (error) {
      console.error("Error closing connection:", error);
    }

    try {
      if (moduleFixture) {
        await moduleFixture.close();
      }
    } catch (error) {
      console.error("Error closing moduleFixture:", error);
    }

    try {
      await closeInMongodConnection();
    } catch (error) {
      console.error("Error closing mongod:", error);
    }
  });

  beforeEach(async () => {
    await clearDatabase(connection);
  });

  describe("Create Product", () => {
    it("should create a product successfully", async () => {
      const productData = createTestProduct();

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.description).toBe(productData.description);
      expect(result.sku).toBe(productData.sku);
      expect(result.price).toBe(productData.price);
      expect(result.compareAtPrice).toBe(productData.compareAtPrice);
      expect(result.stock).toBe(productData.stock);
      expect(result.category).toBe(productData.category);
      expect(result.tags).toEqual(productData.tags);
      expect(result.brand).toBe(productData.brand);
      expect(result.isActive).toBe(true);
      expect(result.isFeatured).toBe(false);
      expect(result.averageRating).toBe(0);
      expect(result.reviewCount).toBe(0);
      expect(result.soldCount).toBe(0);
      expect(result.viewCount).toBe(0);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it("should create a product with images", async () => {
      const productData = createProductWithImages();

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result.images).toHaveLength(3);
      expect(result.images[0].url).toBe(productData.images[0].url);
      expect(result.images[0].isPrimary).toBe(true);
      expect(result.images[1].isPrimary).toBe(false);
      expect(result.images[2].isPrimary).toBe(false);
    });

    it("should create a product with dimensions", async () => {
      const productData = createProductWithDimensions();

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result.dimensions).toBeDefined();
      expect(result.dimensions.length).toBe(productData.dimensions.length);
      expect(result.dimensions.width).toBe(productData.dimensions.width);
      expect(result.dimensions.height).toBe(productData.dimensions.height);
      expect(result.dimensions.weight).toBe(productData.dimensions.weight);
      expect(result.dimensions.unit).toBe(productData.dimensions.unit);
    });

    it("should create a minimal product", async () => {
      const productData = createMinimalProduct();

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.sku).toBe(productData.sku);
      expect(result.price).toBe(productData.price);
      expect(result.stock).toBe(productData.stock);
      expect(result.compareAtPrice).toBeUndefined();
      expect(result.brand).toBeUndefined();
    });

    it("should create a featured product", async () => {
      const productData = createFeaturedProduct();

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result.isFeatured).toBe(true);
      expect(result.isActive).toBe(true);
    });

    it("should create a product with vendor ID", async () => {
      const vendorId = generateVendorId();
      const productData = createTestProduct({ vendorId });

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result.vendorId).toBe(vendorId);
    });

    it("should fail to create product with duplicate SKU", async () => {
      const productData = createTestProduct();

      await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, productData)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("SKU already exists");
      }
    });

    it("should create products with metadata", async () => {
      const productData = createTestProduct({
        metadata: {
          color: "red",
          material: "cotton",
          origin: "USA",
        },
      });

      const result = await firstValueFrom(
        client.send({ cmd: "create-product" }, productData)
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata.color).toBe("red");
      expect(result.metadata.material).toBe("cotton");
      expect(result.metadata.origin).toBe("USA");
    });
  });

  describe("Get All Products", () => {
    beforeEach(async () => {
      // Create multiple products
      await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ category: ProductCategory.CLOTHING })
        )
      );
      await firstValueFrom(
        client.send({ cmd: "create-product" }, createFeaturedProduct())
      );
    });

    it("should get all products", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, {})
      );

      expect(result).toBeDefined();
      expect(result.products).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should paginate products", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { page: 1, limit: 2 })
      );

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it("should filter products by category", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "get-all-products" },
          { category: ProductCategory.CLOTHING }
        )
      );

      expect(result.products).toHaveLength(1);
      expect(result.products[0].category).toBe(ProductCategory.CLOTHING);
    });

    it("should filter products by featured status", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { isFeatured: true })
      );

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.isFeatured === true)).toBe(
        true
      );
    });

    it("should filter products by active status", async () => {
      // Create an inactive product
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ isActive: false })
        )
      );

      const activeResult = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { isActive: true })
      );

      const inactiveResult = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { isActive: false })
      );

      expect(activeResult.products).toHaveLength(3);
      expect(inactiveResult.products).toHaveLength(1);
    });

    it("should filter products by vendor ID", async () => {
      const vendorId = generateVendorId();
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ vendorId })
        )
      );

      const result = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { vendorId })
      );

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p: any) => p.vendorId === vendorId)).toBe(
        true
      );
    });

    it("should return products sorted by creation date (newest first)", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, {})
      );

      const dates = result.products.map((p: any) =>
        new Date(p.createdAt).getTime()
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe("Get Product by ID", () => {
    let productId: string;

    beforeEach(async () => {
      const product = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );
      productId = product.id;
    });

    it("should get a product by ID", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "get-product" }, { productId })
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(productId);
      expect(result.viewCount).toBe(1);
    });

    it("should increment view count on each fetch", async () => {
      await firstValueFrom(
        client.send({ cmd: "get-product" }, { productId })
      );

      const result = await firstValueFrom(
        client.send({ cmd: "get-product" }, { productId })
      );

      expect(result.viewCount).toBe(2);
    });

    it("should fail with invalid product ID", async () => {
      try {
        await firstValueFrom(
          client.send({ cmd: "get-product" }, { productId: "invalid-id" })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid product ID");
      }
    });

    it("should fail to get non-existent product", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send({ cmd: "get-product" }, { productId: nonExistentId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });
  });

  describe("Update Product", () => {
    let productId: string;

    beforeEach(async () => {
      const product = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );
      productId = product.id;
    });

    it("should update product name", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "update-product" },
          { productId, name: "Updated Product Name" }
        )
      );

      expect(result.name).toBe("Updated Product Name");
    });

    it("should update product price", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, price: 199.99 })
      );

      expect(result.price).toBe(199.99);
    });

    it("should update product stock", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, stock: 500 })
      );

      expect(result.stock).toBe(500);
    });

    it("should update product category", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "update-product" },
          { productId, category: ProductCategory.BOOKS }
        )
      );

      expect(result.category).toBe(ProductCategory.BOOKS);
    });

    it("should update product tags", async () => {
      const newTags = ["new", "updated", "special"];
      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, tags: newTags })
      );

      expect(result.tags).toEqual(newTags);
    });

    it("should update product images", async () => {
      const newImages = [
        {
          url: "https://example.com/new-image.jpg",
          alt: "New image",
          isPrimary: true,
        },
      ];

      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, images: newImages })
      );

      expect(result.images).toHaveLength(1);
      expect(result.images[0].url).toBe(newImages[0].url);
    });

    it("should update product active status", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, isActive: false })
      );

      expect(result.isActive).toBe(false);
    });

    it("should update product featured status", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, { productId, isFeatured: true })
      );

      expect(result.isFeatured).toBe(true);
    });

    it("should update multiple fields at once", async () => {
      const updates = {
        productId,
        name: "Multi-Update Product",
        price: 299.99,
        stock: 75,
        isActive: false,
        isFeatured: true,
      };

      const result = await firstValueFrom(
        client.send({ cmd: "update-product" }, updates)
      );

      expect(result.name).toBe(updates.name);
      expect(result.price).toBe(updates.price);
      expect(result.stock).toBe(updates.stock);
      expect(result.isActive).toBe(updates.isActive);
      expect(result.isFeatured).toBe(updates.isFeatured);
    });

    it("should fail to update with invalid product ID", async () => {
      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-product" },
            { productId: "invalid-id", name: "Test" }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid product ID");
      }
    });

    it("should fail to update non-existent product", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-product" },
            { productId: nonExistentId, name: "Test" }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail to update SKU to duplicate value", async () => {
      const product2 = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );

      try {
        await firstValueFrom(
          client.send(
            { cmd: "update-product" },
            { productId, sku: product2.sku }
          )
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("SKU already exists");
      }
    });
  });

  describe("Delete Product", () => {
    let productId: string;

    beforeEach(async () => {
      const product = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );
      productId = product.id;
    });

    it("should delete a product", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "delete-product" }, { productId })
      );

      expect(result.message).toContain("deleted successfully");

      // Verify product is deleted
      try {
        await firstValueFrom(
          client.send({ cmd: "get-product" }, { productId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });

    it("should fail to delete with invalid product ID", async () => {
      try {
        await firstValueFrom(
          client.send({ cmd: "delete-product" }, { productId: "invalid-id" })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("Invalid product ID");
      }
    });

    it("should fail to delete non-existent product", async () => {
      const nonExistentId = "507f1f77bcf86cd799439099";

      try {
        await firstValueFrom(
          client.send({ cmd: "delete-product" }, { productId: nonExistentId })
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(getErrorMessage(error)).toContain("not found");
      }
    });
  });

  describe("Search Products", () => {
    beforeEach(async () => {
      // Create products with searchable content
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({
            name: "Wireless Bluetooth Headphones",
            description: "High-quality wireless headphones with noise cancellation",
            tags: ["audio", "wireless", "bluetooth"],
          })
        )
      );

      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({
            name: "USB-C Charging Cable",
            description: "Fast charging USB-C cable for all devices",
            tags: ["cable", "usb", "charging"],
          })
        )
      );

      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({
            name: "Smartphone Wireless Charger",
            description: "Qi wireless charging pad for smartphones",
            tags: ["wireless", "charging", "qi"],
          })
        )
      );

      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({
            name: "Gaming Mouse",
            description: "RGB gaming mouse with programmable buttons",
            tags: ["gaming", "mouse", "rgb"],
          })
        )
      );
    });

    it("should search products by name", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "search-products" }, { query: "wireless" })
      );

      expect(result.products.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it("should search products by description", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "search-products" }, { query: "charging" })
      );

      expect(result.products.length).toBeGreaterThan(0);
    });

    it("should search products by tags", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "search-products" }, { query: "gaming" })
      );

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toContain("Gaming");
    });

    it("should paginate search results", async () => {
      const result = await firstValueFrom(
        client.send(
          { cmd: "search-products" },
          { query: "wireless", page: 1, limit: 1 }
        )
      );

      expect(result.products).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });

    it("should return empty results for non-matching search", async () => {
      const result = await firstValueFrom(
        client.send({ cmd: "search-products" }, { query: "nonexistent" })
      );

      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("should only search active products", async () => {
      // Create an inactive product with searchable term
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({
            name: "Inactive Wireless Product",
            isActive: false,
          })
        )
      );

      const result = await firstValueFrom(
        client.send({ cmd: "search-products" }, { query: "wireless" })
      );

      // Should not include the inactive product
      expect(
        result.products.every((p: any) => p.isActive === true)
      ).toBe(true);
    });
  });

  describe("Product Categories", () => {
    it("should create products in different categories", async () => {
      const categories = [
        ProductCategory.ELECTRONICS,
        ProductCategory.CLOTHING,
        ProductCategory.BOOKS,
        ProductCategory.HOME,
        ProductCategory.SPORTS,
      ];

      for (const category of categories) {
        const result = await firstValueFrom(
          client.send(
            { cmd: "create-product" },
            createTestProduct({ category })
          )
        );
        expect(result.category).toBe(category);
      }
    });

    it("should filter products by each category", async () => {
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ category: ProductCategory.ELECTRONICS })
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ category: ProductCategory.CLOTHING })
        )
      );

      const electronicsResult = await firstValueFrom(
        client.send(
          { cmd: "get-all-products" },
          { category: ProductCategory.ELECTRONICS }
        )
      );

      const clothingResult = await firstValueFrom(
        client.send(
          { cmd: "get-all-products" },
          { category: ProductCategory.CLOTHING }
        )
      );

      expect(electronicsResult.products).toHaveLength(1);
      expect(clothingResult.products).toHaveLength(1);
    });
  });

  describe("Product Timestamps", () => {
    it("should set createdAt and updatedAt on creation", async () => {
      const product = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );

      expect(product.createdAt).toBeDefined();
      expect(product.updatedAt).toBeDefined();
      expect(new Date(product.createdAt)).toBeInstanceOf(Date);
      expect(new Date(product.updatedAt)).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp on product update", async () => {
      const product = await firstValueFrom(
        client.send({ cmd: "create-product" }, createTestProduct())
      );

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await firstValueFrom(
        client.send(
          { cmd: "update-product" },
          { productId: product.id, name: "Updated Name" }
        )
      );

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(product.updatedAt).getTime()
      );
    });
  });

  describe("Data Validation", () => {
    it("should validate positive price", async () => {
      const invalidProduct = createTestProduct({ price: -10 });

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, invalidProduct)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should validate non-negative stock", async () => {
      const invalidProduct = createTestProduct({ stock: -5 });

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, invalidProduct)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should validate compareAtPrice is positive if provided", async () => {
      const invalidProduct = createTestProduct({ compareAtPrice: -100 });

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, invalidProduct)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should require product name", async () => {
      const invalidProduct = { ...createTestProduct(), name: undefined };

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, invalidProduct)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("should require product SKU", async () => {
      const invalidProduct = { ...createTestProduct(), sku: undefined };

      try {
        await firstValueFrom(
          client.send({ cmd: "create-product" }, invalidProduct)
        );
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Vendor Products", () => {
    const vendorId1 = generateVendorId();
    const vendorId2 = generateVendorId();

    beforeEach(async () => {
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ vendorId: vendorId1 })
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ vendorId: vendorId1 })
        )
      );
      await firstValueFrom(
        client.send(
          { cmd: "create-product" },
          createTestProduct({ vendorId: vendorId2 })
        )
      );
    });

    it("should get products by vendor", async () => {
      const vendor1Products = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { vendorId: vendorId1 })
      );

      const vendor2Products = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { vendorId: vendorId2 })
      );

      expect(vendor1Products.products).toHaveLength(2);
      expect(vendor2Products.products).toHaveLength(1);
    });

    it("should associate products with correct vendor", async () => {
      const products = await firstValueFrom(
        client.send({ cmd: "get-all-products" }, { vendorId: vendorId1 })
      );

      expect(
        products.products.every((p: any) => p.vendorId === vendorId1)
      ).toBe(true);
    });
  });
});
