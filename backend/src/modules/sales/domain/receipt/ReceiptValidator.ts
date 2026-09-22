import type {
  BoletaDocumentMode,
  ReceiptType,
} from "../entities/Sale.js";

export type ReceiptData = {
  receiptType: ReceiptType;
  boletaDocumentMode?: BoletaDocumentMode | null;
  documentNumber?: string | null;
  customerName?: string | null;
  ruc?: string | null;
  businessName?: string | null;
};

export interface ReceiptValidator {
  supports(receiptType: ReceiptType): boolean;
  validate(input: ReceiptData): void;
}