export type ReceiptType = "BOLETA" | "FACTURA";
export type BoletaDocumentMode = "NONE" | "DNI";

export type SaleItem = {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  receiptType: ReceiptType;
  boletaDocumentMode: BoletaDocumentMode | null;
  customerId: string | null;
  documentNumber: string | null;
  customerName: string | null;
  ruc: string | null;
  businessName: string | null;
  subtotal: number;
  total: number;
  soldAt: Date;
  userId: string;
  userName: string;
  items: SaleItem[];
};

export function assertReceiptData(input: {
  receiptType: ReceiptType;
  boletaDocumentMode?: BoletaDocumentMode | null;
  documentNumber?: string | null;
  customerName?: string | null;
  ruc?: string | null;
  businessName?: string | null;
}): void {
  if (input.receiptType === "BOLETA") {
    const mode = input.boletaDocumentMode ?? "NONE";
    if (mode === "DNI") {
      if (!input.documentNumber || !/^\d{8}$/.test(input.documentNumber)) {
        throw new Error("INVALID_DNI");
      }
      if (!input.customerName?.trim()) {
        throw new Error("MISSING_CUSTOMER_NAME");
      }
    }
    return;
  }

  if (!input.ruc || !/^\d{11}$/.test(input.ruc)) {
    throw new Error("INVALID_RUC");
  }
  if (!input.businessName?.trim()) {
    throw new Error("MISSING_BUSINESS_NAME");
  }
}
