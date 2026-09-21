import type { Category } from "../../domain/entities/Category.js";
import type { CategoryRepository } from "../../domain/ports/CategoryRepository.js";

export class ListCategoriesUseCase {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.categories.list();
  }
}
