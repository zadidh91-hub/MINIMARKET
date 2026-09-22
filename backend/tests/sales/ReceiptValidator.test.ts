import { describe, expect, it } from "vitest";

import type {
  ReceiptData,
  ReceiptValidator,
} from "../../src/modules/sales/domain/receipt/ReceiptValidator.js";

import { BoletaValidator } from "../../src/modules/sales/domain/receipt/BoletaValidator.js";
import { FacturaValidator } from "../../src/modules/sales/domain/receipt/FacturaValidator.js";

describe("ReceiptValidator - LSP", () => {
  const validators: ReceiptValidator[] = [
    new BoletaValidator(),
    new FacturaValidator(),
  ];

  it("permite usar BoletaValidator como ReceiptValidator", () => {
    const validator: ReceiptValidator = new BoletaValidator();

    const input: ReceiptData = {
      receiptType: "BOLETA",
      boletaDocumentMode: "DNI",
      documentNumber: "12345678",
      customerName: "Juan Pérez",
    };

    expect(() => validator.validate(input)).not.toThrow();
  });

  it("permite usar FacturaValidator como ReceiptValidator", () => {
    const validator: ReceiptValidator = new FacturaValidator();

    const input: ReceiptData = {
      receiptType: "FACTURA",
      ruc: "20123456789",
      businessName: "Empresa Demo",
    };

    expect(() => validator.validate(input)).not.toThrow();
  });

  it("cada validador respeta supports()", () => {
    const boleta = validators.find(
      (validator) => validator.supports("BOLETA"),
    );

    const factura = validators.find(
      (validator) => validator.supports("FACTURA"),
    );

    expect(boleta).toBeInstanceOf(BoletaValidator);
    expect(factura).toBeInstanceOf(FacturaValidator);
  });

  it("los validadores mantienen el contrato ante datos inválidos", () => {
    const invalidInputs: ReceiptData[] = [
      {
        receiptType: "BOLETA",
        boletaDocumentMode: "DNI",
        documentNumber: "123",
        customerName: "Juan Pérez",
      },
      {
        receiptType: "FACTURA",
        ruc: "123",
        businessName: "Empresa Demo",
      },
    ];

    for (const input of invalidInputs) {
      const validator = validators.find(
        (item) => item.supports(input.receiptType),
      );

      expect(validator).toBeDefined();

      expect(() => validator!.validate(input)).toThrow();
    }
  });
});
