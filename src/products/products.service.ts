import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, ListProductsDto, UpdateProductDto } from "./dto/product.dto";

const include = { category: true } satisfies Prisma.ProductInclude;
type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof include }>;

function toResponse(p: ProductWithCategory) {
  // Availability is only reported when real inventory data exists.
  const inStock = p.quantity !== null ? p.quantity > 0 : p.inStock;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    price: p.price === null ? null : Number(p.price),
    inStock,
    quantity: p.quantity,
    active: p.active,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.productCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  }

  async listPublic(query: ListProductsDto) {
    const where: Prisma.ProductWhereInput = { active: true };
    if (query.category) where.category = { slug: query.category };
    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
      ];
    }
    const rows = await this.prisma.product.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    // Public responses do not expose exact quantities.
    return rows.map((r) => {
      const { quantity: _quantity, ...publicFields } = toResponse(r);
      return publicFields;
    });
  }

  async listAdmin() {
    const rows = await this.prisma.product.findMany({
      include,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toResponse);
  }

  async create(dto: CreateProductDto) {
    const created = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        price: dto.price ?? null,
        inStock: dto.inStock ?? null,
        quantity: dto.quantity ?? null,
        categoryId: dto.categoryId ?? null,
      },
      include,
    });
    return toResponse(created);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Product not found.");
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        price: dto.price,
        inStock: dto.inStock,
        quantity: dto.quantity,
        categoryId: dto.categoryId,
        active: dto.active,
      },
      include,
    });
    return toResponse(updated);
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Product not found.");
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true };
  }
}
