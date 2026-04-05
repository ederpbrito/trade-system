import { describe, it, expect, vi } from "vitest";
import { evaluateCandidates, worstConnectorState } from "./degradation.js";

describe("degradation (FR27)", () => {
  it("worstConnectorState escolhe o pior estado", () => {
    expect(
      worstConnectorState([
        { connectorId: "a", state: "operational", lastHeartbeatAt: null, latencyMs: null, updatedAt: "" },
        { connectorId: "b", state: "unavailable", lastHeartbeatAt: null, latencyMs: null, updatedAt: "" },
        { connectorId: "c", state: "degraded", lastHeartbeatAt: null, latencyMs: null, updatedAt: "" },
      ]),
    ).toBe("unavailable");
  });

  it("suppress remove candidatos quando degradado", () => {
    const log = vi.fn();
    const r = evaluateCandidates({
      policy: "suppress",
      worstState: "degraded",
      hasStaleBars: false,
      baseCandidates: [{ id: "1", symbolInternal: "X", certainty: "normal" }],
      log,
    });
    expect(r.candidates).toHaveLength(0);
    expect(r.suppressionReason).toContain("connector_degraded");
    expect(log).toHaveBeenCalled();
  });

  it("uncertain mantém candidatos marcados como incertos", () => {
    const r = evaluateCandidates({
      policy: "uncertain",
      worstState: "degraded",
      hasStaleBars: false,
      baseCandidates: [{ id: "1", symbolInternal: "X", certainty: "normal" }],
      log: vi.fn(),
    });
    expect(r.candidates).toHaveLength(1);
    expect(r.candidates[0]?.certainty).toBe("uncertain");
    expect(r.suppressionReason).toBeNull();
  });

  it("dados stale disparam supressão em modo suppress", () => {
    const r = evaluateCandidates({
      policy: "suppress",
      worstState: "operational",
      hasStaleBars: true,
      baseCandidates: [{ id: "1", symbolInternal: "X", certainty: "normal" }],
      log: vi.fn(),
    });
    expect(r.candidates).toHaveLength(0);
    expect(r.suppressionReason).toContain("data_stale");
  });
});
