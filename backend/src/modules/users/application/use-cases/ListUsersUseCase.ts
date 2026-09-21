import { toPublicUser } from "../../domain/entities/User.js";
import type { UserRepository } from "../../domain/ports/UserRepository.js";

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute() {
    const users = await this.users.list();
    return users.map(toPublicUser);
  }
}
