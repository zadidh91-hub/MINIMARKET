import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { ProductImageStorage } from "../../../domain/ports/ProductImageStorage.js";
import type { CreateProductUseCase } from "../../../application/use-cases/CreateProductUseCase.js";
import type { UpdateProductUseCase } from "../../../application/use-cases/UpdateProductUseCase.js";
import type { DeleteProductUseCase } from "../../../application/use-cases/DeleteProductUseCase.js";
import type { GetProductUseCase } from "../../../application/use-cases/GetProductUseCase.js";
import type { ListProductsUseCase } from "../../../application/use-cases/ListProductsUseCase.js";
import type { SearchProductsUseCase } from "../../../application/use-cases/SearchProductsUseCase.js";
import { requireRole } from "../../../../../infrastructure/http/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  minStock: z.coerce.number().int().nonnegative().default(5),
  categoryId: z.string().uuid(),
});

const updateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  minStock: z.coerce.number().int().nonnegative(),
  categoryId: z.string().uuid(),
});

export function createProductRouter(deps: {
  list: ListProductsUseCase;
  search: SearchProductsUseCase;
  get: GetProductUseCase;
  create: CreateProductUseCase;
  update: UpdateProductUseCase;
  remove: DeleteProductUseCase;
  images: ProductImageStorage;
}) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
      const lowStock = req.query.lowStock === "true";
      res.json(await deps.list.execute({ categoryId, lowStock }));
    } catch (error) {
      next(error);
    }
  });

  router.get("/search", async (req, res, next) => {
    try {
      const term = String(req.query.q ?? req.query.term ?? "");
      const byRaw = String(req.query.by ?? "any");
      const by = byRaw === "name" || byRaw === "code" ? byRaw : "any";
      res.json(await deps.search.execute({ term, by }));
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

  router.post("/", requireRole("ADMIN"), upload.single("image"), async (req, res, next) => {
    try {
      const body = parse(createSchema, req.body);
      const imagePath = req.file
        ? await deps.images.save({
            buffer: req.file.buffer,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
          })
        : null;
      res.status(201).json(
  await deps.create.execute({
    ...body,
    minStock: body.minStock ?? 5,
    imagePath,
  }),
);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", requireRole("ADMIN"), upload.single("image"), async (req, res, next) => {
    try {
      const body = parse(updateSchema, req.body);
      const current = await deps.get.execute(req.params.id);
      let imagePath = current.imagePath;
      if (req.file) {
        imagePath = await deps.images.save({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        });
      }
      res.json(await deps.update.execute({ id: req.params.id, ...body, imagePath }));
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
    throw new ValidationError("Datos de producto inválidos");
  }
  return result.data;
}
