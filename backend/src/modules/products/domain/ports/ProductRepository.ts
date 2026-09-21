import type { Product } from "../entities/Product.js";

export type ProductFilters = {
  categoryId?: string;
  lowStock?: boolean;
};

export type ProductSearchQuery = {
  term: string;
  by?: "name" | "code" | "any";
};

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCode(code: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  list(filters?: ProductFilters): Promise<Product[]>;
  search(query: ProductSearchQuery): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
