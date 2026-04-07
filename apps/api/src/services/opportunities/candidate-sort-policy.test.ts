import { describe, expect, it } from "vitest";
import { computePolicyScore, sortCandidatesByPolicy } from "./candidate-sort.js";
import type { OpportunityCandidate } from "./degradation.js";
import type { PolicyWeights } from "../ranking-policy/ports.js";

const weights: PolicyWeights = { priorityWeight: 0.5, timeWeight: 0.3, horizonBonus: 0.2 };

const mk = (partial: Partial<OpportunityCandidate> & Pick<OpportunityCandidate, "id">): OpportunityCandidate => ({
  symbolInternal: "X",
  certainty: "normal",
  ...partial,
});

describe("computePolicyScore (FR21)", () => {
  it("candidato com prioridade alta (rank 0) tem score de prioridade maior", () => {
    const high = mk({ id: "h", priorityRank: 0, sortTimeMs: Date.now() });
    const low = mk({ id: "l", priorityRank: 2, sortTimeMs: Date.now() });
    expect(computePolicyScore(high, weights)).toBeGreaterThan(computePolicyScore(low, weights));
  });

  it("candidato com horizonte 'semana' recebe bónus de horizonte", () => {
    const now = Date.now();
    const withBonus = mk({ id: "w", priorityRank: 1, sortTimeMs: now, horizonte: "semana" });
    const noBonus = mk({ id: "n", priorityRank: 1, sortTimeMs: now, horizonte: "dia" });
    expect(computePolicyScore(withBonus, weights)).toBeGreaterThan(computePolicyScore(noBonus, weights));
  });

  it("candidato com horizonte 'mês' também recebe bónus", () => {
    const now = Date.now();
    const withBonus = mk({ id: "m", priorityRank: 1, sortTimeMs: now, horizonte: "mês" });
    const noBonus = mk({ id: "n", priorityRank: 1, sortTimeMs: now, horizonte: "dia" });
    expect(computePolicyScore(withBonus, weights)).toBeGreaterThan(computePolicyScore(noBonus, weights));
  });
});

describe("sortCandidatesByPolicy (FR21)", () => {
  it("ordena candidatos por score descendente com desempate estável por id", () => {
    const now = Date.now();
    const candidates = [
      mk({ id: "b", priorityRank: 2, sortTimeMs: now }),
      mk({ id: "a", priorityRank: 0, sortTimeMs: now }),
    ];
    const sorted = sortCandidatesByPolicy(candidates, weights);
    expect(sorted[0]!.id).toBe("a");
    expect(sorted[1]!.id).toBe("b");
  });

  it("versão da política fica reflectida no score (ordenação reflecte política)", () => {
    const now = Date.now();
    const priorityHeavy: PolicyWeights = { priorityWeight: 0.9, timeWeight: 0.05, horizonBonus: 0.05 };
    const candidates = [
      mk({ id: "low", priorityRank: 2, sortTimeMs: now }),
      mk({ id: "high", priorityRank: 0, sortTimeMs: now }),
    ];
    const sorted = sortCandidatesByPolicy(candidates, priorityHeavy);
    expect(sorted[0]!.id).toBe("high");
  });
});
