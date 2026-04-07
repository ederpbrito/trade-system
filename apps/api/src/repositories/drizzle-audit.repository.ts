import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/client.js";
import { auditEvents } from "../db/schema.js";
import type { IAuditRepository, AuditEventInput, AuditEventRecord, AuditFilter } from "../services/decisions/ports.js";

export class DrizzleAuditRepository implements IAuditRepository {
  async create(input: AuditEventInput): Promise<AuditEventRecord> {
    const [row] = await db
      .insert(auditEvents)
      .values({
        userId: input.userId,
        eventType: input.eventType,
        mode: input.mode,
        timeframe: input.timeframe ?? null,
        horizonte: input.horizonte ?? null,
        correlationId: input.correlationId ?? null,
        entityId: input.entityId ?? null,
        entityType: input.entityType ?? null,
        payloadJson: input.payloadJson,
      })
      .returning();
    return this.toRecord(row);
  }

  async findByUserId(userId: string, filter?: AuditFilter): Promise<AuditEventRecord[]> {
    const conditions = [eq(auditEvents.userId, userId)];

    if (filter?.eventType) {
      conditions.push(eq(auditEvents.eventType, filter.eventType));
    }
    if (filter?.from) {
      const d = new Date(filter.from);
      if (!isNaN(d.getTime())) conditions.push(gte(auditEvents.occurredAt, d));
    }
    if (filter?.to) {
      const d = new Date(filter.to);
      if (!isNaN(d.getTime())) conditions.push(lte(auditEvents.occurredAt, d));
    }

    const rows = await db
      .select()
      .from(auditEvents)
      .where(and(...conditions))
      .orderBy(desc(auditEvents.occurredAt))
      .limit(filter?.limit ?? 200);

    return rows.map((r) => this.toRecord(r));
  }

  private toRecord(row: typeof auditEvents.$inferSelect): AuditEventRecord {
    return {
      id: row.id,
      userId: row.userId,
      eventType: row.eventType,
      mode: row.mode as "demo" | "production",
      timeframe: row.timeframe,
      horizonte: row.horizonte,
      correlationId: row.correlationId,
      entityId: row.entityId,
      entityType: row.entityType,
      payloadJson: row.payloadJson,
      occurredAt: row.occurredAt,
    };
  }
}
