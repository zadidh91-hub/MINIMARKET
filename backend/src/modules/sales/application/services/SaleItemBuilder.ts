import { randomUUID } from "node:crypto";

import { ValidationError } from "../../../../shared/errors/AppError.js";
import { lineSubtotal } from "../../../../shared/utils/money.js";
import { applyStockChange } from "../../../inventory/domain/entities/InventoryMovement.js";
import type { InventoryMovement } from "../../../inventory/domain/entities/InventoryMovement.js";
import type { Product } from "../../../products/domain/entities/Product.js";
import type { SaleItem } from "../../domain/entities/Sale.js";

export type SaleItemBuildResult = {
  saleItems: SaleItem[];
  updatedProducts: Product[];
  movements: InventoryMovement[];
};

export class SaleItemBuilder {
  build(
    quantities: Map<string, number>,
    products: Product[],
    saleId: string,
    now: Date,
  ): SaleItemBuildResult {
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const saleItems: SaleItem[] = [];
    const updatedProducts: Product[] = [];
    const movements: InventoryMovement[] = [];

    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId);

      if (!product) {
        throw new ValidationError(
          "Uno o más productos no existen",
        );
      }

      let newStock: number;

      try {
        newStock = applyStockChange(
          product.stock,
          "SALE",
          quantity,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "";

        if (message === "INSUFFICIENT_STOCK") {
          throw new ValidationError(
            `Stock insuficiente para ${product.name}`,
          );
        }

        throw new ValidationError("Cantidad inválida");
      }

      const unitPrice = product.price;
      const subtotal = lineSubtotal(
        unitPrice,
        quantity,
      );

      saleItems.push({
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity,
        unitPrice,
        subtotal,
      });

      updatedProducts.push({
        ...product,
        stock: newStock,
        updatedAt: now,
      });

      movements.push({
        id: randomUUID(),
        productId: product.id,
        type: "SALE",
        quantity,
        previousStock: product.stock,
        newStock,
        note: "Venta",
        saleId,
        createdAt: now,
      });
    }

    return {
      saleItems,
      updatedProducts,
      movements,
    };
  }
}