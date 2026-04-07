import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { riskLimits } from "../db/schema.js";
import type { IRiskLimitsRepository, RiskLimits, RiskLimitsInput } from "../services/risk/ports.js";

export class DrizzleRiskLimitsRepository implements IRiskLimitsRepository {
  async findByUserId(userId: string): Promise<RiskLimits | null> {
    const rows = await db.select().from(riskLimits).where(eq(riskLimits.userId, userId)).limit(1);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      userId: row.userId,
      maxPositionSize: row.maxPositionSize,
      maxDailyLoss: row.maxDailyLoss,
      maxConcentration: row.maxConcentration,
      maxTotalExposure: row.maxTotalExposure,
      updatedAt: row.updatedAt,
    };
  }

  async upsert(userId: string, input: RiskLimitsInput): Promise<RiskLimits> {
    const rows = await db
      .insert(riskLimits)
      .values({
        userId,
        maxPositionSize: input.maxPositionSize ?? null,
        maxDailyLoss: input.maxDailyLoss ?? null,
        maxConcentration: input.maxConcentration ?? null,
        maxTotalExposure: input.maxTotalExposure ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: riskLimits.userId,
        set: {
          maxPositionSize: input.maxPositionSize ?? null,
          maxDailyLoss: input.maxDailyLoss ?? null,
          maxConcentration: input.maxConcentration ?? null,
          maxTotalExposure: input.maxTotalExposure ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    const row = rows[0];
    return {
      userId: row.userId,
      maxPositionSize: row.maxPositionSize,
      maxDailyLoss: row.maxDailyLoss,
      maxConcentration: row.maxConcentration,
      maxTotalExposure: row.maxTotalExposure,
      updatedAt: row.updatedAt,
    };
  }
}
