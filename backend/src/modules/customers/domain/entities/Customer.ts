export type DocumentType = "DNI" | "RUC";

export type Customer = {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export function assertCustomerDocument(type: DocumentType, number: string): void {
  if (type === "DNI" && !/^\d{8}$/.test(number)) {
    throw new Error("INVALID_DNI");
  }
  if (type === "RUC" && !/^\d{11}$/.test(number)) {
    throw new Error("INVALID_RUC");
  }
}
