import { NotFoundError, ValidationError } from "../../../../shared/errors/AppError.js";
import type { Role } from "../../../../shared/auth/roles.js";
import { toPublicUser } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";
import type { PasswordHasher } from "../../../auth/domain/PasswordHasher.js";

export class UpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: {
    id: string;
    name: string;
    role: Role;
    active: boolean;
    password?: string;
  }) {
    const current = await this.users.findById(input.id);
    if (!current) {
      throw new NotFoundError("Usuario no encontrado");
    }
    const name = input.name.trim();
    if (!name) {
      throw new ValidationError("El nombre es obligatorio");
    }
    if (input.role !== "ADMIN" && input.role !== "VENDEDOR") {
      throw new ValidationError("Rol inválido");
    }
    let passwordHash = current.passwordHash;
    if (input.password) {
      if (input.password.length < 6) {
        throw new ValidationError("La contraseña debe tener al menos 6 caracteres");
      }
      passwordHash = await this.hasher.hash(input.password);
    }
    const updated = await this.users.update({
      ...current,
      name,
      role: input.role,
      active: input.active,
      passwordHash,
    });
    return toPublicUser(updated);
  }
}
