import { ConflictError, NotFoundError, ValidationError } from "../../../../shared/errors/AppError.js";
import { assertCustomerDocument, type Customer, type DocumentType } from "../../domain/entities/Customer.js";
import type { CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class UpdateCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: {
    id: string;
    documentType: DocumentType;
    documentNumber: string;
    name: string;
  }): Promise<Customer> {
    const current = await this.customers.findById(input.id);
    if (!current) {
      throw new NotFoundError("Cliente no encontrado");
    }
    const name = input.name.trim();
    const documentNumber = input.documentNumber.trim();
    if (!name) {
      throw new ValidationError("El nombre o razón social es obligatorio");
    }
    try {
      assertCustomerDocument(input.documentType, documentNumber);
    } catch {
      throw new ValidationError(
        input.documentType === "DNI" ? "DNI inválido (8 dígitos)" : "RUC inválido (11 dígitos)",
      );
    }
    const existing = await this.customers.findByDocument(input.documentType, documentNumber);
    if (existing && existing.id !== input.id) {
      throw new ConflictError("Ya existe un cliente con ese documento");
    }
    return this.customers.update({
      ...current,
      documentType: input.documentType,
      documentNumber,
      name,
      updatedAt: new Date(),
    });
  }
}
