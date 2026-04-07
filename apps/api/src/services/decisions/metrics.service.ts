/**
 * MetricsService — FR31.
 * Calcula agregados simples sobre decisões e execuções demo.
 * MVP: contagens por tipo, taxa de aderência ao plano, distribuição por modo.
 */
import type { IDecisionRepository } from "./ports.js";
import type { IOrderIntentRepository } from "../trading-mode/ports.js";

export type DecisionMetrics = {
  /** Total de decisões registadas */
  totalDecisions: number;
  /** Contagem por tipo de decisão */
  byDecision: { operar: number; nao_operar: number };
  /** Taxa de decisões "operar" (0–1) */
  operateRate: number;
  /** Contagem por modo */
  byMode: { demo: number; production: number };
  /** Total de intenções de execução demo */
  totalIntents: number;
  /** Intenções com status filled */
  filledIntents: number;
  /** Taxa de preenchimento de intenções (0–1) */
  fillRate: number;
  /** Período dos dados (ISO strings) */
  period: { from: string | null; to: string | null };
};

export class MetricsService {
  constructor(
    private readonly decisionRepo: IDecisionRepository,
    private readonly orderIntentRepo: IOrderIntentRepository,
  ) {}

  async getSummary(userId: string): Promise<DecisionMetrics> {
    const decisions = await this.decisionRepo.findByUserId(userId, { limit: 1000 });
    const intents = await this.orderIntentRepo.findByUserId(userId, { limit: 1000 });

    const byDecision = { operar: 0, nao_operar: 0 };
    const byMode = { demo: 0, production: 0 };

    for (const d of decisions) {
      if (d.decision === "operar") byDecision.operar++;
      else if (d.decision === "nao_operar") byDecision.nao_operar++;
      if (d.mode === "demo") byMode.demo++;
      else if (d.mode === "production") byMode.production++;
    }

    const totalDecisions = decisions.length;
    const operateRate = totalDecisions > 0 ? byDecision.operar / totalDecisions : 0;

    const filledIntents = intents.filter((i) => i.status === "filled").length;
    const totalIntents = intents.length;
    const fillRate = totalIntents > 0 ? filledIntents / totalIntents : 0;

    const allDates = [
      ...decisions.map((d) => d.createdAt),
      ...intents.map((i) => i.createdAt),
    ].sort((a, b) => a.getTime() - b.getTime());

    return {
      totalDecisions,
      byDecision,
      operateRate,
      byMode,
      totalIntents,
      filledIntents,
      fillRate,
      period: {
        from: allDates[0]?.toISOString() ?? null,
        to: allDates[allDates.length - 1]?.toISOString() ?? null,
      },
    };
  }
}
