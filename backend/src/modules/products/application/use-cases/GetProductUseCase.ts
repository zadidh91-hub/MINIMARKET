import { NotFoundError } from "../../../../shared/errors/AppError.js";
import type { Product } from "../../domain/entities/Product.js";
import type { ProductRepository } from "../../domain/ports/ProductRepository.js";

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }
    return product;
  }
}
