import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { connectorHealth } from "../db/schema.js";
import type { ConnectorHealthRecord, ConnectorState, IConnectorHealthRepository } from "../services/market-data/ports.js";

function rowToRecord(r: typeof connectorHealth.$inferSelect): ConnectorHealthRecord {
  return {
    connectorId: r.connectorId,
    state: r.state as ConnectorState,
    lastHeartbeatAt: r.lastHeartbeatAt?.toISOString() ?? null,
    latencyMs: r.latencyMs,
    updatedAt: r.updatedAt.toISOString(),
  };
}

export class DrizzleConnectorHealthRepository implements IConnectorHealthRepository {
  async upsert(input: {
    connectorId: string;
    state: ConnectorState;
    lastHeartbeatAt: Date;
    latencyMs?: number | null;
  }): Promise<void> {
    const [existing] = await db
      .select()
      .from(connectorHealth)
      .where(eq(connectorHealth.connectorId, input.connectorId))
      .limit(1);
    if (existing) {
      await db
        .update(connectorHealth)
        .set({
          state: input.state,
          lastHeartbeatAt: input.lastHeartbeatAt,
          latencyMs: input.latencyMs ?? null,
          updatedAt: new Date(),
        })
        .where(eq(connectorHealth.connectorId, input.connectorId));
    } else {
      await db.insert(connectorHealth).values({
        connectorId: input.connectorId,
        state: input.state,
        lastHeartbeatAt: input.lastHeartbeatAt,
        latencyMs: input.latencyMs ?? null,
      });
    }
  }

  async listAll(): Promise<ConnectorHealthRecord[]> {
    const rows = await db.select().from(connectorHealth);
    return rows.map(rowToRecord);
  }
}
