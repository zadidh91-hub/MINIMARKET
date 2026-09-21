import type { PrismaClient, Sale as PrismaSale, SaleItem as PrismaSaleItem, Product as PrismaProduct } from "@prisma/client";
import { ConflictError } from "../../../../../shared/errors/AppError.js";
import type { Sale, SaleItem } from "../../../domain/entities/Sale.js";
import type { SaleRegistrationWriter, SaleRepository } from "../../../domain/ports/SaleRepository.js";

type SaleWithItems = PrismaSale & {
  items: (PrismaSaleItem & { product: PrismaProduct })[];
  user: {
    name: string;
  };
};

function toSale(row: SaleWithItems): Sale {
  return {
    id: row.id,
    receiptType: row.receiptType,
    boletaDocumentMode: row.boletaDocumentMode,
    customerId: row.customerId,
    documentNumber: row.documentNumber,
    customerName: row.customerName,
    ruc: row.ruc,
    businessName: row.businessName,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    soldAt: row.soldAt,
    userId: row.userId,
    userName: row.user.name,
    items: row.items.map(
      (item): SaleItem => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      }),
    ),
  };
}

export class PrismaSaleRepository implements SaleRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.sale.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });
    return row ? toSale(row) : null;
  }

  async list() {
    const rows = await this.db.sale.findMany({
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { soldAt: "desc" },
    });
    return rows.map(toSale);
  }
}

export class PrismaSaleRegistrationWriter implements SaleRegistrationWriter {
  constructor(private readonly db: PrismaClient) {}

  async register(data: Parameters<SaleRegistrationWriter["register"]>[0]) {
    const sale = await this.db.$transaction(async (tx) => {
      for (const product of data.products) {
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: 0 } },
          data: { stock: product.stock, updatedAt: product.updatedAt },
        });
        if (updated.count !== 1) {
          throw new ConflictError("No se pudo actualizar el stock de un producto");
        }
      }

      await tx.sale.create({
        data: {
          id: data.sale.id,
          receiptType: data.sale.receiptType,
          boletaDocumentMode: data.sale.boletaDocumentMode,
          customerId: data.sale.customerId,
          documentNumber: data.sale.documentNumber,
          customerName: data.sale.customerName,
          ruc: data.sale.ruc,
          businessName: data.sale.businessName,
          subtotal: data.sale.subtotal,
          total: data.sale.total,
          soldAt: data.sale.soldAt,
          userId: data.sale.userId,
          items: {
            create: data.sale.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
      });

      await tx.inventoryMovement.createMany({
        data: data.movements,
      });

      return tx.sale.findUniqueOrThrow({
        where: { id: data.sale.id },
        include: {
          items: { include: { product: true } },
          user: true,
        },
      });
    });

    return toSale(sale);
  }
}
