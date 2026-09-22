import type { ReceiptValidator, ReceiptData } from "./ReceiptValidator.js";

export class FacturaValidator implements ReceiptValidator {
  supports(receiptType: ReceiptData["receiptType"]): boolean {
    return receiptType === "FACTURA";
  }

  validate(input: ReceiptData): void {
    if (!input.ruc || !/^\d{11}$/.test(input.ruc)) {
      throw new Error("INVALID_RUC");
    }

    if (!input.businessName?.trim()) {
      throw new Error("MISSING_BUSINESS_NAME");
    }
  }
}