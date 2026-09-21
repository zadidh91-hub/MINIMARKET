import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Sale } from "../types";

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selected, setSelected] = useState<Sale | null>(null);

  useEffect(() => {
    api<Sale[]>("/api/sales").then(setSales);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Ventas</h1>
        <Link to="/ventas/nueva" className="rounded-full bg-pine px-4 py-2 font-semibold text-white">Nueva venta</Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper"><tr><th className="px-4 py-3">Fecha</th><th>Comprobante</th><th>Total</th></tr></thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="cursor-pointer border-t border-line hover:bg-paper" onClick={() => setSelected((current) => (current?.id === s.id ? null : s))}>
                  <td className="px-4 py-3">{new Date(s.soldAt).toLocaleString()}</td>
                  <td>{s.receiptType}</td>
                  <td>S/ {Number(s.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <aside className="rounded-3xl border border-line bg-card p-5">
            <h2 className="font-display text-2xl">{selected.receiptType}</h2>
            <p className="text-sm text-ink/60">{new Date(selected.soldAt).toLocaleString()}</p>
            {selected.receiptType === "FACTURA" && <p className="mt-2">{selected.businessName} · RUC {selected.ruc}</p>}
            {selected.receiptType === "BOLETA" && selected.boletaDocumentMode === "DNI" && (
              <p className="mt-2">{selected.customerName} · DNI {selected.documentNumber}</p>
            )}
            <ul className="mt-4 space-y-2 text-sm">
              {selected.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>S/ {Number(item.subtotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right font-display text-3xl">S/ {Number(selected.total).toFixed(2)}</p>
          </aside>
        )}
      </div>
    </div>
  );
}
