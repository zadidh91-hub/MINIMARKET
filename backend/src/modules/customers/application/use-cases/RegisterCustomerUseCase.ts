import { randomUUID } from "node:crypto";
import { ConflictError, ValidationError } from "../../../../shared/errors/AppError.js";
import { assertCustomerDocument, type Customer, type DocumentType } from "../../domain/entities/Customer.js";
import type { CustomerRepository } from "../../domain/ports/CustomerRepository.js";

export class RegisterCustomerUseCase {
  constructor(private readonly customers: CustomerRepository) {}

  async execute(input: { documentType: DocumentType; documentNumber: string; name: string }): Promise<Customer> {
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
    if (existing) {
      throw new ConflictError("Ya existe un cliente con ese documento");
    }

    const now = new Date();
    return this.customers.save({
      id: randomUUID(),
      documentType: input.documentType,
      documentNumber,
      name,
      createdAt: now,
      updatedAt: now,
    });
  }
}
