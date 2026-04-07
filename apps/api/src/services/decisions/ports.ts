/**
 * Portas do domínio de decisões.
 * FR20 — registo de decisão com racional estruturado.
 * FR29 — trilha auditável.
 * FR30 — histórico consultável.
 */
import type { TradingMode } from "../trading-mode/ports.js";

export type DecisionType = "operar" | "nao_operar";

export type DecisionInput = {
  userId: string;
  decision: DecisionType;
  instrumentId: string;
  symbolInternal: string;
  timeframe?: string;
  horizonte?: string;
  candidateId?: string;
  orderIntentId?: string;
  /** Motivo principal — obrigatório (UX-DR8) */
  rationale: string;
  /** Tags opcionais */
  tags?: string[];
  /** Nota breve opcional */
  note?: string;
  mode: TradingMode;
};

export type DecisionRecord = {
  id: string;
  userId: string;
  decision: string;
  instrumentId: string;
  symbolInternal: string;
  timeframe: string | null;
  horizonte: string | null;
  candidateId: string | null;
  orderIntentId: string | null;
  rationale: string;
  tagsJson: string | null;
  note: string | null;
  mode: TradingMode;
  createdAt: Date;
};

export type DecisionFilter = {
  symbolInternal?: string;
  /** ISO date string — início do intervalo */
  from?: string;
  /** ISO date string — fim do intervalo */
  to?: string;
  limit?: number;
  offset?: number;
};

export interface IDecisionRepository {
  create(input: DecisionInput): Promise<DecisionRecord>;
  findById(id: string): Promise<DecisionRecord | null>;
  findByUserId(userId: string, filter?: DecisionFilter): Promise<DecisionRecord[]>;
}

export type AuditEventInput = {
  userId: string;
  eventType: string;
  mode: TradingMode;
  timeframe?: string;
  horizonte?: string;
  correlationId?: string;
  entityId?: string;
  entityType?: string;
  payloadJson: string;
};

export type AuditEventRecord = {
  id: string;
  userId: string;
  eventType: string;
  mode: TradingMode;
  timeframe: string | null;
  horizonte: string | null;
  correlationId: string | null;
  entityId: string | null;
  entityType: string | null;
  payloadJson: string;
  occurredAt: Date;
};

export type AuditFilter = {
  eventType?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export interface IAuditRepository {
  create(input: AuditEventInput): Promise<AuditEventRecord>;
  findByUserId(userId: string, filter?: AuditFilter): Promise<AuditEventRecord[]>;
}
