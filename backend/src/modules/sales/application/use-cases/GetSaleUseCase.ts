import { NotFoundError } from "../../../../shared/errors/AppError.js";
import type { SaleRepository } from "../../domain/ports/SaleRepository.js";

export class GetSaleUseCase {
  constructor(private readonly sales: SaleRepository) {}

  async execute(id: string) {
    const sale = await this.sales.findById(id);
    if (!sale) {
      throw new NotFoundError("Venta no encontrada");
    }
    return sale;
  }
}
