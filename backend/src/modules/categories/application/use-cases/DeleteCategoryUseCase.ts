import { ConflictError, NotFoundError } from "../../../../shared/errors/AppError.js";
import type { CategoryRepository } from "../../domain/ports/CategoryRepository.js";

export class DeleteCategoryUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const current = await this.categories.findById(id);
    if (!current) {
      throw new NotFoundError("Categoría no encontrada");
    }
    if (await this.categories.hasProducts(id)) {
      throw new ConflictError("No se puede eliminar una categoría con productos");
    }
    await this.categories.delete(id);
  }
}
