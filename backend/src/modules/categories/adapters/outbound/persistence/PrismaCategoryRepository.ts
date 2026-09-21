import type { PrismaClient } from "@prisma/client";
import type { Category } from "../../../domain/entities/Category.js";
import type { CategoryRepository } from "../../../domain/ports/CategoryRepository.js";

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.category.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return this.db.category.findUnique({ where: { name } });
  }

  async list() {
    return this.db.category.findMany({ orderBy: { name: "asc" } });
  }

  async save(category: Category) {
    return this.db.category.create({ data: category });
  }

  async update(category: Category) {
    return this.db.category.update({
      where: { id: category.id },
      data: { name: category.name },
    });
  }

  async delete(id: string) {
    await this.db.category.delete({ where: { id } });
  }

  async hasProducts(id: string) {
    const count = await this.db.product.count({ where: { categoryId: id } });
    return count > 0;
  }
}
