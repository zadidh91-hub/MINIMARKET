import { randomUUID } from "node:crypto";
import { NotFoundError, ValidationError } from "../../../../shared/errors/AppError.js";
import type { ProductRepository } from "../../../products/domain/ports/ProductRepository.js";
import { applyStockChange, type InventoryMovementType } from "../../domain/entities/InventoryMovement.js";
import type { StockAdjustmentWriter } from "../../domain/ports/StockAdjustmentWriter.js";

export class RegisterInventoryMovementUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly stockWriter: StockAdjustmentWriter,
  ) {}

  async execute(input: {
    productId: string;
    type: Exclude<InventoryMovementType, "SALE">;
    quantity: number;
    note?: string;
  }) {
    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }

    let newStock: number;
    try {
      newStock = applyStockChange(product.stock, input.type, input.quantity);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "INSUFFICIENT_STOCK") {
        throw new ValidationError("Stock insuficiente para la salida");
      }
      throw new ValidationError("Cantidad inválida");
    }

    const updated = { ...product, stock: newStock, updatedAt: new Date() };
    await this.stockWriter.apply({
      product: updated,
      movement: {
        id: randomUUID(),
        productId: product.id,
        type: input.type,
        quantity: input.quantity,
        previousStock: product.stock,
        newStock,
        note: input.note?.trim() || (input.type === "IN" ? "Entrada de inventario" : "Salida de inventario"),
        saleId: null,
        createdAt: new Date(),
      },
    });

    return updated;
  }
}
