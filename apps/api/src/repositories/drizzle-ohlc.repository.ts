import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { ohlcBars } from "../db/schema.js";
import type { IOhlcBarRepository, OhlcBarInput } from "../services/market-data/ports.js";

export class DrizzleOhlcRepository implements IOhlcBarRepository {
  async upsertBar(bar: OhlcBarInput): Promise<void> {
    const [existing] = await db
      .select()
      .from(ohlcBars)
      .where(
        and(
          eq(ohlcBars.instrumentId, bar.instrumentId),
          eq(ohlcBars.timeframe, bar.timeframe),
          eq(ohlcBars.tsOpen, bar.tsOpen),
        ),
      )
      .limit(1);
    if (existing) {
      await db
        .update(ohlcBars)
        .set({
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume,
          source: bar.source,
          qualityFlag: bar.qualityFlag,
        })
        .where(eq(ohlcBars.id, existing.id));
      return;
    }
    await db.insert(ohlcBars).values({
      instrumentId: bar.instrumentId,
      timeframe: bar.timeframe,
      tsOpen: bar.tsOpen,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume,
      source: bar.source,
      qualityFlag: bar.qualityFlag,
    });
  }

  async latestTsOpenForInstrument(instrumentId: string): Promise<Date | null> {
    const [row] = await db
      .select({ tsOpen: ohlcBars.tsOpen })
      .from(ohlcBars)
      .where(eq(ohlcBars.instrumentId, instrumentId))
      .orderBy(desc(ohlcBars.tsOpen))
      .limit(1);
    return row?.tsOpen ?? null;
  }

  async latestTsOpenForInstrumentIds(instrumentIds: string[]): Promise<Map<string, Date | null>> {
    const map = new Map<string, Date | null>();
    for (const id of instrumentIds) {
      map.set(id, null);
    }
    if (instrumentIds.length === 0) return map;

    const rows = await db
      .selectDistinctOn([ohlcBars.instrumentId], {
        instrumentId: ohlcBars.instrumentId,
        tsOpen: ohlcBars.tsOpen,
      })
      .from(ohlcBars)
      .where(inArray(ohlcBars.instrumentId, instrumentIds))
      .orderBy(ohlcBars.instrumentId, desc(ohlcBars.tsOpen));

    for (const r of rows) {
      map.set(r.instrumentId, r.tsOpen);
    }
    return map;
  }
}
