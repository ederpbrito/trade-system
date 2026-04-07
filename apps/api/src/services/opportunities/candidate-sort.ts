import type { OpportunityCandidate } from "./degradation.js";

export type CandidateSortBy = "priority" | "time";

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
