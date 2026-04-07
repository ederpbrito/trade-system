/**
 * Rotas de decisões — FR20, FR30.
 * POST /api/v1/decisions       — regista decisão com racional.
 * GET  /api/v1/decisions       — histórico consultável com filtros.
 * GET  /api/v1/decisions/:id   — detalhe de uma decisão.
 */
import type { FastifyInstance } from "fastify";
import type { DecisionsService } from "../../services/decisions/decisions.service.js";
import type { TradingModeService } from "../../services/trading-mode/trading-mode.service.js";
import { parseLimit, parseOffset, parseDateParam } from "../../shared/query-params.js";

type DecisionsRoutesOptions = {
  decisionsService: DecisionsService;
  tradingModeService: TradingModeService;
};

export default async function decisionsRoutes(app: FastifyInstance, opts: DecisionsRoutesOptions) {
  const { decisionsService, tradingModeService } = opts;

  /**
   * FR20 — POST regista decisão com racional estruturado.
   * Body: { decision, instrumentId, symbolInternal, timeframe?, horizonte?, candidateId?,
   *         orderIntentId?, rationale, tags?, note? }
   */
  app.post("/api/v1/decisions", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    const body = req.body as {
      decision: string;
      instrumentId: string;
      symbolInternal: string;
      timeframe?: string;
      horizonte?: string;
      candidateId?: string;
      orderIntentId?: string;
      rationale: string;
      tags?: string[];
      note?: string;
    };

    if (!body.decision || !body.instrumentId || !body.symbolInternal || !body.rationale) {
      return reply.status(422).send({
        error: {
          code: "DECISION_MISSING_FIELDS",
          message: "Campos obrigatórios em falta: decision, instrumentId, symbolInternal, rationale.",
          requestId: req.id,
        },
      });
    }

    // Validar tags: deve ser array de strings ou ausente
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== "string")) {
        return reply.status(422).send({
          error: {
            code: "DECISION_INVALID_TAGS",
            message: "O campo 'tags' deve ser um array de strings.",
            requestId: req.id,
          },
        });
      }
    }

    try {
      const record = await decisionsService.recordDecision(
        {
          userId,
          decision: body.decision as "operar" | "nao_operar",
          instrumentId: body.instrumentId,
          symbolInternal: body.symbolInternal,
          timeframe: body.timeframe,
          horizonte: body.horizonte,
          candidateId: body.candidateId,
          orderIntentId: body.orderIntentId,
          rationale: body.rationale,
          tags: body.tags,
          note: body.note,
          mode: tradingModeService.currentMode,
        },
        req.id,
      );

      return reply.status(201).send({ decision: record });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "DECISION_RATIONALE_REQUIRED" || e.code === "DECISION_INVALID_TYPE") {
        return reply.status(422).send({
          error: { code: e.code, message: e.message ?? "Dados inválidos.", requestId: req.id },
        });
      }
      throw err;
    }
  });

  /**
   * FR30 — GET histórico de decisões com filtros.
   * Query: symbolInternal?, from?, to?, limit?, offset?
   */
  app.get("/api/v1/decisions", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    const query = req.query as {
      symbolInternal?: string;
      from?: string;
      to?: string;
      limit?: string;
      offset?: string;
    };

    try {
      const decisions = await decisionsService.listDecisions(userId, {
        symbolInternal: query.symbolInternal,
        from: parseDateParam(query.from, "from"),
        to: parseDateParam(query.to, "to"),
        limit: parseLimit(query.limit),
        offset: parseOffset(query.offset),
      });
      return reply.send({ decisions });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; param?: string };
      if (e.code === "INVALID_QUERY_PARAM") {
        return reply.status(422).send({ error: { code: e.code, message: e.message, param: e.param, requestId: req.id } });
      }
      throw err;
    }
  });

  /** FR30 — GET detalhe de uma decisão */
  app.get("/api/v1/decisions/:id", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    const { id } = req.params as { id: string };
    const decision = await decisionsService.getDecision(id);

    if (!decision) {
      return reply.status(404).send({
        error: { code: "DECISION_NOT_FOUND", message: "Decisão não encontrada.", requestId: req.id },
      });
    }

    // Garante que o utilizador só vê as suas próprias decisões
    if (decision.userId !== userId) {
      return reply.status(403).send({
        error: { code: "FORBIDDEN", message: "Acesso negado.", requestId: req.id },
      });
    }

    return reply.send({ decision });
  });
}
