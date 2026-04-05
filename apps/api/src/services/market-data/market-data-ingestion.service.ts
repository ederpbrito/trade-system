import type { MarketDataProvider } from "./ports.js";
import type { IConnectorHealthRepository } from "./ports.js";
import type { IInstrumentRepository } from "./ports.js";
import type { IOhlcBarRepository } from "./ports.js";

export type IngestionBarSummary = {
  symbolInternal: string;
  timeframe: string;
  close: number;
  tsOpen: string;
};

export type IngestionResult = {
  barsWritten: number;
  connectorId: string;
  health: { state: string; latencyMs: number };
  barSummaries: IngestionBarSummary[];
};

export class MarketDataIngestionService {
  constructor(
    private readonly instruments: IInstrumentRepository,
    private readonly ohlc: IOhlcBarRepository,
    private readonly healthRepo: IConnectorHealthRepository,
  ) {}

  async runIngestion(provider: MarketDataProvider): Promise<IngestionResult> {
    const { bars, health } = await provider.pullBars();
    const heartbeat = new Date();

    await this.healthRepo.upsert({
      connectorId: provider.connectorId,
      state: health.state,
      lastHeartbeatAt: heartbeat,
      latencyMs: health.latencyMs,
    });

    let barsWritten = 0;
    const barSummaries: IngestionBarSummary[] = [];
    for (const b of bars) {
      const { id: instrumentId } = await this.instruments.upsertBySymbol({
        symbolInternal: b.symbolInternal,
        symbolMt5: b.symbolMt5,
        venue: b.venue,
        connectorId: provider.connectorId,
      });
      await this.ohlc.upsertBar({
        instrumentId,
        timeframe: b.timeframe,
        tsOpen: b.tsOpen,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume,
        source: provider.connectorId,
        qualityFlag: b.qualityFlag,
      });
      barsWritten += 1;
      barSummaries.push({
        symbolInternal: b.symbolInternal,
        timeframe: b.timeframe,
        close: b.close,
        tsOpen: b.tsOpen.toISOString(),
      });
    }

    return {
      barsWritten,
      connectorId: provider.connectorId,
      health: { state: health.state, latencyMs: health.latencyMs },
      barSummaries,
    };
  }
}
