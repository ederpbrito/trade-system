import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { instruments } from "../db/schema.js";
import type { IInstrumentRepository } from "../services/market-data/ports.js";

export class DrizzleInstrumentRepository implements IInstrumentRepository {
  async upsertBySymbol(input: {
    symbolInternal: string;
    symbolMt5: string | null;
    venue: string | null;
    connectorId: string;
  }): Promise<{ id: string }> {
    const now = new Date();
    const [existing] = await db
      .select()
      .from(instruments)
      .where(eq(instruments.symbolInternal, input.symbolInternal))
      .limit(1);
    if (existing) {
      await db
        .update(instruments)
        .set({
          symbolMt5: input.symbolMt5,
          venue: input.venue,
          connectorId: input.connectorId,
          updatedAt: now,
        })
        .where(eq(instruments.id, existing.id));
      return { id: existing.id };
    }
    const [inserted] = await db
      .insert(instruments)
      .values({
        symbolInternal: input.symbolInternal,
        symbolMt5: input.symbolMt5,
        venue: input.venue,
        connectorId: input.connectorId,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: instruments.id });
    return { id: inserted!.id };
  }

  async findIdBySymbol(symbolInternal: string): Promise<string | null> {
    const [row] = await db
      .select({ id: instruments.id })
      .from(instruments)
      .where(eq(instruments.symbolInternal, symbolInternal))
      .limit(1);
    return row?.id ?? null;
  }

  async listAllMinimal() {
    const rows = await db
      .select({
        id: instruments.id,
        symbolInternal: instruments.symbolInternal,
        connectorId: instruments.connectorId,
      })
      .from(instruments);
    return rows;
  }
}
