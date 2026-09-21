import { randomUUID } from "node:crypto";
import { ConflictError, ValidationError } from "../../../../shared/errors/AppError.js";
import type { Role } from "../../../../shared/auth/roles.js";
import type { PasswordHasher } from "../../../auth/domain/PasswordHasher.js";
import { toPublicUser, type PublicUser } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: { name: string; email: string; password: string; role: Role }): Promise<PublicUser> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !email) {
      throw new ValidationError("Nombre y correo son obligatorios");
    }
    if (!email.includes("@")) {
      throw new ValidationError("Correo inválido");
    }
    if (input.password.length < 6) {
      throw new ValidationError("La contraseña debe tener al menos 6 caracteres");
    }
    if (input.role !== "ADMIN" && input.role !== "VENDEDOR") {
      throw new ValidationError("Rol inválido");
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError("Ya existe un usuario con ese correo");
    }
    const user = await this.users.save({
      id: randomUUID(),
      name,
      email,
      passwordHash: await this.hasher.hash(input.password),
      role: input.role,
      active: true,
      createdAt: new Date(),
    });
    return toPublicUser(user);
  }
}
