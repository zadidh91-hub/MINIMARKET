import type { Product as PrismaProduct } from "@prisma/client";
import type { Product } from "../../../modules/products/domain/entities/Product.js";

export function toProduct(row: PrismaProduct): Product {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    price: Number(row.price),
    stock: row.stock,
    minStock: row.minStock,
    imagePath: row.imagePath,
    categoryId: row.categoryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
