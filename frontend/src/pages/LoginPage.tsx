import { FormEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@minimarket.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-sm">
        <p className="font-display text-4xl text-pine">Minimarket MINISOL</p>
        <p className="mt-2 text-ink/70">Ingresa para gestionar productos, stock y ventas.</p>
        <label className="mt-6 block text-sm font-medium">Correo</label>
        <input className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-4 block text-sm font-medium">Contraseña</label>
        <input type="password" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-3 text-sm text-clay">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-pine py-2.5 font-semibold text-white disabled:opacity-60">
          {loading ? "Ingresando..." : "Entrar"}
        </button>
        <p className="mt-4 text-xs text-ink/50">Admin: admin@minimarket.com / admin123 · Vendedor: vendedor@minimarket.com / vendedor123</p>
      </form>
    </div>
  );
}
