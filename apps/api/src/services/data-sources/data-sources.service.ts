import type { IConnectorHealthRepository } from "../market-data/ports.js";

export type DataSourceHealthDto = {
  connectorId: string;
  state: string;
  lastHeartbeatAt: string | null;
  latencyMs: number | null;
  updatedAt: string;
};

export class DataSourcesService {
  constructor(private readonly health: IConnectorHealthRepository) {}

  async listHealth(): Promise<{ sources: DataSourceHealthDto[] }> {
    const rows = await this.health.listAll();
    return {
      sources: rows.map((r) => ({
        connectorId: r.connectorId,
        state: r.state,
        lastHeartbeatAt: r.lastHeartbeatAt,
        latencyMs: r.latencyMs,
        updatedAt: r.updatedAt,
      })),
    };
  }
}
