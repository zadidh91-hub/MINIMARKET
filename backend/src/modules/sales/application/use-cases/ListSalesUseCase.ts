import type { SaleRepository } from "../../domain/ports/SaleRepository.js";

export class ListSalesUseCase {
  constructor(private readonly sales: SaleRepository) {}

  async execute() {
    return this.sales.list();
  }
}
