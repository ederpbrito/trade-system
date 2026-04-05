import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { integrationCredentials } from "../db/schema.js";

export type CredentialMeta = {
  sourceKey: string;
  hasSecret: boolean;
  updatedAt: string;
};

export class DrizzleIntegrationCredentialsRepository {
  async upsert(sourceKey: string, encryptedPayload: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.sourceKey, sourceKey))
      .limit(1);
    const now = new Date();
    if (existing) {
      await db
        .update(integrationCredentials)
        .set({ encryptedPayload, updatedAt: now })
        .where(eq(integrationCredentials.sourceKey, sourceKey));
    } else {
      await db.insert(integrationCredentials).values({ sourceKey, encryptedPayload });
    }
  }

  async listMeta(): Promise<CredentialMeta[]> {
    const rows = await db.select().from(integrationCredentials);
    return rows.map((r) => ({
      sourceKey: r.sourceKey,
      hasSecret: r.encryptedPayload.length > 0,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async getEncryptedPayload(sourceKey: string): Promise<string | null> {
    const [row] = await db
      .select({ encryptedPayload: integrationCredentials.encryptedPayload })
      .from(integrationCredentials)
      .where(eq(integrationCredentials.sourceKey, sourceKey))
      .limit(1);
    return row?.encryptedPayload ?? null;
  }
}
