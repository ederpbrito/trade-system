import bcrypt from "bcryptjs";
import type { IPasswordVerifier } from "./ports.js";

export class BcryptPasswordVerifier implements IPasswordVerifier {
  verify(plainText: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainText, passwordHash);
  }
}
