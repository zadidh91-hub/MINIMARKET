import { describe, expect, it } from "vitest";

import { RegisterSaleUseCase } from "../src/modules/sales/application/use-cases/RegisterSaleUseCase.js";

import type { Product } from "../src/modules/products/domain/entities/Product.js";
import type { ProductRepository } from "../src/modules/products/domain/ports/ProductRepository.js";

import type { CustomerRepository } from "../src/modules/customers/domain/ports/CustomerRepository.js";

import type { SaleRegistrationWriter } from "../src/modules/sales/domain/ports/SaleRepository.js";
import type { Sale } from "../src/modules/sales/domain/entities/Sale.js";

import type { Customer } from "../src/modules/customers/domain/entities/Customer.js";

import { BoletaValidator } from "../src/modules/sales/domain/receipt/BoletaValidator.js";
import { FacturaValidator } from "../src/modules/sales/domain/receipt/FacturaValidator.js";
import { ReceiptValidationService } from "../src/modules/sales/application/services/ReceiptValidationService.js";
import { SaleItemBuilder } from "../src/modules/sales/application/services/SaleItemBuilder.js";

function product(
  partial: Partial<Product> &
    Pick<Product, "id" | "name" | "code" | "price" | "stock">,
): Product {
  const now = new Date();

  return {
    minStock: 5,
    imagePath: null,
    categoryId: "cat-1",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

class InMemoryProducts implements ProductRepository {
  constructor(private items: Product[]) {}

  async findById(id: string) {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async findByCode(code: string) {
    return this.items.find((p) => p.code === code) ?? null;
  }

  async findByIds(ids: string[]) {
    return this.items.filter((p) => ids.includes(p.id));
  }

  async list() {
    return this.items;
  }

  async search() {
    return this.items;
  }

  async save(p: Product) {
    this.items.push(p);
    return p;
  }

  async update(p: Product) {
    this.items = this.items.map((i) =>
      i.id === p.id ? p : i,
    );

    return p;
  }

  async delete(id: string) {
    this.items = this.items.filter((i) => i.id !== id);
  }
}

class InMemoryCustomers implements CustomerRepository {
  constructor(private items: Customer[] = []) {}

  async findById(id: string) {
    return this.items.find((c) => c.id === id) ?? null;
  }

  async findByDocument() {
    return null;
  }

  async list() {
    return this.items;
  }

  async search() {
    return this.items;
  }

  async save(c: Customer) {
    this.items.push(c);
    return c;
  }

  async update(c: Customer) {
    return c;
  }
}

class FakeSaleWriter implements SaleRegistrationWriter {
  last?: Parameters<SaleRegistrationWriter["register"]>[0];

  async register(
    data: Parameters<SaleRegistrationWriter["register"]>[0],
  ): Promise<Sale> {
    this.last = data;
    return data.sale;
  }
}

function createReceiptValidationService() {
  return new ReceiptValidationService([
    new BoletaValidator(),
    new FacturaValidator(),
  ]);
}

describe("RegisterSaleUseCase", () => {
  const rice = product({
    id: "p1",
    name: "Arroz",
    code: "ARR001",
    price: 4.5,
    stock: 20,
  });

  const oil = product({
    id: "p2",
    name: "Aceite",
    code: "ACE001",
    price: 10,
    stock: 5,
  });

  it("calcula totales con precios del dominio y descuenta stock", async () => {
    const writer = new FakeSaleWriter();

    const useCase = new RegisterSaleUseCase(
      new InMemoryProducts([rice, oil]),
      new InMemoryCustomers(),
      writer,
      createReceiptValidationService(),
      new SaleItemBuilder(),
    );

    const sale = await useCase.execute({
      receiptType: "BOLETA",
      boletaDocumentMode: "NONE",
      items: [
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 1 },
      ],
      userId: "u1",
    });

    expect(sale.total).toBe(19);

    expect(
      writer.last?.products.find((p) => p.id === "p1")?.stock,
    ).toBe(18);

    expect(
      writer.last?.products.find((p) => p.id === "p2")?.stock,
    ).toBe(4);

    expect(writer.last?.movements).toHaveLength(2);
  });

  it("no registra si el stock no alcanza", async () => {
    const useCase = new RegisterSaleUseCase(
      new InMemoryProducts([rice]),
      new InMemoryCustomers(),
      new FakeSaleWriter(),
      createReceiptValidationService(),
      new SaleItemBuilder(),
    );

    await expect(
      useCase.execute({
        receiptType: "BOLETA",
        items: [{ productId: "p1", quantity: 50 }],
        userId: "u1",
      }),
    ).rejects.toThrow("Stock insuficiente");
  });

  it("ignora precios enviados desde fuera y usa el precio persistido", async () => {
    const writer = new FakeSaleWriter();

    const useCase = new RegisterSaleUseCase(
      new InMemoryProducts([rice]),
      new InMemoryCustomers(),
      writer,
      createReceiptValidationService(),
      new SaleItemBuilder(),
    );

    const sale = await useCase.execute({
      receiptType: "BOLETA",
      items: [{ productId: "p1", quantity: 3 }],
      userId: "u1",
    });

    expect(sale.items[0].unitPrice).toBe(4.5);
    expect(sale.total).toBe(13.5);
  });
});