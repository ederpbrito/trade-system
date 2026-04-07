/**
 * Portas (interfaces) do domínio do assistente de decisão contextual.
 * FR9–FR12 — explicação de tese, conflito entre janelas, relação com risco.
 *
 * O contrato JSON é versionado via `schemaVersion` para permitir evolução
 * sem quebrar a UI (AC 6-1: "o contrato JSON é versionável sem mudar a UI").
 */

/** Versão actual do contrato de resposta do assistente. */
export const ASSISTANT_SCHEMA_VERSION = "1.0" as const;

/** Contexto de candidato e janela fornecido pelo cliente. */
export type AssistantThesisRequest = {
  instrumentId: string;
  symbolInternal: string;
  timeframe: string;
  horizonte: string;
};

/** Secção estruturada da tese (FR9). */
export type ThesisSection = {
  id: string;
  title: string;
  content: string;
};

/** Severidade de conflito entre horizontes (FR10). */
export type ConflictSeverity = "none" | "low" | "medium" | "high";

/** Conflito entre janelas de curto e longo prazo (FR10, UX-DR5). */
export type WindowConflict = {
  shortTermNarrative: string;
  longTermNarrative: string;
  severity: ConflictSeverity;
};

/** Relação com limites de risco (FR11). */
export type RiskRelation = {
  hasLimits: boolean;
  adherenceSummary: string | null;
  /** Espaço disponível até ao limite de posição (null se não configurado). */
  headroomPositionSize: number | null;
  /** Espaço disponível até ao limite de perda diária (null se não configurado). */
  headroomDailyLoss: number | null;
};

/** Resposta completa do assistente (FR9–FR11). */
export type AssistantThesisResponse = {
  schemaVersion: typeof ASSISTANT_SCHEMA_VERSION;
  symbolInternal: string;
  timeframe: string;
  horizonte: string;
  sections: ThesisSection[];
  conflict: WindowConflict;
  riskRelation: RiskRelation;
  generatedAt: string;
};

/** Contexto de risco passado ao serviço para FR11. */
export type AssistantRiskContext = {
  maxPositionSize: number | null;
  maxDailyLoss: number | null;
  currentDailyLoss?: number;
  currentPositionSize?: number;
};
