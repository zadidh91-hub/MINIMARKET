import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Category } from "../types";
import { useAuth } from "../hooks/useAuth";

export function CategoriesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setItems(await api<Category[]>("/api/categories"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await api(`/api/categories/${editing}`, { method: "PUT", body: JSON.stringify({ name }) });
      } else {
        await api("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
      }
      setName("");
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl">Categorías</h1>
      {user?.role === "ADMIN" && (
        <form onSubmit={save} className="mt-4 flex gap-2">
          <input className="flex-1 rounded-full border border-line bg-card px-4 py-2" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="rounded-full bg-pine px-4 py-2 text-white">{editing ? "Actualizar" : "Crear"}</button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between px-4 py-3">
            <span>{item.name}</span>
            {user?.role === "ADMIN" && (
              <span className="space-x-3 text-sm">
                <button className="text-pine" onClick={() => { setEditing(item.id); setName(item.name); }}>Editar</button>
                <button className="text-clay" onClick={async () => {
                  try {
                    await api(`/api/categories/${item.id}`, { method: "DELETE" });
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Error");
                  }
                }}>Eliminar</button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
