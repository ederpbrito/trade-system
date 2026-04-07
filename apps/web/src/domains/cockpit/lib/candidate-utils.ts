export type CockpitCandidate = {
  id: string;
  symbolInternal: string;
  certainty: string;
  instrumentId?: string;
  timeframe?: string;
  horizonte?: string;
  priorityRank?: number;
  sortTimeMs?: number;
};

export type CandidateSortBy = "priority" | "time";

/** Espelha a API (`candidate-sort.ts`) para NFR-P1: filtrar/ordenar em memória. */
export function compareCandidates(a: CockpitCandidate, b: CockpitCandidate, sortBy: CandidateSortBy): number {
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

export function sortCandidatesStable(list: CockpitCandidate[], sortBy: CandidateSortBy): CockpitCandidate[] {
  return [...list].sort((a, b) => compareCandidates(a, b, sortBy));
}

export function filterCandidatesByWindow(
  list: CockpitCandidate[],
  timeframe: string | "all",
  horizonte: string | "all",
): CockpitCandidate[] {
  return list.filter((c) => {
    if (timeframe !== "all" && c.timeframe !== timeframe) return false;
    if (horizonte !== "all" && c.horizonte !== horizonte) return false;
    return true;
  });
}
