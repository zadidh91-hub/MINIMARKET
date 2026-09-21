import { isLowStock } from "../../../products/domain/entities/Product.js";
import type { ProductRepository } from "../../../products/domain/ports/ProductRepository.js";

export class ListInventoryUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute() {
    const products = await this.products.list();
    return products.map((product) => ({
      ...product,
      lowStock: isLowStock(product),
    }));
  }
}
