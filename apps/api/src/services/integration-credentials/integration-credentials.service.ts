import type { DrizzleIntegrationCredentialsRepository } from "../../repositories/drizzle-integration-credentials.repository.js";
import type { Env } from "../../config/env.js";
import { decryptJsonPayload, deriveDevKeyFromSecret, encryptJsonPayload } from "./credentials-crypto.js";

export class IntegrationCredentialsService {
  constructor(
    private readonly repo: DrizzleIntegrationCredentialsRepository,
    private readonly env: Pick<Env, "CREDENTIALS_ENCRYPTION_KEY" | "NODE_ENV" | "SESSION_SECRET">,
  ) {}

  private resolveKey(): string {
    if (this.env.CREDENTIALS_ENCRYPTION_KEY) {
      return this.env.CREDENTIALS_ENCRYPTION_KEY;
    }
    if (this.env.NODE_ENV === "development" || this.env.NODE_ENV === "test") {
      return deriveDevKeyFromSecret(this.env.SESSION_SECRET);
    }
    throw new Error("CREDENTIALS_ENCRYPTION_KEY é obrigatório em produção.");
  }

  async listForClient(): Promise<{ credentials: Array<{ sourceKey: string; hasSecret: boolean; updatedAt: string }> }> {
    const meta = await this.repo.listMeta();
    return {
      credentials: meta.map((m) => ({
        sourceKey: m.sourceKey,
        hasSecret: m.hasSecret,
        updatedAt: m.updatedAt,
      })),
    };
  }

  async save(sourceKey: string, payload: Record<string, unknown>): Promise<void> {
    const key = this.resolveKey();
    const encrypted = encryptJsonPayload(key, payload);
    await this.repo.upsert(sourceKey, encrypted);
  }

  /** Uso interno (conetores) — nunca expor na API pública */
  async decryptForConnector(sourceKey: string): Promise<Record<string, unknown> | null> {
    const enc = await this.repo.getEncryptedPayload(sourceKey);
    if (!enc) return null;
    const key = this.resolveKey();
    return decryptJsonPayload(key, enc);
  }
}
