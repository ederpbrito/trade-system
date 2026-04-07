import { describe, expect, it } from "vitest";
import { compareCandidates, filterCandidatesByWindow, sortCandidatesStable } from "./candidate-utils";

describe("candidate-utils (FR7)", () => {
  const a = {
    id: "a",
    symbolInternal: "X",
    certainty: "normal",
    priorityRank: 1,
    sortTimeMs: 100,
  };
  const b = {
    id: "b",
    symbolInternal: "Y",
    certainty: "normal",
    priorityRank: 0,
    sortTimeMs: 200,
  };

  it("ordena por prioridade de forma estável (desempate por id)", () => {
    const sorted = sortCandidatesStable([a, b], "priority");
    expect(sorted[0]?.id).toBe("b");
    expect(sorted[1]?.id).toBe("a");
  });

  it("ordena por tempo (mais recente primeiro) com desempate por id", () => {
    expect(compareCandidates(a, b, "time")).toBeGreaterThan(0);
  });

  it("filtra por M15 e horizonte dia", () => {
    const list = [
      { id: "1", symbolInternal: "A", certainty: "normal", timeframe: "M15", horizonte: "dia" },
      { id: "2", symbolInternal: "B", certainty: "normal", timeframe: "H1", horizonte: "semana" },
    ];
    const f = filterCandidatesByWindow(list, "M15", "dia");
    expect(f).toHaveLength(1);
    expect(f[0]?.id).toBe("1");
  });
});
