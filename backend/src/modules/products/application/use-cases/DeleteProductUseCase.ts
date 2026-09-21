import { NotFoundError } from "../../../../shared/errors/AppError.js";
import type { ProductRepository } from "../../domain/ports/ProductRepository.js";

export class DeleteProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.products.findById(id);
    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }
    await this.products.delete(id);
  }
}
