import { UnauthorizedError } from "../../../../shared/errors/AppError.js";
import type { PasswordHasher } from "../../domain/PasswordHasher.js";
import type { TokenService } from "../../domain/TokenService.js";
import { toPublicUser } from "../../../users/domain/entities/User.js";
import type { UserRepository } from "../../../users/domain/ports/UserRepository.js";

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user || !user.active) {
      throw new UnauthorizedError("Credenciales inválidas");
    }
    const matches = await this.hasher.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError("Credenciales inválidas");
    }
    const token = this.tokens.sign({ userId: user.id, role: user.role });
    return { token, user: toPublicUser(user) };
  }
}
