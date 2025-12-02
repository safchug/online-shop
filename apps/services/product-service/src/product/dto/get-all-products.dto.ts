import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductCategory } from "../../entities/product.entity";

export class GetAllProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;
}
