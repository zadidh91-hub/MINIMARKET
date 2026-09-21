import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { InventoryPage } from "./pages/InventoryPage";
import { CustomersPage } from "./pages/CustomersPage";
import { SalesPage } from "./pages/SalesPage";
import { NewSalePage } from "./pages/NewSalePage";
import { UsersPage } from "./pages/UsersPage";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/clientes" element={<CustomersPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/ventas/nueva" element={<NewSalePage />} />
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
