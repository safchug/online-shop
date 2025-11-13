import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { MICROSERVICES } from "../../config/microservices.config";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(
    @Inject(MICROSERVICES.PRODUCT_SERVICE)
    private readonly productService: ClientProxy
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Products retrieved successfully" })
  async getAllProducts(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("category") category?: string
  ) {
    return await firstValueFrom(
      this.productService.send(
        { cmd: "get-all-products" },
        { page, limit, category }
      )
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiResponse({ status: 200, description: "Product retrieved successfully" })
  async getProductById(@Param("id") id: string) {
    return await firstValueFrom(
      this.productService.send({ cmd: "get-product" }, { productId: id })
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("vendor", "admin", "super_admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new product (Vendor/Admin only)" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  async createProduct(@Body() productData: any) {
    return await firstValueFrom(
      this.productService.send({ cmd: "create-product" }, productData)
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("vendor", "admin", "super_admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product (Vendor/Admin only)" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  async updateProduct(@Param("id") id: string, @Body() productData: any) {
    return await firstValueFrom(
      this.productService.send(
        { cmd: "update-product" },
        { productId: id, ...productData }
      )
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("vendor", "admin", "super_admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete product (Vendor/Admin only)" })
  @ApiResponse({ status: 200, description: "Product deleted successfully" })
  async deleteProduct(@Param("id") id: string) {
    return await firstValueFrom(
      this.productService.send({ cmd: "delete-product" }, { productId: id })
    );
  }

  @Get("search")
  @ApiOperation({ summary: "Search products" })
  @ApiResponse({ status: 200, description: "Search results retrieved" })
  async searchProducts(@Query("q") query: string) {
    return await firstValueFrom(
      this.productService.send({ cmd: "search-products" }, { query })
    );
  }
}
