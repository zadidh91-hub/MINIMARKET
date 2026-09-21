import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { RegisterSaleUseCase } from "../../../application/use-cases/RegisterSaleUseCase.js";
import type { ListSalesUseCase } from "../../../application/use-cases/ListSalesUseCase.js";
import type { GetSaleUseCase } from "../../../application/use-cases/GetSaleUseCase.js";
import type { AuthUser } from "../../../../../infrastructure/http/authMiddleware.js";

const saleSchema = z.object({
  receiptType: z.enum(["BOLETA", "FACTURA"]),
  boletaDocumentMode: z.enum(["NONE", "DNI"]).optional(),
  customerId: z.string().uuid().nullable().optional(),
  documentNumber: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  ruc: z.string().nullable().optional(),
  businessName: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export function createSaleRouter(deps: {
  list: ListSalesUseCase;
  get: GetSaleUseCase;
  register: RegisterSaleUseCase;
}) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      res.json(await deps.list.execute());
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
      const body = parse(saleSchema, req.body);
      const user = (req as typeof req & { authUser: AuthUser }).authUser;
      res.status(201).json(await deps.register.execute({ ...body, userId: user.id }));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError("Datos de venta inválidos");
  }
  return result.data;
}
