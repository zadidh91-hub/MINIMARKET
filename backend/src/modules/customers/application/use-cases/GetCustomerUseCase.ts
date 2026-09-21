import { NotFoundError } from "../../../../shared/errors/AppError.js";
import type { CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class GetCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(id: string) {
    const customer = await this.customers.findById(id);
    if (!customer) {
      throw new NotFoundError("Cliente no encontrado");
    }
    return customer;
  }
}
