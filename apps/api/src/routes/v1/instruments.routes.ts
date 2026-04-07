import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { WatchlistService } from "../../services/watchlist/watchlist.service.js";
import { sendError } from "../../shared/errors.js";

export type InstrumentsRoutesOptions = {
  watchlist: WatchlistService;
};

const instrumentsRoutes: FastifyPluginAsync<InstrumentsRoutesOptions> = async (app, opts) => {
  app.get("/api/v1/instruments", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const instruments = await opts.watchlist.listInstrumentCatalog();
    return reply.send({ instruments });
  });
};

export default fp(instrumentsRoutes, { name: "instruments-routes" });
