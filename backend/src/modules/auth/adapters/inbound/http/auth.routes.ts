import { Router } from "express";
import { z } from "zod";
import { ValidationError } from "../../../../../shared/errors/AppError.js";
import type { LoginUseCase } from "../../../application/use-cases/LoginUseCase.js";
import type { GetCurrentUserUseCase } from "../../../application/use-cases/GetCurrentUserUseCase.js";
import type { AuthUser } from "../../../../../infrastructure/http/authMiddleware.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function createAuthRouter(deps: {
  login: LoginUseCase;
  me: GetCurrentUserUseCase;
  requireAuth: (req: any, res: any, next: any) => void;
}) {
  const router = Router();

  router.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Datos de inicio de sesión inválidos");
      }
      const result = await deps.login.execute(parsed.data.email, parsed.data.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/logout", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/me", deps.requireAuth, async (req, res, next) => {
    try {
      const user = (req as typeof req & { authUser: AuthUser }).authUser;
      const result = await deps.me.execute(user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
