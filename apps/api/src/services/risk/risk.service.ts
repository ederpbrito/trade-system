import type {
  AdherenceProposal,
  AdherenceResult,
  IRiskExceptionRepository,
  IRiskLimitsRepository,
  LimitViolation,
  RiskExceptionInput,
  RiskExceptionRecord,
  RiskLimits,
  RiskLimitsInput,
  RiskMetricsSnapshot,
} from "./ports.js";

/** Validação de entrada dos limites (tipos e intervalos). */
function validateLimitsInput(input: RiskLimitsInput): string[] {
  const errors: string[] = [];

  if (input.maxPositionSize !== undefined && input.maxPositionSize !== null) {
    if (typeof input.maxPositionSize !== "number" || input.maxPositionSize <= 0) {
      errors.push("maxPositionSize deve ser um número positivo.");
    }
  }
  if (input.maxDailyLoss !== undefined && input.maxDailyLoss !== null) {
    if (typeof input.maxDailyLoss !== "number" || input.maxDailyLoss <= 0) {
      errors.push("maxDailyLoss deve ser um número positivo.");
    }
  }
  if (input.maxConcentration !== undefined && input.maxConcentration !== null) {
    if (typeof input.maxConcentration !== "number" || input.maxConcentration <= 0 || input.maxConcentration > 1) {
      errors.push("maxConcentration deve ser um número entre 0 (exclusivo) e 1 (inclusivo).");
    }
  }
  if (input.maxTotalExposure !== undefined && input.maxTotalExposure !== null) {
    if (typeof input.maxTotalExposure !== "number" || input.maxTotalExposure <= 0) {
      errors.push("maxTotalExposure deve ser um número positivo.");
    }
  }

  return errors;
}

const LIMIT_LABELS: Record<LimitViolation["limitKey"], string> = {
  maxPositionSize: "Tamanho máximo de posição",
  maxDailyLoss: "Perda diária máxima",
  maxConcentration: "Concentração máxima por ativo",
  maxTotalExposure: "Exposição total máxima",
};

/**
 * Serviço de risco — FR13, FR14, FR15, FR16, FR35.
 * Responsabilidades:
 *  - Persistir e recuperar limites por utilizador (4.1)
 *  - Calcular aderência pré-decisão (4.2)
 *  - Registar exceções aprovadas ou bloqueios (4.3)
 */
export class RiskService {
  constructor(
    private readonly limitsRepo: IRiskLimitsRepository,
    private readonly exceptionRepo: IRiskExceptionRepository,
  ) {}

  /** FR13/FR35 — obter limites do utilizador (null se não configurados). */
  async getLimits(userId: string): Promise<RiskLimits | null> {
    return this.limitsRepo.findByUserId(userId);
  }

  /**
   * FR13/FR35 — persistir limites com validação de tipos e intervalos.
   * Lança erro com mensagens acessíveis (UX-DR13) se inválido.
   */
  async setLimits(userId: string, input: RiskLimitsInput): Promise<RiskLimits> {
    const errors = validateLimitsInput(input);
    if (errors.length > 0) {
      throw Object.assign(new Error(errors.join(" ")), { code: "RISK_LIMITS_INVALID", errors });
    }
    return this.limitsRepo.upsert(userId, input);
  }

  /**
   * FR14/FR16 — calcular aderência de uma proposta aos limites configurados.
   * Devolve ok=true se nenhum limite é violado; violations lista cada infração.
   * before: estado das métricas antes da operação (sem a proposta).
   * after: estado estimado após aplicar a proposta (posição + perda acumulada).
   */
  checkAdherence(limits: RiskLimits | null, proposal: AdherenceProposal): AdherenceResult {
    const violations: LimitViolation[] = [];

    if (limits) {
      if (limits.maxPositionSize !== null && proposal.positionSize !== undefined) {
        if (proposal.positionSize > limits.maxPositionSize) {
          violations.push({
            limitKey: "maxPositionSize",
            proposedValue: proposal.positionSize,
            limitValue: limits.maxPositionSize,
            label: LIMIT_LABELS.maxPositionSize,
          });
        }
      }

      if (limits.maxDailyLoss !== null && proposal.currentDailyLoss !== undefined) {
        if (proposal.currentDailyLoss > limits.maxDailyLoss) {
          violations.push({
            limitKey: "maxDailyLoss",
            proposedValue: proposal.currentDailyLoss,
            limitValue: limits.maxDailyLoss,
            label: LIMIT_LABELS.maxDailyLoss,
          });
        }
      }

      if (limits.maxConcentration !== null && proposal.concentration !== undefined) {
        if (proposal.concentration > limits.maxConcentration) {
          violations.push({
            limitKey: "maxConcentration",
            proposedValue: proposal.concentration,
            limitValue: limits.maxConcentration,
            label: LIMIT_LABELS.maxConcentration,
          });
        }
      }

      if (limits.maxTotalExposure !== null && proposal.totalExposure !== undefined) {
        if (proposal.totalExposure > limits.maxTotalExposure) {
          violations.push({
            limitKey: "maxTotalExposure",
            proposedValue: proposal.totalExposure,
            limitValue: limits.maxTotalExposure,
            label: LIMIT_LABELS.maxTotalExposure,
          });
        }
      }
    }

    /**
     * FR16: before representa o estado antes de executar a proposta;
     * after estima o estado após a operação (acumula perda diária e exposição).
     */
    const before: RiskMetricsSnapshot = {
      positionSize: 0,
      price: proposal.price,
      currentDailyLoss: proposal.currentDailyLoss,
      concentration: proposal.concentration,
      totalExposure: proposal.totalExposure,
    };
    const after: RiskMetricsSnapshot = {
      positionSize: proposal.positionSize,
      price: proposal.price,
      currentDailyLoss: proposal.currentDailyLoss,
      concentration: proposal.concentration,
      totalExposure: proposal.totalExposure,
    };

    return {
      ok: violations.length === 0,
      violations,
      before,
      after,
    };
  }

  /**
   * FR15/FR29 — registar exceção aprovada pelo utilizador.
   * O motivo é obrigatório; o registo fica na trilha auditável.
   */
  async recordException(input: RiskExceptionInput): Promise<RiskExceptionRecord> {
    if (!input.reason || input.reason.trim().length === 0) {
      throw Object.assign(new Error("O motivo de exceção é obrigatório."), { code: "RISK_EXCEPTION_REASON_REQUIRED" });
    }
    return this.exceptionRepo.create({ ...input, approved: true });
  }

  /**
   * FR15 — registar bloqueio (exceção não aprovada, sem motivo do utilizador).
   * Usado para auditoria quando o sistema bloqueia automaticamente.
   */
  async recordBlock(input: Omit<RiskExceptionInput, "reason">): Promise<RiskExceptionRecord> {
    return this.exceptionRepo.create({ ...input, reason: "bloqueio-automático", approved: false });
  }

  async getExceptionLog(userId: string, limit?: number): Promise<RiskExceptionRecord[]> {
    return this.exceptionRepo.findByUserId(userId, limit);
  }
}
