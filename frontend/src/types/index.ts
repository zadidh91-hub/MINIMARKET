export type Role = "ADMIN" | "VENDEDOR";
export type ReceiptType = "BOLETA" | "FACTURA";
export type BoletaDocumentMode = "NONE" | "DNI";
export type DocumentType = "DNI" | "RUC";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  imagePath: string | null;
  categoryId: string;
  lowStock?: boolean;
};

export type Customer = {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
};

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
  soldAt: string;
  userId: string;
  userName: string;
  items: SaleItem[];
};

export type InventoryMovement = {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "SALE";
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string | null;
  createdAt: string;
};
