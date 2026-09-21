import type { PrismaClient } from "@prisma/client";
import type { Customer, DocumentType } from "../../../domain/entities/Customer.js";
import type { CustomerRepository } from "../../../domain/ports/CustomerRepository.js";

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.customer.findUnique({ where: { id } });
  }

  async findByDocument(type: DocumentType, number: string) {
    return this.db.customer.findUnique({
      where: { documentType_documentNumber: { documentType: type, documentNumber: number } },
    });
  }

  async list() {
    return this.db.customer.findMany({ orderBy: { name: "asc" } });
  }

  async search(term: string) {
    return this.db.customer.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { documentNumber: { contains: term, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 20,
    });
  }

  async save(customer: Customer) {
    return this.db.customer.create({ data: customer });
  }

  async update(customer: Customer) {
    return this.db.customer.update({
      where: { id: customer.id },
      data: {
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
        name: customer.name,
        updatedAt: customer.updatedAt,
      },
    });
  }
}
