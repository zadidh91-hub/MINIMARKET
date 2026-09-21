import { UnauthorizedError } from "../../../../shared/errors/AppError.js";
import { toPublicUser } from "../../../users/domain/entities/User.js";
import type { UserRepository } from "../../../users/domain/ports/UserRepository.js";

export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user || !user.active) {
      throw new UnauthorizedError("Sesión inválida");
    }
    return toPublicUser(user);
  }
}