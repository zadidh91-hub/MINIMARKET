import { ConflictError, NotFoundError, ValidationError } from "../../../../shared/errors/AppError.js";
import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/ports/CategoryRepository.js";

export class UpdateCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(id: string, name: string): Promise<Category> {
    const current = await this.categories.findById(id);
    if (!current) {
      throw new NotFoundError("Categoría no encontrada");
    }
    const trimmed = name.trim();
    if (!trimmed) {
      throw new ValidationError("El nombre es obligatorio");
    }
    const existing = await this.categories.findByName(trimmed);
    if (existing && existing.id !== id) {
      throw new ConflictError("Ya existe una categoría con ese nombre");
    }
    return this.categories.update({ ...current, name: trimmed });
  }
}
