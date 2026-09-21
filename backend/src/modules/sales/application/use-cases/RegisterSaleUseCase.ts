import { randomUUID } from "node:crypto";
import { NotFoundError, ValidationError } from "../../../../shared/errors/AppError.js";
import { lineSubtotal, sumTotals } from "../../../../shared/utils/money.js";
import type { ProductRepository } from "../../../products/domain/ports/ProductRepository.js";
import { applyStockChange } from "../../../inventory/domain/entities/InventoryMovement.js";
import type { InventoryMovement } from "../../../inventory/domain/entities/InventoryMovement.js";
import type { CustomerRepository } from "../../../customers/domain/ports/CustomerRepository.js";
import {
  assertReceiptData,
  type BoletaDocumentMode,
  type ReceiptType,
  type Sale,
  type SaleItem,
} from "../../domain/entities/Sale.js";
import type { SaleRegistrationWriter } from "../../domain/ports/SaleRepository.js";
import type { Product } from "../../../products/domain/entities/Product.js";

export type RegisterSaleItemInput = {
  productId: string;
  quantity: number;
};

export type RegisterSaleInput = {
  receiptType: ReceiptType;
  boletaDocumentMode?: BoletaDocumentMode;
  customerId?: string | null;
  documentNumber?: string | null;
  customerName?: string | null;
  ruc?: string | null;
  businessName?: string | null;
  items: RegisterSaleItemInput[];
  userId: string;
};

export class RegisterSaleUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly customers: CustomerRepository,
    private readonly writer: SaleRegistrationWriter,
  ) {}

  async execute(input: RegisterSaleInput): Promise<Sale> {
    if (!input.items.length) {
      throw new ValidationError("La venta debe tener al menos un producto");
    }

    try {
      assertReceiptData(input);
    } catch (error) {
      throw new ValidationError(mapReceiptError(error));
    }

    const quantities = mergeQuantities(input.items);
    const productIds = [...quantities.keys()];
    const found = await this.products.findByIds(productIds);
    if (found.length !== productIds.length) {
      throw new NotFoundError("Uno o más productos no existen");
    }

    const productMap = new Map(found.map((p) => [p.id, p]));
    const saleItems: SaleItem[] = [];
    const updatedProducts: Product[] = [];
    const movements: InventoryMovement[] = [];
    const saleId = randomUUID();
    const now = new Date();

    for (const [productId, quantity] of quantities) {
      const product = productMap.get(productId)!;
      let newStock: number;
      try {
        newStock = applyStockChange(product.stock, "SALE", quantity);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "INSUFFICIENT_STOCK") {
          throw new ValidationError(`Stock insuficiente para ${product.name}`);
        }
        throw new ValidationError("Cantidad inválida");
      }

      const unitPrice = product.price;
      const subtotal = lineSubtotal(unitPrice, quantity);
      saleItems.push({
        id: randomUUID(),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity,
        unitPrice,
        subtotal,
      });
      updatedProducts.push({ ...product, stock: newStock, updatedAt: now });
      movements.push({
        id: randomUUID(),
        productId: product.id,
        type: "SALE",
        quantity,
        previousStock: product.stock,
        newStock,
        note: "Venta",
        saleId,
        createdAt: now,
      });
    }

    const total = sumTotals(saleItems.map((item) => item.subtotal));
    let customerId: string | null = input.customerId ?? null;
    let documentNumber = input.documentNumber ?? null;
    let customerName = input.customerName ?? null;
    let ruc = input.ruc ?? null;
    let businessName = input.businessName ?? null;

    if (customerId) {
      const customer = await this.customers.findById(customerId);
      if (!customer) {
        throw new NotFoundError("Cliente no encontrado");
      }
      if (input.receiptType === "FACTURA" && customer.documentType !== "RUC") {
        throw new ValidationError("La factura requiere un cliente con RUC");
      }
      if (input.receiptType === "BOLETA" && input.boletaDocumentMode === "DNI" && customer.documentType !== "DNI") {
        throw new ValidationError("La boleta con DNI requiere un cliente con DNI");
      }
      documentNumber = customer.documentNumber;
      if (customer.documentType === "RUC") {
        ruc = customer.documentNumber;
        businessName = customer.name;
      } else {
        customerName = customer.name;
      }
    }

    const sale: Sale = {
      id: saleId,
      receiptType: input.receiptType,
      boletaDocumentMode: input.receiptType === "BOLETA" ? (input.boletaDocumentMode ?? "NONE") : null,
      customerId,
      documentNumber: input.receiptType === "BOLETA" ? documentNumber : null,
      customerName: input.receiptType === "BOLETA" ? customerName : null,
      ruc: input.receiptType === "FACTURA" ? ruc : null,
      businessName: input.receiptType === "FACTURA" ? businessName : null,
      subtotal: total,
      total,
      soldAt: now,
      userId: input.userId,
      userName: "",
      items: saleItems,
    };

    return this.writer.register({ sale, products: updatedProducts, movements });
  }
}

function mergeQuantities(items: RegisterSaleItemInput[]): Map<string, number> {
  const quantities = new Map<string, number>();
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new ValidationError("La cantidad debe ser un entero positivo");
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  return quantities;
}

function mapReceiptError(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "INVALID_DNI") return "DNI inválido (8 dígitos)";
  if (code === "MISSING_CUSTOMER_NAME") return "El nombre es obligatorio para boleta con DNI";
  if (code === "INVALID_RUC") return "RUC inválido (11 dígitos)";
  if (code === "MISSING_BUSINESS_NAME") return "La razón social es obligatoria para factura";
  return "Datos de comprobante inválidos";
}
