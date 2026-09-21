import type { PrismaClient } from "@prisma/client";
import type { Role } from "../../../../../shared/auth/roles.js";
import type { User } from "../../../domain/entities/User.js";
import type { UserRepository } from "../../../domain/ports/UserRepository.js";

function toUser(row: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: Date;
}): User {
  return row;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  }

  async findByEmail(email: string) {
    const row = await this.db.user.findUnique({ where: { email } });
    return row ? toUser(row) : null;
  }

  async list() {
    const rows = await this.db.user.findMany({ orderBy: { name: "asc" } });
    return rows.map(toUser);
  }

  async save(user: User) {
    const row = await this.db.user.create({ data: user });
    return toUser(row);
  }

  async update(user: User) {
    const row = await this.db.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
        active: user.active,
        passwordHash: user.passwordHash,
      },
    });
    return toUser(row);
  }
}
