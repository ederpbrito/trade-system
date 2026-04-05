import { BcryptPasswordVerifier, IdentityService } from "../services/identity/index.js";
import { DrizzleUserRepository } from "../repositories/drizzle-user.repository.js";

export function createIdentityService(): IdentityService {
  return new IdentityService(new DrizzleUserRepository(), new BcryptPasswordVerifier());
}
