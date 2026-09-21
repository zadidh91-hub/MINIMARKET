import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Customer, DocumentType } from "../types";

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", documentType: "DNI" as DocumentType, documentNumber: "", name: "" });

  async function load(term = "") {
    const data = term
      ? await api<Customer[]>(`/api/customers/search?q=${encodeURIComponent(term)}`)
      : await api<Customer[]>("/api/customers");
    setItems(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = { documentType: form.documentType, documentNumber: form.documentNumber, name: form.name };
      if (form.id) await api(`/api/customers/${form.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/customers", { method: "POST", body: JSON.stringify(payload) });
      setForm({ id: "", documentType: "DNI", documentNumber: "", name: "" });
      await load(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <h1 className="font-display text-4xl">Clientes</h1>
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); load(query); }}>
          <input className="flex-1 rounded-full border border-line bg-card px-4 py-2" placeholder="Buscar por nombre o documento" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="rounded-full bg-pine px-4 py-2 text-white">Buscar</button>
        </form>
        {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper"><tr><th className="px-4 py-3">Nombre</th><th>Documento</th><th></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">{c.name}</td>
                  <td>{c.documentType} {c.documentNumber}</td>
                  <td className="px-4 text-right"><button className="text-pine" onClick={() => setForm(c)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form onSubmit={save} className="h-fit rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-2xl">{form.id ? "Editar cliente" : "Registrar cliente"}</h2>
        <label className="mt-3 block text-sm">Tipo de documento</label>
        <select className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentType })}>
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
        </select>
        <label className="mt-3 block text-sm">{form.documentType === "RUC" ? "RUC" : "DNI"}</label>
        <input className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} />
        <label className="mt-3 block text-sm">{form.documentType === "RUC" ? "Razón social" : "Nombre"}</label>
        <input className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <button className="mt-4 w-full rounded-full bg-pine py-2 font-semibold text-white">Guardar</button>
      </form>
    </div>
  );
}
