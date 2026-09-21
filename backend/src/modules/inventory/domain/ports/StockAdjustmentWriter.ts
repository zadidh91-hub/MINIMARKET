import type { Product } from "../../../products/domain/entities/Product.js";
import type { InventoryMovement } from "../entities/InventoryMovement.js";

export type StockAdjustment = {
  product: Product;
  movement: InventoryMovement;
};

export interface StockAdjustmentWriter {
  apply(adjustment: StockAdjustment): Promise<void>;
}
