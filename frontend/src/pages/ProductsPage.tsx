import { FormEvent, useEffect, useState } from "react";
import { api, imageUrl } from "../services/api";
import type { Category, Product } from "../types";
import { useAuth } from "../hooks/useAuth";

export function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [by, setBy] = useState<"any" | "name" | "code">("any");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    price: "",
    stock: "0",
    minStock: "5",
    categoryId: "",
    image: null as File | null,
  });

  async function load() {
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    const list = query.trim()
      ? await api<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}&by=${by}`)
      : await api<Product[]>(`/api/products?${params.toString()}`);
    setProducts(list);
  }

  useEffect(() => {
    api<Category[]>("/api/categories").then(setCategories);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load().catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar productos",
        ),
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, by, categoryId]);

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    }
  }

  function startEdit(product: Product) {
    setForm({
      id: product.id,
      code: product.code,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      minStock: String(product.minStock),
      categoryId: product.categoryId,
      image: null,
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const data = new FormData();
    data.set("code", form.code);
    data.set("name", form.name);
    data.set("price", form.price);
    data.set("minStock", form.minStock);
    data.set("categoryId", form.categoryId);
    if (!form.id) data.set("stock", form.stock);
    if (form.image) data.set("image", form.image);
    try {
      if (form.id) {
        await api(`/api/products/${form.id}`, { method: "PUT", body: data });
      } else {
        await api("/api/products", { method: "POST", body: data });
      }
      setForm({ id: "", code: "", name: "", price: "", stock: "0", minStock: "5", categoryId: "", image: null });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
      <section>
        <h1 className="font-display text-4xl">Productos</h1>
        <form onSubmit={onSearch} className="mt-4 flex flex-wrap gap-2">
          <input className="min-w-56 flex-1 rounded-full border border-line bg-card px-4 py-2" placeholder="Buscar por nombre o código" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="rounded-full border border-line bg-card px-3 py-2" value={by} onChange={(e) => setBy(e.target.value as typeof by)}>
            <option value="any">Nombre o código</option>
            <option value="name">Nombre</option>
            <option value="code">Código</option>
          </select>
          <select className="rounded-full border border-line bg-card px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="rounded-full bg-pine px-4 py-2 text-white">Buscar</button>
        </form>
        {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th>Código</th>
                <th>Precio</th>
                <th>Stock</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagePath ? (
                        <img src={imageUrl(p.imagePath) ?? ""} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-paper text-xs text-ink/40">Sin foto</div>
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.code}</td>
                  <td>S/ {Number(p.price).toFixed(2)}</td>
                  <td className={p.stock <= p.minStock ? "font-semibold text-clay" : ""}>{p.stock}</td>
                  {isAdmin && (
                    <td className="px-4 text-right">
                      <button className="mr-2 text-pine" onClick={() => startEdit(p)}>Editar</button>
                      <button className="text-clay" onClick={() => remove(p.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {isAdmin && (
        <form onSubmit={save} className="h-fit rounded-3xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">{form.id ? "Editar producto" : "Registrar producto"}</h2>
          <Field label="Código" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
          <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Precio" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          {!form.id && <Field label="Stock inicial" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />}
          <Field label="Stock mínimo" value={form.minStock} onChange={(v) => setForm({ ...form, minStock: v })} />
          <label className="mt-3 block text-sm">Categoría</label>
          <select required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Selecciona</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="mt-3 block text-sm">Imagen</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" className="mt-1 w-full text-sm" onChange={(e) => setForm({ ...form, image: e.target.files?.[0] ?? null })} />
          <button className="mt-4 w-full rounded-full bg-pine py-2 font-semibold text-white">Guardar</button>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <>
      <label className="mt-3 block text-sm">{label}</label>
      <input required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </>
  );
}
