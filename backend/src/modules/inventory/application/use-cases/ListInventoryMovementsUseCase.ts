import type { InventoryMovementRepository } from "../../domain/ports/InventoryMovementRepository.js";

export class ListInventoryMovementsUseCase {
  constructor(private readonly movements: InventoryMovementRepository) {}

  async execute(productId?: string) {
    return this.movements.list(productId);
  }
}
