export type WatchlistPriority = "low" | "medium" | "high";

export type WatchlistEntryWithInstrument = {
  id: string;
  userId: string;
  instrumentId: string;
  priority: WatchlistPriority;
  createdAt: Date;
  updatedAt: Date;
  symbolInternal: string;
  venue: string | null;
  connectorId: string;
  market: string;
};

export interface IWatchlistRepository {
  listByUserId(userId: string): Promise<WatchlistEntryWithInstrument[]>;
  create(userId: string, instrumentId: string, priority: WatchlistPriority): Promise<WatchlistEntryWithInstrument>;
  updatePriority(userId: string, entryId: string, priority: WatchlistPriority): Promise<WatchlistEntryWithInstrument | null>;
  delete(userId: string, entryId: string): Promise<boolean>;
}
