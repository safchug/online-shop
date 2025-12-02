import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ProductService } from "./product.service";
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
  DeleteProductDto,
  GetAllProductsDto,
  SearchProductsDto,
} from "./dto";

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: "create-product" })
  async createProduct(@Payload() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @MessagePattern({ cmd: "get-all-products" })
  async getAllProducts(@Payload() getAllProductsDto: GetAllProductsDto) {
    return this.productService.getAllProducts(getAllProductsDto);
  }

  @MessagePattern({ cmd: "get-product" })
  async getProductById(@Payload() getProductDto: GetProductDto) {
    return this.productService.getProductById(getProductDto);
  }

  @MessagePattern({ cmd: "update-product" })
  async updateProduct(@Payload() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(updateProductDto);
  }

  @MessagePattern({ cmd: "delete-product" })
  async deleteProduct(@Payload() deleteProductDto: DeleteProductDto) {
    return this.productService.deleteProduct(deleteProductDto);
  }

  @MessagePattern({ cmd: "search-products" })
  async searchProducts(@Payload() searchProductsDto: SearchProductsDto) {
    return this.productService.searchProducts(searchProductsDto);
  }
}
