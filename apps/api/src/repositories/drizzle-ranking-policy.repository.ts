import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { rankingPolicies } from "../db/schema.js";
import type { IRankingPolicyRepository, PolicyWeights, RankingPolicy } from "../services/ranking-policy/ports.js";

function rowToPolicy(row: typeof rankingPolicies.$inferSelect): RankingPolicy {
  const weights = JSON.parse(row.weightsJson) as PolicyWeights;
  return {
    id: row.id,
    version: row.version,
    name: row.name,
    weights,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

export class DrizzleRankingPolicyRepository implements IRankingPolicyRepository {
  async findActive(): Promise<RankingPolicy | null> {
    const rows = await db.select().from(rankingPolicies).where(eq(rankingPolicies.isActive, true)).limit(1);
    if (rows.length === 0) return null;
    return rowToPolicy(rows[0]!);
  }

  async listAll(): Promise<RankingPolicy[]> {
    const rows = await db.select().from(rankingPolicies).orderBy(desc(rankingPolicies.version));
    return rows.map(rowToPolicy);
  }

  async create(data: { name: string; weights: PolicyWeights }): Promise<RankingPolicy> {
    return await db.transaction(async (tx) => {
      // Desactivar todas as políticas anteriores
      await tx.update(rankingPolicies).set({ isActive: false });

      // Calcular próxima versão
      const existing = await tx.select({ version: rankingPolicies.version }).from(rankingPolicies).orderBy(desc(rankingPolicies.version)).limit(1);
      const nextVersion = existing.length > 0 ? existing[0]!.version + 1 : 1;

      const rows = await tx
        .insert(rankingPolicies)
        .values({
          version: nextVersion,
          name: data.name,
          weightsJson: JSON.stringify(data.weights),
          isActive: true,
        })
        .returning();

      return rowToPolicy(rows[0]!);
    });
  }
}
