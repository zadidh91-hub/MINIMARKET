import { describe, expect, it } from "vitest";

import type {
  SaleRegistrationWriter,
  RegisterSalePersistence,
} from "../../src/modules/sales/domain/ports/SaleRepository.js";

class FakeSaleRegistrationWriter
  implements SaleRegistrationWriter
{
  public called = false;

  async register(
    data: RegisterSalePersistence,
  ) {
    this.called = true;

    return data.sale;
  }
}

describe("DIP - SaleRegistrationWriter", () => {
  it("permite usar una implementación alternativa sin depender de Prisma", async () => {
    const writer = new FakeSaleRegistrationWriter();

    const fakeSale = {
      id: "sale-1",
      receiptType: "BOLETA" as const,
      boletaDocumentMode: "NONE" as const,
      customerId: null,
      documentNumber: null,
      customerName: null,
      ruc: null,
      businessName: null,
      subtotal: 10,
      total: 10,
      soldAt: new Date(),
      userId: "user-1",
      userName: "Usuario Demo",
      items: [],
    };

    await writer.register({
      sale: fakeSale,
      products: [],
      movements: [],
    });

    expect(writer.called).toBe(true);
  });
});
