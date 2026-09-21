import { describe, expect, it } from "vitest";
import { SearchProductsUseCase } from "../src/modules/products/application/use-cases/SearchProductsUseCase.js";
import type { Product } from "../src/modules/products/domain/entities/Product.js";
import type { ProductRepository, ProductSearchQuery } from "../src/modules/products/domain/ports/ProductRepository.js";

class MemoryProducts implements ProductRepository {
  constructor(private items: Product[]) {}
  async findById() { return null; }
  async findByCode() { return null; }
  async findByIds() { return []; }
  async list() { return this.items; }
  async search(query: ProductSearchQuery) {
    const term = query.term.toLowerCase();
    return this.items.filter((p) => {
      if (query.by === "code") return p.code.toLowerCase().includes(term);
      if (query.by === "name") return p.name.toLowerCase().includes(term);
      return p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term);
    });
  }
  async save(p: Product) { return p; }
  async update(p: Product) { return p; }
  async delete() {}
}

describe("SearchProductsUseCase", () => {
  const now = new Date();
  const items: Product[] = [
    { id: "1", code: "ARR001", name: "Arroz Costeño", price: 4.5, stock: 10, minStock: 5, imagePath: null, categoryId: "c", createdAt: now, updatedAt: now },
    { id: "2", code: "INC001", name: "Inca Kola", price: 2.5, stock: 10, minStock: 5, imagePath: null, categoryId: "c", createdAt: now, updatedAt: now },
  ];

  it("busca por nombre o código", async () => {
    const useCase = new SearchProductsUseCase(new MemoryProducts(items));
    const byName = await useCase.execute({ term: "arroz", by: "name" });
    const byCode = await useCase.execute({ term: "INC", by: "code" });
    expect(byName).toHaveLength(1);
    expect(byCode[0].name).toBe("Inca Kola");
  });
});
