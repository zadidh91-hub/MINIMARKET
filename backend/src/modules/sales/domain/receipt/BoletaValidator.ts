import type { ReceiptValidator, ReceiptData } from "./ReceiptValidator.js";

export class BoletaValidator implements ReceiptValidator {
  supports(receiptType: ReceiptData["receiptType"]): boolean {
    return receiptType === "BOLETA";
  }

  validate(input: ReceiptData): void {
    const mode = input.boletaDocumentMode ?? "NONE";

    if (mode === "DNI") {
      if (!input.documentNumber || !/^\d{8}$/.test(input.documentNumber)) {
        throw new Error("INVALID_DNI");
      }

      if (!input.customerName?.trim()) {
        throw new Error("MISSING_CUSTOMER_NAME");
      }
    }
  }
}