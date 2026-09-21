import { randomUUID } from "node:crypto";
import { ConflictError, ValidationError } from "../../../../shared/errors/AppError.js";
import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/ports/CategoryRepository.js";

export class CreateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(name: string): Promise<Category> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new ValidationError("El nombre es obligatorio");
    }
    const existing = await this.categories.findByName(trimmed);
    if (existing) {
      throw new ConflictError("Ya existe una categoría con ese nombre");
    }
    return this.categories.save({
      id: randomUUID(),
      name: trimmed,
      createdAt: new Date(),
    });
  }
}
