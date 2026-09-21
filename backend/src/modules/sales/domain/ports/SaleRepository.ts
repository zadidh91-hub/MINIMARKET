import type { Sale } from "../entities/Sale.js";
import type { Product } from "../../../products/domain/entities/Product.js";
import type { InventoryMovement } from "../../../inventory/domain/entities/InventoryMovement.js";

export interface SaleRepository {
  findById(id: string): Promise<Sale | null>;
  list(): Promise<Sale[]>;
}

export type RegisterSalePersistence = {
  sale: Sale;
  products: Product[];
  movements: InventoryMovement[];
};

export interface SaleRegistrationWriter {
  register(data: RegisterSalePersistence): Promise<Sale>;
}
