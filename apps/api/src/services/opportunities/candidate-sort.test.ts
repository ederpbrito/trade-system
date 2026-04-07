import { describe, expect, it } from "vitest";
import { compareOpportunityCandidates, sortOpportunityCandidates } from "./candidate-sort.js";
import type { OpportunityCandidate } from "./degradation.js";

describe("candidate-sort (FR7)", () => {
  const mk = (partial: Partial<OpportunityCandidate> & Pick<OpportunityCandidate, "id">): OpportunityCandidate => ({
    symbolInternal: "X",
    certainty: "normal",
    ...partial,
  });

  it("ordena por prioridade com desempate estável por id", () => {
    const sorted = sortOpportunityCandidates(
      [mk({ id: "b", priorityRank: 1 }), mk({ id: "a", priorityRank: 0 })],
      "priority",
    );
    expect(sorted.map((c) => c.id).join(",")).toBe("a,b");
  });

  it("compareOpportunityCandidates por tempo favorece sortTimeMs maior primeiro", () => {
    const a = mk({ id: "a", sortTimeMs: 100, priorityRank: 0 });
    const b = mk({ id: "b", sortTimeMs: 200, priorityRank: 0 });
    expect(compareOpportunityCandidates(a, b, "time")).toBeGreaterThan(0);
  });
});
