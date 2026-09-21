import type { InventoryMovement } from "../entities/InventoryMovement.js";

export interface InventoryMovementRepository {
  list(productId?: string): Promise<InventoryMovement[]>;
  save(movement: InventoryMovement): Promise<InventoryMovement>;
}
