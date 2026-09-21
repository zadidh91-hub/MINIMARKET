import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/ventas", label: "Ventas" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/inventario", label: "Inventario" },
  { to: "/clientes", label: "Clientes" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="font-display text-2xl text-pine">Minimarket Andes</p>
            <p className="text-sm text-ink/60">Gestión de tienda</p>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? "bg-pine text-white" : "text-ink/70 hover:bg-line"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === "ADMIN" && (
              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium ${isActive ? "bg-pine text-white" : "text-ink/70 hover:bg-line"}`
                }
              >
                Usuarios
              </NavLink>
            )}
          </nav>
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs uppercase tracking-wide text-ink/50">{user?.role}</p>
            <button
              className="mt-1 text-sm text-clay"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
