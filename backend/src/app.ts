import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import type { AppContainer } from "./infrastructure/composition.js";
import { createAuthMiddleware } from "./infrastructure/http/authMiddleware.js";
import { errorHandler } from "./infrastructure/http/errorHandler.js";
import { createAuthRouter } from "./modules/auth/adapters/inbound/http/auth.routes.js";
import { createProductRouter } from "./modules/products/adapters/inbound/http/product.routes.js";
import { createCategoryRouter } from "./modules/categories/adapters/inbound/http/category.routes.js";
import { createInventoryRouter } from "./modules/inventory/adapters/inbound/http/inventory.routes.js";
import { createCustomerRouter } from "./modules/customers/adapters/inbound/http/customer.routes.js";
import { createSaleRouter } from "./modules/sales/adapters/inbound/http/sale.routes.js";
import { createUserRouter } from "./modules/users/adapters/inbound/http/user.routes.js";
import { ValidationError } from "./shared/errors/AppError.js";

export function createApp(container: AppContainer) {
  const app = express();
  const origin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

  app.use(cors({ origin, credentials: true }));
  app.use(express.json());
  app.use("/uploads/products", express.static(container.uploadDir));

  const requireAuth = createAuthMiddleware(container.tokens);
  const uc = container.useCases;

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/api/auth",
    createAuthRouter({
      login: uc.login,
      me: uc.me,
      requireAuth,
    }),
  );

  app.use("/api/products", requireAuth, createProductRouter({
    list: uc.listProducts,
    search: uc.searchProducts,
    get: uc.getProduct,
    create: uc.createProduct,
    update: uc.updateProduct,
    remove: uc.deleteProduct,
    images: container.images,
  }));

  app.use("/api/categories", requireAuth, createCategoryRouter({
    list: uc.listCategories,
    create: uc.createCategory,
    update: uc.updateCategory,
    remove: uc.deleteCategory,
  }));

  app.use("/api/inventory", requireAuth, createInventoryRouter({
    list: uc.listInventory,
    movements: uc.listMovements,
    register: uc.registerMovement,
  }));

  app.use("/api/customers", requireAuth, createCustomerRouter({
    list: uc.listCustomers,
    search: uc.searchCustomers,
    get: uc.getCustomer,
    create: uc.registerCustomer,
    update: uc.updateCustomer,
  }));

  app.use("/api/sales", requireAuth, createSaleRouter({
    list: uc.listSales,
    get: uc.getSale,
    register: uc.registerSale,
  }));

  app.use("/api/users", requireAuth, createUserRouter({
    list: uc.listUsers,
    create: uc.createUser,
    update: uc.updateUser,
  }));

  app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ZodError) {
      return next(new ValidationError("Datos inválidos"));
    }
    return errorHandler(err, req, res, next);
  });

  return app;
}
