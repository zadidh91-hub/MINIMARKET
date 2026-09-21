import type { PrismaClient } from "@prisma/client";
import type { StockAdjustmentWriter } from "../../../domain/ports/StockAdjustmentWriter.js";

export class PrismaStockAdjustmentWriter implements StockAdjustmentWriter {
  constructor(private readonly db: PrismaClient) {}

  async apply({ product, movement }: Parameters<StockAdjustmentWriter["apply"]>[0]) {
    await this.db.$transaction([
      this.db.product.update({
        where: { id: product.id },
        data: { stock: product.stock, updatedAt: product.updatedAt },
      }),
      this.db.inventoryMovement.create({ data: movement }),
    ]);
  }
}
