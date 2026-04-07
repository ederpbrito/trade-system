import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { z } from "zod";
import type { WatchlistService } from "../../services/watchlist/watchlist.service.js";
import { sendError } from "../../shared/errors.js";

const createBodySchema = z.object({
  instrumentId: z.string().uuid(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const patchBodySchema = z.object({
  priority: z.enum(["low", "medium", "high"]),
});

const entryIdSchema = z.string().uuid();

export type WatchlistRoutesOptions = {
  watchlist: WatchlistService;
};

const watchlistRoutes: FastifyPluginAsync<WatchlistRoutesOptions> = async (app, opts) => {
  app.get("/api/v1/watchlist", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const entries = await opts.watchlist.listForUser(userId);
    return reply.send({ entries });
  });

  app.post("/api/v1/watchlist", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const parsed = createBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Corpo inválido.", request.requestId);
    }
    try {
      const row = await opts.watchlist.add(userId, parsed.data.instrumentId, parsed.data.priority ?? "medium");
      const list = await opts.watchlist.listForUser(userId);
      const entry = list.find((e) => e.id === row.id) ?? null;
      return reply.status(201).send({ entry });
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "INSTRUMENT_NOT_FOUND") {
        return sendError(reply, 404, "NOT_FOUND", "Instrumento não existe no catálogo.", request.requestId);
      }
      throw e;
    }
  });

  app.patch("/api/v1/watchlist/:entryId", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const entryIdParsed = entryIdSchema.safeParse((request.params as { entryId: string }).entryId);
    if (!entryIdParsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "entryId inválido.", request.requestId);
    }
    const entryId = entryIdParsed.data;
    const parsed = patchBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "Corpo inválido.", request.requestId);
    }
    const row = await opts.watchlist.updatePriority(userId, entryId, parsed.data.priority);
    if (!row) {
      return sendError(reply, 404, "NOT_FOUND", "Entrada não encontrada.", request.requestId);
    }
    return reply.send({ entry: row });
  });

  app.delete("/api/v1/watchlist/:entryId", async (request, reply) => {
    const userId = request.session.get("userId") as string | undefined;
    if (!userId) {
      return sendError(reply, 401, "UNAUTHORIZED", "Sessão necessária.", request.requestId);
    }
    const entryIdParsed = entryIdSchema.safeParse((request.params as { entryId: string }).entryId);
    if (!entryIdParsed.success) {
      return sendError(reply, 400, "VALIDATION_ERROR", "entryId inválido.", request.requestId);
    }
    const entryId = entryIdParsed.data;
    const ok = await opts.watchlist.remove(userId, entryId);
    if (!ok) {
      return sendError(reply, 404, "NOT_FOUND", "Entrada não encontrada.", request.requestId);
    }
    return reply.status(204).send();
  });
};

export default fp(watchlistRoutes, { name: "watchlist-routes" });
