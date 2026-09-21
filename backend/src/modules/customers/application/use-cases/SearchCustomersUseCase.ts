import { ValidationError } from "../../../../shared/errors/AppError.js";
import type { CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class SearchCustomersUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(term: string) {
    const trimmed = term.trim();
    if (!trimmed) {
      throw new ValidationError("Indica un término de búsqueda");
    }
    return this.customers.search(trimmed);
  }
}
