export type InventoryMovementType = "IN" | "OUT" | "SALE";

export type InventoryMovement = {
  id: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string | null;
  saleId: string | null;
  createdAt: Date;
};

export function applyStockChange(
  currentStock: number,
  type: InventoryMovementType,
  quantity: number,
): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  if (type === "IN") {
    return currentStock + quantity;
  }

  const next = currentStock - quantity;
  if (next < 0) {
    throw new Error("INSUFFICIENT_STOCK");
  }
  return next;
}
