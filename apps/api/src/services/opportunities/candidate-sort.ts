import type { OpportunityCandidate } from "./degradation.js";
import type { PolicyWeights } from "../ranking-policy/ports.js";

export type CandidateSortBy = "priority" | "time";

/**
 * FR21 — calcula score de candidato com base nos pesos da política versionada.
 * Score mais alto = melhor candidato.
 */
export function computePolicyScore(candidate: OpportunityCandidate, weights: PolicyWeights): number {
  const priorityRank = candidate.priorityRank ?? 99;
  // Inverter: prioridade 0 (high) deve ter score mais alto
  const priorityScore = (1 - Math.min(priorityRank, 10) / 10) * weights.priorityWeight;

  // Recência: normalizar para [0,1] usando 7 dias como janela máxima
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const ageMs = Date.now() - (candidate.sortTimeMs ?? 0);
  const timeScore = Math.max(0, 1 - ageMs / sevenDaysMs) * weights.timeWeight;

  // Bónus por horizonte longo
  const horizonScore =
    candidate.horizonte === "semana" || candidate.horizonte === "mês" ? weights.horizonBonus : 0;

  return priorityScore + timeScore + horizonScore;
}

/**
 * Ordenação estável e determinística (FR7): desempate por `id`.
 */
export function compareOpportunityCandidates(a: OpportunityCandidate, b: OpportunityCandidate, sortBy: CandidateSortBy): number {
  if (sortBy === "priority") {
    const pr = (a.priorityRank ?? 99) - (b.priorityRank ?? 99);
    if (pr !== 0) return pr;
    const tm = (b.sortTimeMs ?? 0) - (a.sortTimeMs ?? 0);
    if (tm !== 0) return tm;
    return a.id.localeCompare(b.id);
  }
  const tm = (b.sortTimeMs ?? 0) - (a.sortTimeMs ?? 0);
  if (tm !== 0) return tm;
  const pr = (a.priorityRank ?? 99) - (b.priorityRank ?? 99);
  if (pr !== 0) return pr;
  return a.id.localeCompare(b.id);
}

export function sortOpportunityCandidates(candidates: OpportunityCandidate[], sortBy: CandidateSortBy): OpportunityCandidate[] {
  return [...candidates].sort((a, b) => compareOpportunityCandidates(a, b, sortBy));
}

/**
 * FR21 — ordena candidatos usando score calculado pela política versionada.
 * Desempate estável por id.
 */
export function sortCandidatesByPolicy(candidates: OpportunityCandidate[], weights: PolicyWeights): OpportunityCandidate[] {
  return [...candidates].sort((a, b) => {
    const diff = computePolicyScore(b, weights) - computePolicyScore(a, weights);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}
