import { ValidationError } from "../../../../shared/errors/AppError.js";
import type { Product } from "../../domain/entities/Product.js";
import type { ProductRepository, ProductSearchQuery } from "../../domain/ports/ProductRepository.js";

export class SearchProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(query: ProductSearchQuery): Promise<Product[]> {
    const term = query.term.trim();
    if (term.length < 1) {
      throw new ValidationError("Indica un término de búsqueda");
    }
    return this.products.search({ term, by: query.by ?? "any" });
  }
}
