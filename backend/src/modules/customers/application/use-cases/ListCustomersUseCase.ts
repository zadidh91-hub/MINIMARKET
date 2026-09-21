import type { CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class ListCustomersUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute() {
    return this.customers.list();
  }
}
