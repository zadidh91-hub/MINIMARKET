import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Product, Sale } from "../types";

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    api<Product[]>("/api/inventory").then(setProducts).catch(() => setProducts([]));
    api<Sale[]>("/api/sales").then(setSales).catch(() => setSales([]));
  }, []);

  const low = products.filter((p) => p.lowStock);
  const todayTotal = sales
    .filter((s) => new Date(s.soldAt).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">Panel del día</h1>
        <p className="text-ink/60">Resumen operativo del minimarket.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-line bg-card p-5">
          <p className="text-sm text-ink/50">Ventas de hoy</p>
          <p className="mt-2 font-display text-4xl">S/ {todayTotal.toFixed(2)}</p>
        </article>
        <article className="rounded-3xl border border-line bg-card p-5">
          <p className="text-sm text-ink/50">Productos</p>
          <p className="mt-2 font-display text-4xl">{products.length}</p>
        </article>
        <article className="rounded-3xl border border-line bg-card p-5">
          <p className="text-sm text-ink/50">Stock bajo</p>
          <p className="mt-2 font-display text-4xl text-clay">{low.length}</p>
        </article>
      </div>
      <div className="flex gap-3">
        <Link to="/ventas/nueva" className="rounded-full bg-pine px-5 py-2 font-semibold text-white">
          Nueva venta
        </Link>
        <Link to="/inventario" className="rounded-full border border-line px-5 py-2 font-semibold">
          Ver inventario
        </Link>
      </div>
      {low.length > 0 && (
        <section className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">Alertas de stock</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {low.map((p) => (
              <li key={p.id}>
                {p.name} · {p.stock} uds. (mín. {p.minStock})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
