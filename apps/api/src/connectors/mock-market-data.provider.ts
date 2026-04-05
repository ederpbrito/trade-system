import type { MarketDataProvider, MarketSyncBar, MarketSyncHealth, ConnectorState } from "../services/market-data/ports.js";

export type MockFailureMode = "none" | "degraded" | "unavailable";

export type MockMarketDataOptions = {
  connectorId?: string;
  simulateFailure?: MockFailureMode;
};

const DEFAULT_SYMBOLS = [
  { symbolInternal: "EURUSD_TEST", symbolMt5: "EURUSD", venue: "FX" },
  { symbolInternal: "XAUUSD_TEST", symbolMt5: "XAUUSD", venue: "COMEX" },
];

/**
 * Fonte mock configurável (FR25/26/27): gera barras 1h de teste e simula falhas de saúde.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  readonly connectorId: string;
  private readonly simulateFailure: MockFailureMode;

  constructor(opts: MockMarketDataOptions = {}) {
    this.connectorId = opts.connectorId ?? "mock";
    this.simulateFailure = opts.simulateFailure ?? "none";
  }

  private healthFromSimulation(): MarketSyncHealth {
    const baseLatency = 12;
    if (this.simulateFailure === "unavailable") {
      return { state: "unavailable", latencyMs: 9999 };
    }
    if (this.simulateFailure === "degraded") {
      return { state: "degraded", latencyMs: 850 };
    }
    return { state: "operational", latencyMs: baseLatency };
  }

  private barQuality(state: ConnectorState): string | null {
    if (state === "operational") return "ok";
    if (state === "degraded") return "stale_feed";
    return "no_feed";
  }

  async pullBars(): Promise<{ bars: MarketSyncBar[]; health: MarketSyncHealth }> {
    const health = this.healthFromSimulation();
    const now = new Date();
    const hourOpen = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), 0, 0, 0));
    const bars: MarketSyncBar[] = [];

    if (health.state === "unavailable") {
      return { bars: [], health };
    }

    for (const sym of DEFAULT_SYMBOLS) {
      const seed = sym.symbolInternal.length + hourOpen.getTime();
      const open = 1 + (seed % 100) / 10000;
      const close = open + ((seed >> 3) % 50) / 10000;
      const high = Math.max(open, close) + 0.0005;
      const low = Math.min(open, close) - 0.0005;
      bars.push({
        symbolInternal: sym.symbolInternal,
        symbolMt5: sym.symbolMt5,
        venue: sym.venue,
        timeframe: "1h",
        tsOpen: hourOpen,
        open,
        high,
        low,
        close,
        volume: 1000 + (seed % 500),
        qualityFlag: this.barQuality(health.state),
      });
    }

    return { bars, health };
  }
}
