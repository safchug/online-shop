import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Product, ProductDocument } from "../entities/product.entity";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
  DeleteProductDto,
  GetAllProductsDto,
  SearchProductsDto,
  ProductResponseDto,
  PaginatedProductsResponseDto,
} from "./dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async createProduct(
    createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    try {
      // Check if SKU already exists
      const existingProduct = await this.productModel.findOne({
        sku: createProductDto.sku,
      });

      if (existingProduct) {
        throw new RpcException({
          statusCode: 400,
          message: "Product with this SKU already exists",
        });
      }

      // Create the product
      const product = new this.productModel({
        ...createProductDto,
        vendorId: createProductDto.vendorId
          ? new Types.ObjectId(createProductDto.vendorId)
          : undefined,
      });

      await product.save();

      return this.formatProductResponse(product);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 500,
        message: "Failed to create product",
      });
    }
  }

  async getAllProducts(
    getAllProductsDto: GetAllProductsDto
  ): Promise<PaginatedProductsResponseDto> {
    const {
      page = 1,
      limit = 10,
      category,
      vendorId,
      isActive,
      isFeatured,
    } = getAllProductsDto;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (vendorId) {
      query.vendorId = new Types.ObjectId(vendorId);
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return {
      products: products.map((product) => this.formatProductResponse(product)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(
    getProductDto: GetProductDto
  ): Promise<ProductResponseDto> {
    const { productId } = getProductDto;

    if (!Types.ObjectId.isValid(productId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: "Product not found",
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    return this.formatProductResponse(product);
  }

  async updateProduct(
    updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    const { productId, ...updateData } = updateProductDto;

    if (!Types.ObjectId.isValid(productId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    // Check if SKU is being updated and if it already exists
    if (updateData.sku) {
      const existingProduct = await this.productModel.findOne({
        sku: updateData.sku,
        _id: { $ne: new Types.ObjectId(productId) },
      });

      if (existingProduct) {
        throw new RpcException({
          statusCode: 400,
          message: "Product with this SKU already exists",
        });
      }
    }

    const product = await this.productModel.findByIdAndUpdate(
      productId,
      {
        ...updateData,
        vendorId: updateData.vendorId
          ? new Types.ObjectId(updateData.vendorId)
          : undefined,
      },
      { new: true }
    );

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: "Product not found",
      });
    }

    return this.formatProductResponse(product);
  }

  async deleteProduct(
    deleteProductDto: DeleteProductDto
  ): Promise<{ message: string }> {
    const { productId } = deleteProductDto;

    if (!Types.ObjectId.isValid(productId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    const product = await this.productModel.findByIdAndDelete(productId);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: "Product not found",
      });
    }

    return { message: "Product deleted successfully" };
  }

  async searchProducts(
    searchProductsDto: SearchProductsDto
  ): Promise<PaginatedProductsResponseDto> {
    const { query, page = 1, limit = 10 } = searchProductsDto;

    const skip = (page - 1) * limit;

    // Use text search
    const searchQuery = {
      $text: { $search: query },
      isActive: true,
    };

    const [products, total] = await Promise.all([
      this.productModel
        .find(searchQuery)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(searchQuery),
    ]);

    return {
      products: products.map((product) => this.formatProductResponse(product)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStock(
    productId: string,
    quantity: number
  ): Promise<ProductResponseDto> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid product ID",
      });
    }

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new RpcException({
        statusCode: 404,
        message: "Product not found",
      });
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new RpcException({
        statusCode: 400,
        message: "Insufficient stock",
      });
    }

    product.stock = newStock;
    await product.save();

    return this.formatProductResponse(product);
  }

  private formatProductResponse(product: ProductDocument): ProductResponseDto {
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      category: product.category,
      tags: product.tags,
      images: product.images,
      brand: product.brand,
      dimensions: product.dimensions,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      vendorId: product.vendorId?.toString(),
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      soldCount: product.soldCount,
      viewCount: product.viewCount,
      metadata: product.metadata
        ? Object.fromEntries(product.metadata)
        : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
