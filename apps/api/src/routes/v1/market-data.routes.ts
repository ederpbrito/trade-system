import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { z } from "zod";
import { MockMarketDataProvider } from "../../connectors/mock-market-data.provider.js";
import { broadcastEnvelope } from "../../composition/realtime-hub.js";
import type { MarketDataIngestionService } from "../../services/market-data/market-data-ingestion.service.js";
import { sendError } from "../../shared/errors.js";

const mockSyncBodySchema = z.object({
  simulateFailure: z.enum(["none", "degraded", "unavailable"]).optional(),
});

export type MarketDataRoutesOptions = {
  marketDataIngestion: MarketDataIngestionService;
};

const marketDataRoutes: FastifyPluginAsync<MarketDataRoutesOptions> = async (app, opts) => {
  app.post("/api/v1/market-data/mock/sync", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const parsed = mockSyncBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Corpo inválido.", request.requestId);
    }
    const simulateFailure = parsed.data.simulateFailure ?? "none";
    const provider = new MockMarketDataProvider({ simulateFailure });
    const result = await opts.marketDataIngestion.runIngestion(provider);

    for (const b of result.barSummaries) {
      broadcastEnvelope("market.tick", {
        symbolInternal: b.symbolInternal,
        timeframe: b.timeframe,
        close: b.close,
        tsOpen: b.tsOpen,
        connectorId: result.connectorId,
      });
    }
    broadcastEnvelope("source_health", {
      connectorId: result.connectorId,
      state: result.health.state,
      latencyMs: result.health.latencyMs,
    });

    return reply.send({
      ok: true,
      barsWritten: result.barsWritten,
      connectorId: result.connectorId,
      health: result.health,
    });
  });
};

export default fp(marketDataRoutes, { name: "market-data-routes" });
