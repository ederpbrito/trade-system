/**
 * Portas (interfaces) do domínio de risco.
 * FR13–FR16, FR15, FR29 — limites configuráveis, aderência e trilha de exceções.
 */

export type RiskLimits = {
  userId: string;
  maxPositionSize: number | null;
  maxDailyLoss: number | null;
  maxConcentration: number | null;
  maxTotalExposure: number | null;
  updatedAt: Date;
};

export type RiskLimitsInput = {
  maxPositionSize?: number | null;
  maxDailyLoss?: number | null;
  maxConcentration?: number | null;
  maxTotalExposure?: number | null;
};

/**
 * Proposta de operação submetida para verificação de aderência (FR14).
 * Representa os valores que o utilizador pretende executar.
 */
export type AdherenceProposal = {
  /** Tamanho de posição proposto (unidades/lotes) */
  positionSize?: number;
  /** Preço de entrada proposto */
  price?: number;
  /** Perda diária acumulada actual antes desta operação */
  currentDailyLoss?: number;
  /** Concentração proposta (0–1) */
  concentration?: number;
  /** Exposição total proposta após a operação */
  totalExposure?: number;
};

/**
 * Estado das métricas de risco num dado momento (FR16).
 * Usado para mostrar o estado antes e depois de uma simulação.
 */
export type RiskMetricsSnapshot = {
  positionSize?: number;
  price?: number;
  currentDailyLoss?: number;
  concentration?: number;
  totalExposure?: number;
};

export type LimitViolation = {
  limitKey: "maxPositionSize" | "maxDailyLoss" | "maxConcentration" | "maxTotalExposure";
  proposedValue: number;
  limitValue: number;
  label: string;
};

export type AdherenceResult = {
  ok: boolean;
  violations: LimitViolation[];
  /** Estado das métricas antes da operação proposta (FR16) */
  before: RiskMetricsSnapshot;
  /** Estado das métricas depois de aplicar a operação proposta (FR16) */
  after: RiskMetricsSnapshot;
};

export type RiskExceptionInput = {
  userId: string;
  limitKey: LimitViolation["limitKey"];
  proposedValue: number;
  limitValue: number;
  reason: string;
  contextJson?: string;
};

/** Conjunto de chaves de limite válidas (para validação em runtime). */
export const VALID_LIMIT_KEYS: ReadonlyArray<LimitViolation["limitKey"]> = [
  "maxPositionSize",
  "maxDailyLoss",
  "maxConcentration",
  "maxTotalExposure",
] as const;

export type RiskExceptionRecord = {
  id: string;
  userId: string;
  limitKey: string;
  proposedValue: number;
  limitValue: number;
  reason: string;
  contextJson: string | null;
  approved: boolean;
  createdAt: Date;
};

export interface IRiskLimitsRepository {
  findByUserId(userId: string): Promise<RiskLimits | null>;
  upsert(userId: string, input: RiskLimitsInput): Promise<RiskLimits>;
}

export interface IRiskExceptionRepository {
  create(input: RiskExceptionInput & { approved: boolean }): Promise<RiskExceptionRecord>;
  findByUserId(userId: string, limit?: number): Promise<RiskExceptionRecord[]>;
}
