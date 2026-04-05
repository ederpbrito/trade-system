import type { IPasswordVerifier, IUserReader, PublicUser } from "./ports.js";

/**
 * Casos de uso de identidade: credenciais e resolução de utilizador.
 * Não conhece HTTP nem Drizzle (DIP).
 */
export class IdentityService {
  constructor(
    private readonly users: IUserReader,
    private readonly passwords: IPasswordVerifier,
  ) {}

  async verifyCredentials(email: string, password: string): Promise<PublicUser | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await this.passwords.verify(password, user.passwordHash);
    if (!ok) return null;
    return { id: user.id, email: user.email };
  }

  async getPublicUserById(id: string): Promise<PublicUser | null> {
    const user = await this.users.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email };
  }
}
