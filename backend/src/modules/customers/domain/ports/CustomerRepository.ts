import type { Customer, DocumentType } from "../entities/Customer.js";

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByDocument(type: DocumentType, number: string): Promise<Customer | null>;
  list(): Promise<Customer[]>;
  search(term: string): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
}
