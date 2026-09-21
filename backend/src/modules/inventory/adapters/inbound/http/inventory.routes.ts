import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { ListInventoryUseCase } from "../../../application/use-cases/ListInventoryUseCase.js";
import type { ListInventoryMovementsUseCase } from "../../../application/use-cases/ListInventoryMovementsUseCase.js";
import type { RegisterInventoryMovementUseCase } from "../../../application/use-cases/RegisterInventoryMovementUseCase.js";
import { requireRole } from "../../../../../infrastructure/http/authMiddleware.js";

const movementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive(),
  note: z.string().optional(),
});

export function createInventoryRouter(deps: {
  list: ListInventoryUseCase;
  movements: ListInventoryMovementsUseCase;
  register: RegisterInventoryMovementUseCase;
}) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await deps.list.execute());
    } catch (error) {
      next(error);
    }
  });

  router.get("/movements", async (req, res, next) => {
    try {
      const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
      res.json(await deps.movements.execute(productId));
    } catch (error) {
      next(error);
    }
  });

  router.post("/movements", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const body = parse(movementSchema, req.body);
      res.status(201).json(await deps.register.execute(body));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Datos de inventario inválidos");
  }
  return result.data;
}
