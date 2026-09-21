import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import type { InventoryMovement, Product } from "../types";
import { useAuth } from "../hooks/useAuth";

export function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [form, setForm] = useState({ productId: "", type: "IN" as "IN" | "OUT", quantity: "1", note: "" });
  const [error, setError] = useState("");

  async function load() {
    setProducts(await api<Product[]>("/api/inventory"));
    setMovements(await api<InventoryMovement[]>("/api/inventory/movements"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function register(event: FormEvent) {
    event.preventDefault();
    try {
      await api("/api/inventory/movements", {
        method: "POST",
        body: JSON.stringify({
          productId: form.productId,
          type: form.type,
          quantity: Number(form.quantity),
          note: form.note || undefined,
        }),
      });
      setForm({ ...form, quantity: "1", note: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Inventario</h1>
      {error && <p className="text-sm text-clay">{error}</p>}
      {user?.role === "ADMIN" && (
        <form onSubmit={register} className="grid gap-3 rounded-3xl border border-line bg-card p-5 md:grid-cols-5">
          <select required className="rounded-xl border border-line bg-paper px-3 py-2" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="rounded-xl border border-line bg-paper px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "IN" | "OUT" })}>
            <option value="IN">Entrada</option>
            <option value="OUT">Salida</option>
          </select>
          <input className="rounded-xl border border-line bg-paper px-3 py-2" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className="rounded-xl border border-line bg-paper px-3 py-2" placeholder="Nota" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button className="rounded-full bg-pine text-white">Registrar movimiento</button>
        </form>
      )}
      <div className="overflow-hidden rounded-3xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper"><tr><th className="px-4 py-3">Producto</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3">{p.name}</td>
                <td>{p.stock}</td>
                <td>{p.minStock}</td>
                <td className={p.lowStock ? "font-semibold text-clay" : "text-pine"}>{p.lowStock ? "Stock bajo" : "OK"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <h2 className="font-display text-2xl">Movimientos</h2>
        <div className="mt-3 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper"><tr><th className="px-4 py-3">Fecha</th><th>Tipo</th><th>Cantidad</th><th>Stock</th><th>Nota</th></tr></thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.type}</td>
                  <td>{m.quantity}</td>
                  <td>{m.previousStock} → {m.newStock}</td>
                  <td>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
