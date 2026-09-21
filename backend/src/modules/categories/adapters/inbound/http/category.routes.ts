import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { CreateCategoryUseCase } from "../../../application/use-cases/CreateCategoryUseCase.js";
import type { UpdateCategoryUseCase } from "../../../application/use-cases/UpdateCategoryUseCase.js";
import type { DeleteCategoryUseCase } from "../../../application/use-cases/DeleteCategoryUseCase.js";
import type { ListCategoriesUseCase } from "../../../application/use-cases/ListCategoriesUseCase.js";
import { requireRole } from "../../../../../infrastructure/http/authMiddleware.js";

const bodySchema = z.object({ name: z.string().min(1) });

export function createCategoryRouter(deps: {
  list: ListCategoriesUseCase;
  create: CreateCategoryUseCase;
  update: UpdateCategoryUseCase;
  remove: DeleteCategoryUseCase;
}) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await deps.list.execute());
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const body = parse(bodySchema, req.body);
      res.status(201).json(await deps.create.execute(body.name));
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      const body = parse(bodySchema, req.body);
      res.json(await deps.update.execute(req.params.id, body.name));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", requireRole("ADMIN"), async (req, res, next) => {
    try {
      await deps.remove.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Datos inválidos");
  }
  return result.data;
}
