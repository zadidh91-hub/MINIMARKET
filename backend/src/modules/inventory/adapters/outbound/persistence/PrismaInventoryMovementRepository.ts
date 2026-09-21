import type { PrismaClient } from "@prisma/client";
import type { InventoryMovement } from "../../../domain/entities/InventoryMovement.js";
import type { InventoryMovementRepository } from "../../../domain/ports/InventoryMovementRepository.js";

export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  constructor(private readonly db: PrismaClient) {}

  async list(productId?: string) {
    const rows = await this.db.inventoryMovement.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map((row) => ({
      ...row,
      type: row.type as InventoryMovement["type"],
    }));
  }

  async save(movement: InventoryMovement) {
    const row = await this.db.inventoryMovement.create({ data: movement });
    return { ...row, type: row.type as InventoryMovement["type"] };
  }
}
