import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { RegisterCustomerUseCase } from "../../../application/use-cases/RegisterCustomerUseCase.js";
import type { UpdateCustomerUseCase } from "../../../application/use-cases/UpdateCustomerUseCase.js";
import type { GetCustomerUseCase } from "../../../application/use-cases/GetCustomerUseCase.js";
import type { ListCustomersUseCase } from "../../../application/use-cases/ListCustomersUseCase.js";
import type { SearchCustomersUseCase } from "../../../application/use-cases/SearchCustomersUseCase.js";

const customerSchema = z.object({
  documentType: z.enum(["DNI", "RUC"]),
  documentNumber: z.string().min(1),
  name: z.string().min(1),
});

export function createCustomerRouter(deps: {
  list: ListCustomersUseCase;
  search: SearchCustomersUseCase;
  get: GetCustomerUseCase;
  create: RegisterCustomerUseCase;
  update: UpdateCustomerUseCase;
}) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await deps.list.execute());
    } catch (error) {
      next(error);
    }
  });

  router.get("/search", async (req, res, next) => {
    try {
      res.json(await deps.search.execute(String(req.query.q ?? "")));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      res.json(await deps.get.execute(req.params.id));
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const body = parse(customerSchema, req.body);
      res.status(201).json(await deps.create.execute(body));
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const body = parse(customerSchema, req.body);
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
    throw new ValidationError("Datos de cliente inválidos");
  }
  return result.data;
}
