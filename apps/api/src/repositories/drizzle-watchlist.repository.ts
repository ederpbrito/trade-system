import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { instruments, watchlistEntries } from "../db/schema.js";
import type { IWatchlistRepository, WatchlistEntryWithInstrument, WatchlistPriority } from "../services/watchlist/ports.js";

function marketFromRow(venue: string | null, connectorId: string): string {
  if (venue && venue.trim() !== "") return venue;
  return connectorId;
}

function mapRow(
  we: typeof watchlistEntries.$inferSelect,
  i: { symbolInternal: string; venue: string | null; connectorId: string },
): WatchlistEntryWithInstrument {
  return {
    id: we.id,
    userId: we.userId,
    instrumentId: we.instrumentId,
    priority: we.priority as WatchlistPriority,
    createdAt: we.createdAt,
    updatedAt: we.updatedAt,
    symbolInternal: i.symbolInternal,
    venue: i.venue,
    connectorId: i.connectorId,
    market: marketFromRow(i.venue, i.connectorId),
  };
}

export class DrizzleWatchlistRepository implements IWatchlistRepository {
  async listByUserId(userId: string): Promise<WatchlistEntryWithInstrument[]> {
    const rows = await db
      .select({
        we: watchlistEntries,
        symbolInternal: instruments.symbolInternal,
        venue: instruments.venue,
        connectorId: instruments.connectorId,
      })
      .from(watchlistEntries)
      .innerJoin(instruments, eq(watchlistEntries.instrumentId, instruments.id))
      .where(eq(watchlistEntries.userId, userId));

    return rows.map((r) => mapRow(r.we, r));
  }

  async create(userId: string, instrumentId: string, priority: WatchlistPriority): Promise<WatchlistEntryWithInstrument> {
    const now = new Date();
    return db.transaction(async (tx) => {
      const [we] = await tx
        .insert(watchlistEntries)
        .values({ userId, instrumentId, priority, createdAt: now, updatedAt: now })
        .returning();

      const [i] = await tx
        .select({
          symbolInternal: instruments.symbolInternal,
          venue: instruments.venue,
          connectorId: instruments.connectorId,
        })
        .from(instruments)
        .where(eq(instruments.id, instrumentId))
        .limit(1);

      if (!we || !i) {
        throw new Error("watchlist_insert_failed");
      }

      return mapRow(we, i);
    });
  }

  async updatePriority(
    userId: string,
    entryId: string,
    priority: WatchlistPriority,
  ): Promise<WatchlistEntryWithInstrument | null> {
    const now = new Date();
    const [updated] = await db
      .update(watchlistEntries)
      .set({ priority, updatedAt: now })
      .where(and(eq(watchlistEntries.id, entryId), eq(watchlistEntries.userId, userId)))
      .returning();

    if (!updated) return null;

    const [i] = await db
      .select({
        symbolInternal: instruments.symbolInternal,
        venue: instruments.venue,
        connectorId: instruments.connectorId,
      })
      .from(instruments)
      .where(eq(instruments.id, updated.instrumentId))
      .limit(1);

    if (!i) return null;
    return mapRow(updated, i);
  }

  async delete(userId: string, entryId: string): Promise<boolean> {
    const res = await db
      .delete(watchlistEntries)
      .where(and(eq(watchlistEntries.id, entryId), eq(watchlistEntries.userId, userId)))
      .returning({ id: watchlistEntries.id });
    return res.length > 0;
  }
}
