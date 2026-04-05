export type ConnectorState = "operational" | "degraded" | "unavailable";

export type ConnectorHealthRecord = {
  connectorId: string;
  state: ConnectorState;
  lastHeartbeatAt: string | null;
  latencyMs: number | null;
  updatedAt: string;
};

export interface IConnectorHealthRepository {
  upsert(input: {
    connectorId: string;
    state: ConnectorState;
    lastHeartbeatAt: Date;
    latencyMs?: number | null;
  }): Promise<void>;
  listAll(): Promise<ConnectorHealthRecord[]>;
}

export type InstrumentMinimal = {
  id: string;
  symbolInternal: string;
  connectorId: string;
};

export interface IInstrumentRepository {
  upsertBySymbol(input: {
    symbolInternal: string;
    symbolMt5: string | null;
    venue: string | null;
    connectorId: string;
  }): Promise<{ id: string }>;
  findIdBySymbol(symbolInternal: string): Promise<string | null>;
  listAllMinimal(): Promise<InstrumentMinimal[]>;
}

export type OhlcBarInput = {
  instrumentId: string;
  timeframe: string;
  tsOpen: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  source: string;
  qualityFlag: string | null;
};

export interface IOhlcBarRepository {
  upsertBar(bar: OhlcBarInput): Promise<void>;
  latestTsOpenForInstrument(instrumentId: string): Promise<Date | null>;
  /** Último `ts_open` por instrumento (uma query; evita N+1). */
  latestTsOpenForInstrumentIds(instrumentIds: string[]): Promise<Map<string, Date | null>>;
}

export type MarketSyncHealth = {
  state: ConnectorState;
  latencyMs: number;
};

export type MarketSyncBar = {
  symbolInternal: string;
  symbolMt5: string | null;
  venue: string | null;
  timeframe: string;
  tsOpen: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  qualityFlag: string | null;
};

export interface MarketDataProvider {
  readonly connectorId: string;
  /** Uma passagem de ingestão: barras + estado de saúde da fonte */
  pullBars(): Promise<{ bars: MarketSyncBar[]; health: MarketSyncHealth }>;
}
