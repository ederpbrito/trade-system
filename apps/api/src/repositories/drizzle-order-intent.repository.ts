import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { orderIntents } from "../db/schema.js";
import type { IOrderIntentRepository, OrderIntentFilter, OrderIntentInput, OrderIntentRecord, TradingMode } from "../services/trading-mode/ports.js";

export class DrizzleOrderIntentRepository implements IOrderIntentRepository {
  async create(
    input: OrderIntentInput & {
      mode: TradingMode;
      connectorResponseJson: string;
      status: string;
    },
  ): Promise<OrderIntentRecord> {
    const [row] = await db
      .insert(orderIntents)
      .values({
        userId: input.userId,
        instrumentId: input.instrumentId,
        symbolInternal: input.symbolInternal,
        side: input.side,
        quantity: input.quantity,
        price: input.price ?? null,
        mode: input.mode,
        timeframe: input.timeframe ?? null,
        horizonte: input.horizonte ?? null,
        candidateId: input.candidateId ?? null,
        connectorResponseJson: input.connectorResponseJson,
        status: input.status,
        idempotencyKey: input.idempotencyKey ?? null,
      })
      .returning();
    return this.toRecord(row);
  }

  async findById(id: string): Promise<OrderIntentRecord | null> {
    const [row] = await db.select().from(orderIntents).where(eq(orderIntents.id, id));
    return row ? this.toRecord(row) : null;
  }

  async findByIdempotencyKey(key: string, userId: string): Promise<OrderIntentRecord | null> {
    const [row] = await db
      .select()
      .from(orderIntents)
      .where(and(eq(orderIntents.idempotencyKey, key), eq(orderIntents.userId, userId)));
    return row ? this.toRecord(row) : null;
  }

  async findByUserId(userId: string, filter?: OrderIntentFilter): Promise<OrderIntentRecord[]> {
    const rows = await db
      .select()
      .from(orderIntents)
      .where(eq(orderIntents.userId, userId))
      .orderBy(desc(orderIntents.createdAt))
      .limit(filter?.limit ?? 100)
      .offset(filter?.offset ?? 0);
    return rows.map((r) => this.toRecord(r));
  }

  private toRecord(row: typeof orderIntents.$inferSelect): OrderIntentRecord {
    return {
      id: row.id,
      userId: row.userId,
      instrumentId: row.instrumentId,
      symbolInternal: row.symbolInternal,
      side: row.side,
      quantity: row.quantity,
      price: row.price,
      mode: row.mode,
      timeframe: row.timeframe,
      horizonte: row.horizonte,
      candidateId: row.candidateId,
      connectorResponseJson: row.connectorResponseJson,
      status: row.status,
      idempotencyKey: row.idempotencyKey,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
