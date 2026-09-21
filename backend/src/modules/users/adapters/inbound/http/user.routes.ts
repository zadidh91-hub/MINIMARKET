import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { CreateUserUseCase } from "../../../application/use-cases/CreateUserUseCase.js";
import type { UpdateUserUseCase } from "../../../application/use-cases/UpdateUserUseCase.js";
import type { ListUsersUseCase } from "../../../application/use-cases/ListUsersUseCase.js";
import { requireRole } from "../../../../../infrastructure/http/authMiddleware.js";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "VENDEDOR"]),
});

const updateSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["ADMIN", "VENDEDOR"]),
  active: z.boolean(),
  password: z.string().min(6).optional(),
});

export function createUserRouter(deps: {
  list: ListUsersUseCase;
  create: CreateUserUseCase;
  update: UpdateUserUseCase;
}) {
  const router = Router();
  router.use(requireRole("ADMIN"));

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await deps.list.execute());
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const body = parse(createSchema, req.body);
      res.status(201).json(await deps.create.execute(body));
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const body = parse(updateSchema, req.body);
      res.json(await deps.update.execute({ id: req.params.id, ...body }));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Datos de usuario inválidos");
  }
  return result.data;
}
