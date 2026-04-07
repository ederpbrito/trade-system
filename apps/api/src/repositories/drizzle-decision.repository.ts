import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/client.js";
import { decisionLog } from "../db/schema.js";
import type { IDecisionRepository, DecisionInput, DecisionRecord, DecisionFilter } from "../services/decisions/ports.js";

export class DrizzleDecisionRepository implements IDecisionRepository {
  async create(input: DecisionInput): Promise<DecisionRecord> {
    const [row] = await db
      .insert(decisionLog)
      .values({
        userId: input.userId,
        decision: input.decision,
        instrumentId: input.instrumentId,
        symbolInternal: input.symbolInternal,
        timeframe: input.timeframe ?? null,
        horizonte: input.horizonte ?? null,
        candidateId: input.candidateId ?? null,
        orderIntentId: input.orderIntentId ?? null,
        rationale: input.rationale,
        tagsJson: input.tags ? JSON.stringify(input.tags) : null,
        note: input.note ?? null,
        mode: input.mode,
      })
      .returning();
    return this.toRecord(row);
  }

  async findById(id: string): Promise<DecisionRecord | null> {
    const [row] = await db.select().from(decisionLog).where(eq(decisionLog.id, id));
    return row ? this.toRecord(row) : null;
  }

  async findByUserId(userId: string, filter?: DecisionFilter): Promise<DecisionRecord[]> {
    const conditions = [eq(decisionLog.userId, userId)];

    if (filter?.symbolInternal) {
      conditions.push(eq(decisionLog.symbolInternal, filter.symbolInternal));
    }
    if (filter?.from) {
      const d = new Date(filter.from);
      if (!isNaN(d.getTime())) conditions.push(gte(decisionLog.createdAt, d));
    }
    if (filter?.to) {
      const d = new Date(filter.to);
      if (!isNaN(d.getTime())) conditions.push(lte(decisionLog.createdAt, d));
    }

    const query = db
      .select()
      .from(decisionLog)
      .where(and(...conditions))
      .orderBy(desc(decisionLog.createdAt))
      .limit(filter?.limit ?? 100)
      .offset(filter?.offset ?? 0);

    const rows = await query;
    return rows.map((r) => this.toRecord(r));
  }

  private toRecord(row: typeof decisionLog.$inferSelect): DecisionRecord {
    return {
      id: row.id,
      userId: row.userId,
      decision: row.decision,
      instrumentId: row.instrumentId,
      symbolInternal: row.symbolInternal,
      timeframe: row.timeframe,
      horizonte: row.horizonte,
      candidateId: row.candidateId,
      orderIntentId: row.orderIntentId,
      rationale: row.rationale,
      tagsJson: row.tagsJson,
      note: row.note,
      mode: row.mode as "demo" | "production",
      createdAt: row.createdAt,
    };
  }
}
