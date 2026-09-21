import { describe, expect, it } from "vitest";
import { lineSubtotal, roundMoney, sumTotals } from "../src/shared/utils/money.js";
import { applyStockChange } from "../src/modules/inventory/domain/entities/InventoryMovement.js";
import { assertReceiptData } from "../src/modules/sales/domain/entities/Sale.js";

describe("cálculo de importes", () => {
  it("calcula subtotales y total redondeados", () => {
    const a = lineSubtotal(2.5, 3);
    const b = lineSubtotal(1.99, 2);
    expect(a).toBe(7.5);
    expect(b).toBe(3.98);
    expect(sumTotals([a, b])).toBe(11.48);
    expect(roundMoney(10.005)).toBe(10.01);
  });
});

describe("stock", () => {
  it("descuenta stock en una venta", () => {
    expect(applyStockChange(20, "SALE", 3)).toBe(17);
  });

  it("rechaza stock insuficiente", () => {
    expect(() => applyStockChange(2, "OUT", 3)).toThrow("INSUFFICIENT_STOCK");
  });
});

describe("comprobantes", () => {
  it("exige RUC y razón social en factura", () => {
    expect(() => assertReceiptData({ receiptType: "FACTURA", ruc: "123", businessName: "X" })).toThrow("INVALID_RUC");
    expect(() =>
      assertReceiptData({ receiptType: "FACTURA", ruc: "20123456789", businessName: "Empresa SAC" }),
    ).not.toThrow();
  });
});
