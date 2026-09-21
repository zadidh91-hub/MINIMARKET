import { isLowStock, type Product } from "../../domain/entities/Product.js";
import type { ProductFilters, ProductRepository } from "../../domain/ports/ProductRepository.js";

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(filters?: ProductFilters): Promise<Product[]> {
    const items = await this.products.list(filters);
    if (filters?.lowStock) {
      return items.filter(isLowStock);
    }
    return items;
  }
}
