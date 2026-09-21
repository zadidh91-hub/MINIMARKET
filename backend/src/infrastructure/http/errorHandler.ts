import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { Prisma } from "@prisma/client";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "El registro ya existe", code: "CONFLICT" });
    }
    if (err.code === "P2003" || err.code === "P2014") {
      return res.status(409).json({ error: "No se puede eliminar porque tiene registros asociados", code: "CONFLICT" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
}
