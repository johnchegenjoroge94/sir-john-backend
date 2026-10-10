import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { CreateProductDto, ListProductsDto, UpdateProductDto } from "./dto/product.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get("product-categories")
  categories() {
    return this.products.categories();
  }

  @Get("products")
  list(@Query() query: ListProductsDto) {
    return this.products.listPublic(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get("admin/products")
  adminList() {
    return this.products.listAdmin();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post("admin/products")
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Patch("admin/products/:id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete("admin/products/:id")
  remove(@Param("id") id: string) {
    return this.products.remove(id);
  }
}
