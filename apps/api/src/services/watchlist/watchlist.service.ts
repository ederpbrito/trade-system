import type { IOhlcBarRepository, IInstrumentRepository } from "../market-data/ports.js";
import type { IWatchlistRepository, WatchlistEntryWithInstrument, WatchlistPriority } from "./ports.js";

export type WatchlistEntryApi = {
  id: string;
  instrumentId: string;
  symbolInternal: string;
  market: string;
  priority: WatchlistPriority;
  lastClose: number | null;
  lastTsOpen: string | null;
  lastTimeframe: string | null;
  /** Variação percentual face à barra anterior (FR2). Null se não houver barra anterior. */
  changePercent: number | null;
};

/**
 * FR1 — CRUD da lista monitorizada; enriquecimento com última cotação (FR2 resumo).
 */
export class WatchlistService {
  constructor(
    private readonly watchlist: IWatchlistRepository,
    private readonly instruments: IInstrumentRepository,
    private readonly ohlc: IOhlcBarRepository,
  ) {}

  async listForUser(userId: string): Promise<WatchlistEntryApi[]> {
    const entries = await this.watchlist.listByUserId(userId);
    const ids = entries.map((e) => e.instrumentId);
    const bars = await this.ohlc.latestBarPerInstrumentIds(ids);

    return entries.map((e) => {
      const bar = bars.get(e.instrumentId) ?? null;
      let changePercent: number | null = null;
      if (bar && bar.previousClose != null && bar.previousClose !== 0) {
        changePercent = ((bar.close - bar.previousClose) / bar.previousClose) * 100;
      }
      return {
        id: e.id,
        instrumentId: e.instrumentId,
        symbolInternal: e.symbolInternal,
        market: e.market,
        priority: e.priority,
        lastClose: bar?.close ?? null,
        lastTsOpen: bar ? bar.tsOpen.toISOString() : null,
        lastTimeframe: bar?.timeframe ?? null,
        changePercent,
      };
    });
  }

  async add(userId: string, instrumentId: string, priority: WatchlistPriority): Promise<WatchlistEntryWithInstrument> {
    const inst = await this.instruments.findById(instrumentId);
    if (!inst) {
      const err = new Error("INSTRUMENT_NOT_FOUND") as Error & { code: string };
      err.code = "INSTRUMENT_NOT_FOUND";
      throw err;
    }
    return this.watchlist.create(userId, instrumentId, priority);
  }

  async updatePriority(
    userId: string,
    entryId: string,
    priority: WatchlistPriority,
  ): Promise<WatchlistEntryWithInstrument | null> {
    return this.watchlist.updatePriority(userId, entryId, priority);
  }

  async remove(userId: string, entryId: string): Promise<boolean> {
    return this.watchlist.delete(userId, entryId);
  }

  async listInstrumentCatalog() {
    return this.instruments.listCatalog();
  }
}
