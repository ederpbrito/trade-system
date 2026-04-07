import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { riskExceptionLog } from "../db/schema.js";
import type { IRiskExceptionRepository, RiskExceptionInput, RiskExceptionRecord } from "../services/risk/ports.js";

export class DrizzleRiskExceptionRepository implements IRiskExceptionRepository {
  async create(input: RiskExceptionInput & { approved: boolean }): Promise<RiskExceptionRecord> {
    const rows = await db
      .insert(riskExceptionLog)
      .values({
        userId: input.userId,
        limitKey: input.limitKey,
        proposedValue: input.proposedValue,
        limitValue: input.limitValue,
        reason: input.reason,
        contextJson: input.contextJson ?? null,
        approved: input.approved,
      })
      .returning();

    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      limitKey: row.limitKey,
      proposedValue: row.proposedValue,
      limitValue: row.limitValue,
      reason: row.reason,
      contextJson: row.contextJson,
      approved: row.approved,
      createdAt: row.createdAt,
    };
  }

  async findByUserId(userId: string, limit = 50): Promise<RiskExceptionRecord[]> {
    const rows = await db
      .select()
      .from(riskExceptionLog)
      .where(eq(riskExceptionLog.userId, userId))
      .orderBy(riskExceptionLog.createdAt)
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      limitKey: row.limitKey,
      proposedValue: row.proposedValue,
      limitValue: row.limitValue,
      reason: row.reason,
      contextJson: row.contextJson,
      approved: row.approved,
      createdAt: row.createdAt,
    }));
  }
}
