/**
 * Rotas de execução — FR17, FR18, FR19.
 * POST /api/v1/execution/intent — submete intenção de execução (demo ou produção).
 * GET  /api/v1/execution/mode   — devolve o modo actual da instância.
 */
import type { FastifyInstance } from "fastify";
import type { TradingModeService } from "../../services/trading-mode/trading-mode.service.js";
import type { IAuditRepository } from "../../services/decisions/ports.js";

type ExecutionRoutesOptions = {
  tradingModeService: TradingModeService;
  auditRepo: IAuditRepository;
};

export default async function executionRoutes(app: FastifyInstance, opts: ExecutionRoutesOptions) {
  const { tradingModeService, auditRepo } = opts;

  /** FR18 — GET modo actual da instância */
  app.get("/api/v1/execution/mode", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }
    return reply.send({ mode: tradingModeService.currentMode });
  });

  /**
   * FR17 — POST intenção de execução.
   * Body: { instrumentId, symbolInternal, side, quantity, price?, timeframe?, horizonte?, candidateId?, idempotencyKey? }
   * FR19: se modo for "production", rejeita com PRODUCTION_GATE_BLOCKED (gate não implementado no MVP).
   */
  app.post("/api/v1/execution/intent", async (req, reply) => {
    const userId = req.session.get("userId") as string | undefined;
    if (!userId) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Não autenticado.", requestId: req.id } });
    }

    // FR19: gate de produção — bloquear execução real no MVP
    if (tradingModeService.currentMode === "production") {
      return reply.status(403).send({
        error: {
          code: "PRODUCTION_GATE_BLOCKED",
          message: "Execução em produção está bloqueada. Critérios de desbloqueio não satisfeitos no MVP.",
          pendingCriteria: ["Validação manual de configuração de produção", "Aprovação explícita de modo produção"],
          requestId: req.id,
        },
      });
    }

    const body = req.body as {
      instrumentId: string;
      symbolInternal: string;
      side: string;
      quantity: number;
      price?: number;
      timeframe?: string;
      horizonte?: string;
      candidateId?: string;
      idempotencyKey?: string;
    };

    if (!body.instrumentId || !body.symbolInternal || !body.side || body.quantity == null) {
      return reply.status(422).send({
        error: {
          code: "INTENT_MISSING_FIELDS",
          message: "Campos obrigatórios em falta: instrumentId, symbolInternal, side, quantity.",
          requestId: req.id,
        },
      });
    }

    try {
      const { record, idempotent } = await tradingModeService.submitIntent({
        userId,
        instrumentId: body.instrumentId,
        symbolInternal: body.symbolInternal,
        side: body.side as "buy" | "sell",
        quantity: body.quantity,
        price: body.price,
        timeframe: body.timeframe,
        horizonte: body.horizonte,
        candidateId: body.candidateId,
        idempotencyKey: body.idempotencyKey,
      });

      // Emite evento de auditoria (FR29) — apenas para novas intenções, não para hits idempotentes
      if (!idempotent) {
        await auditRepo
          .create({
            userId,
            eventType: "execution.intent",
            mode: record.mode,
            timeframe: record.timeframe ?? undefined,
            horizonte: record.horizonte ?? undefined,
            correlationId: req.id,
            entityId: record.id,
            entityType: "order_intent",
            payloadJson: JSON.stringify({
              intentId: record.id,
              symbolInternal: record.symbolInternal,
              side: record.side,
              quantity: record.quantity,
              mode: record.mode,
              status: record.status,
            }),
          })
          .catch((err: unknown) => {
            app.log.error({ err }, "audit: falha ao registar evento execution.intent");
          });
      }

      return reply.status(201).send({ intent: record });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "INTENT_INVALID_QUANTITY" || e.code === "INTENT_INVALID_SIDE") {
        return reply.status(422).send({
          error: { code: e.code, message: e.message ?? "Dados inválidos.", requestId: req.id },
        });
      }
      throw err;
    }
  });
}
