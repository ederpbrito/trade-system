import type { ConnectorHealthRecord, ConnectorState } from "../market-data/ports.js";

export type DegradationPolicy = "suppress" | "uncertain";

const rank: Record<ConnectorState, number> = {
  operational: 0,
  degraded: 1,
  unavailable: 2,
};

export function worstConnectorState(rows: ConnectorHealthRecord[]): ConnectorState | null {
  if (rows.length === 0) return null;
  return rows.reduce<ConnectorState>((acc, r) => (rank[r.state] > rank[acc] ? r.state : acc), rows[0]!.state);
}

export type OpportunityEvaluationInput = {
  policy: DegradationPolicy;
  worstState: ConnectorState | null;
  /** true se algum instrumento monitorizado tem barras mais velhas que o limiar */
  hasStaleBars: boolean;
  /** Para auditoria (FR27) */
  log?: (meta: Record<string, unknown>) => void;
};

export type OpportunityCandidate = {
  id: string;
  symbolInternal: string;
  certainty: "normal" | "uncertain";
};

/**
 * Regra configurável: com fonte degradada ou dados fora de atualidade, suprimir ou marcar incerto.
 */
export function evaluateCandidates(input: OpportunityEvaluationInput & { baseCandidates: OpportunityCandidate[] }): {
  candidates: OpportunityCandidate[];
  suppressionReason: string | null;
} {
  const degradedBySource =
    input.worstState === "degraded" || input.worstState === "unavailable" || input.hasStaleBars;

  if (!degradedBySource) {
    return { candidates: input.baseCandidates.map((c) => ({ ...c, certainty: "normal" as const })), suppressionReason: null };
  }

  const reasonParts: string[] = [];
  if (input.worstState === "unavailable") reasonParts.push("connector_unavailable");
  else if (input.worstState === "degraded") reasonParts.push("connector_degraded");
  if (input.hasStaleBars) reasonParts.push("data_stale");
  const reason = reasonParts.join(",");

  input.log?.({
    event: "opportunity_degradation",
    suppressionReason: reason,
    policy: input.policy,
    worstState: input.worstState,
    hasStaleBars: input.hasStaleBars,
  });

  if (input.policy === "suppress") {
    return { candidates: [], suppressionReason: reason };
  }

  return {
    candidates: input.baseCandidates.map((c) => ({ ...c, certainty: "uncertain" as const })),
    suppressionReason: null,
  };
}
