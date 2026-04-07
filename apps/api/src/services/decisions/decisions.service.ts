/**
 * DecisionsService — FR20, FR29, FR30.
 * Regista decisões com racional e emite eventos de auditoria.
 */
import type { IDecisionRepository, IAuditRepository, DecisionInput, DecisionRecord, DecisionFilter } from "./ports.js";

export class DecisionsService {
  constructor(
    private readonly decisionRepo: IDecisionRepository,
    private readonly auditRepo: IAuditRepository,
  ) {}

  /**
   * Regista uma decisão (operar / não operar) com racional estruturado.
   * FR20: valida campos mínimos; persiste e emite evento de auditoria.
   */
  async recordDecision(input: DecisionInput, correlationId?: string): Promise<DecisionRecord> {
    if (!input.rationale || input.rationale.trim().length === 0) {
      throw Object.assign(new Error("O racional é obrigatório."), { code: "DECISION_RATIONALE_REQUIRED" });
    }
    if (!["operar", "nao_operar"].includes(input.decision)) {
      throw Object.assign(new Error("Decisão inválida: deve ser 'operar' ou 'nao_operar'."), {
        code: "DECISION_INVALID_TYPE",
      });
    }

    const record = await this.decisionRepo.create(input);

    // Emite evento de auditoria (FR29) — falha silenciosa para não bloquear a decisão
    await this.auditRepo
      .create({
        userId: input.userId,
        eventType: "decision.created",
        mode: input.mode,
        timeframe: input.timeframe,
        horizonte: input.horizonte,
        correlationId,
        entityId: record.id,
        entityType: "decision",
        payloadJson: JSON.stringify({
          decisionId: record.id,
          decision: record.decision,
          symbolInternal: record.symbolInternal,
          timeframe: record.timeframe,
          horizonte: record.horizonte,
          mode: record.mode,
          rationale: record.rationale,
        }),
      })
      .catch((err: unknown) => {
        console.error("audit: falha ao registar evento decision.created", err);
      });

    return record;
  }

  /** FR30 — histórico consultável de decisões com filtros. */
  async listDecisions(userId: string, filter?: DecisionFilter): Promise<DecisionRecord[]> {
    return this.decisionRepo.findByUserId(userId, filter);
  }

  async getDecision(id: string): Promise<DecisionRecord | null> {
    return this.decisionRepo.findById(id);
  }
}
