import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Role, User } from "../types";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ id: "", name: "", email: "", password: "", role: "VENDEDOR" as Role, active: true });

  async function load() {
    setUsers(await api<User[]>("/api/users"));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      if (form.id) {
        await api(`/api/users/${form.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            role: form.role,
            active: form.active,
            password: form.password || undefined,
          }),
        });
      } else {
        await api("/api/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        });
      }
      setForm({ id: "", name: "", email: "", password: "", role: "VENDEDOR", active: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <h1 className="font-display text-4xl">Usuarios</h1>
        {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper"><tr><th className="px-4 py-3">Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="px-4 py-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.active ? "Activo" : "Inactivo"}</td>
                  <td className="px-4 text-right">
                    <button className="text-pine" onClick={() => setForm({ ...u, password: "" })}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form onSubmit={save} className="h-fit rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-2xl">{form.id ? "Editar usuario" : "Nuevo usuario"}</h2>
        <label className="mt-3 block text-sm">Nombre</label>
        <input className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {!form.id && (
          <>
            <label className="mt-3 block text-sm">Correo</label>
            <input className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </>
        )}
        <label className="mt-3 block text-sm">Contraseña {form.id && "(opcional)"}</label>
        <input type="password" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label className="mt-3 block text-sm">Rol</label>
        <select className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          <option value="ADMIN">ADMIN</option>
          <option value="VENDEDOR">VENDEDOR</option>
        </select>
        {form.id && (
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Activo
          </label>
        )}
        <button className="mt-4 w-full rounded-full bg-pine py-2 font-semibold text-white">Guardar</button>
      </form>
    </div>
  );
}
