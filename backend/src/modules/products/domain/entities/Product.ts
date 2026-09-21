export type Product = {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  imagePath: string | null;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function isLowStock(product: Pick<Product, "stock" | "minStock">): boolean {
  return product.stock <= product.minStock;
}

export function assertPositivePrice(price: number): void {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("INVALID_PRICE");
  }
}

export function assertStockQuantity(stock: number): void {
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("INVALID_STOCK");
  }
}
