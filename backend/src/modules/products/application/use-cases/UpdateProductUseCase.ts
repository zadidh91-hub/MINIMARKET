import { ValidationError, NotFoundError, ConflictError } from "../../../../shared/errors/AppError.js";
import { assertPositivePrice, assertStockQuantity, type Product } from "../../domain/entities/Product.js";
import type { ProductRepository } from "../../domain/ports/ProductRepository.js";
import type { CategoryRepository } from "../../../categories/domain/ports/CategoryRepository.js";

export type UpdateProductInput = {
  id: string;
  code: string;
  name: string;
  price: number;
  minStock: number;
  categoryId: string;
  imagePath?: string | null;
};

export class UpdateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const current = await this.products.findById(input.id);
    if (!current) {
      throw new NotFoundError("Producto no encontrado");
    }

    const code = input.code.trim();
    const name = input.name.trim();
    if (!code || !name) {
      throw new ValidationError("Código y nombre son obligatorios");
    }

    try {
      assertPositivePrice(input.price);
      assertStockQuantity(input.minStock);
    } catch {
      throw new ValidationError("Precio o stock mínimo inválido");
    }

    const category = await this.categories.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    const byCode = await this.products.findByCode(code);
    if (byCode && byCode.id !== current.id) {
      throw new ConflictError("Ya existe un producto con ese código");
    }

    const imagePath = input.imagePath === undefined ? current.imagePath : input.imagePath;

    return this.products.update({
      ...current,
      code,
      name,
      price: input.price,
      minStock: input.minStock,
      categoryId: input.categoryId,
      imagePath,
      updatedAt: new Date(),
    });
  }
}
