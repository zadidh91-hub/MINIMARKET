import { randomUUID } from "node:crypto";
import { ValidationError, NotFoundError, ConflictError } from "../../../../shared/errors/AppError.js";
import { assertPositivePrice, assertStockQuantity, type Product } from "../../domain/entities/Product.js";
import type { ProductRepository } from "../../domain/ports/ProductRepository.js";
import type { CategoryRepository } from "../../../categories/domain/ports/CategoryRepository.js";
import { applyStockChange } from "../../../inventory/domain/entities/InventoryMovement.js";
import type { StockAdjustmentWriter } from "../../../inventory/domain/ports/StockAdjustmentWriter.js";

export type CreateProductInput = {
  code: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  categoryId: string;
  imagePath?: string | null;
};

export class CreateProductUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly stockWriter: StockAdjustmentWriter,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const code = input.code.trim();
    const name = input.name.trim();
    if (!code || !name) {
      throw new ValidationError("Código y nombre son obligatorios");
    }

    try {
      assertPositivePrice(input.price);
      assertStockQuantity(input.stock);
      assertStockQuantity(input.minStock);
    } catch {
      throw new ValidationError("Precio o stock inválido");
    }

    const category = await this.categories.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError("Categoría no encontrada");
    }

    const existing = await this.products.findByCode(code);
    if (existing) {
      throw new ConflictError("Ya existe un producto con ese código");
    }

    const now = new Date();
    const product: Product = {
      id: randomUUID(),
      code,
      name,
      price: input.price,
      stock: 0,
      minStock: input.minStock,
      imagePath: input.imagePath ?? null,
      categoryId: input.categoryId,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.products.save(product);

    if (input.stock > 0) {
      const newStock = applyStockChange(0, "IN", input.stock);
      await this.stockWriter.apply({
        product: { ...saved, stock: newStock },
        movement: {
          id: randomUUID(),
          productId: saved.id,
          type: "IN",
          quantity: input.stock,
          previousStock: 0,
          newStock,
          note: "Stock inicial",
          saleId: null,
          createdAt: new Date(),
        },
      });
      return { ...saved, stock: newStock };
    }

    return saved;
  }
}
