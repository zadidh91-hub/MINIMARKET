import type { Category } from "../entities/Category.js";

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  list(): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
  hasProducts(id: string): Promise<boolean>;
}
