import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/AppError.js";
import type { Role } from "../../shared/auth/roles.js";
import type { TokenService } from "../../modules/auth/domain/TokenService.js";

export type AuthUser = {
  id: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function createAuthMiddleware(tokens: TokenService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
      return next(new UnauthorizedError());
    }
    const payload = tokens.verify(token);
    req.authUser = { id: payload.userId, role: payload.role as Role };
    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.authUser.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
