import type { PrismaClient } from "@prisma/client";
import type { Product } from "../../../domain/entities/Product.js";
import type {
  ProductFilters,
  ProductRepository,
  ProductSearchQuery,
} from "../../../domain/ports/ProductRepository.js";
import { toProduct } from "../../../../../infrastructure/database/prisma/mappers.js";
import { ConflictError } from "../../../../../shared/errors/AppError.js";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async findByCode(code: string) {
    const row = await this.db.product.findUnique({ where: { code } });
    return row ? toProduct(row) : null;
  }

  async findByIds(ids: string[]) {
    const rows = await this.db.product.findMany({ where: { id: { in: ids } } });
    return rows.map(toProduct);
  }

  async list(filters?: ProductFilters) { 
    const rows = await this.db.product.findMany({ 
      where: { 
        active: true,
        categoryId: filters?.categoryId, 
      }, 
      orderBy: { name: "asc" }, 
    }); 
    return rows.map(toProduct);
  }

  async search(query: ProductSearchQuery) {
    const term = query.term;
    const by = query.by ?? "any";
    const where =
      by === "code"
        ? { code: { contains: term, mode: "insensitive" as const } }
        : by === "name"
          ? { name: { contains: term, mode: "insensitive" as const } }
          : {
              OR: [
                { name: { contains: term, mode: "insensitive" as const } },
                { code: { contains: term, mode: "insensitive" as const } },
              ],
            };

    const rows = await this.db.product.findMany({ 
      where: {
        ...where,
        active: true,
      },
      orderBy: { name: "asc" }, 
      take: 20, 
    });
    return rows.map(toProduct);
  }

  async save(product: Product) {
    const row = await this.db.product.create({
      data: {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        imagePath: product.imagePath,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
    return toProduct(row);
  }

  async update(product: Product) {
    const row = await this.db.product.update({
      where: { id: product.id },
      data: {
        code: product.code,
        name: product.name,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        imagePath: product.imagePath,
        categoryId: product.categoryId,
        updatedAt: product.updatedAt,
      },
    });
    return toProduct(row);
  }

  async delete(id: string) {
    await this.db.product.update({
      where: { id },
      data: { active: false },
    });
  }
}