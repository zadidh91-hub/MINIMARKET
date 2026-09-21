import jwt, { type SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "../../../../shared/errors/AppError.js";
import type { TokenPayload, TokenService } from "../../domain/TokenService.js";

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: SignOptions["expiresIn"],
  ) {}

  sign(payload: TokenPayload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return { userId: decoded.userId, role: decoded.role };
    } catch {
      throw new UnauthorizedError("Token inválido o expirado");
    }
  }
}
