/**
 * Testes unitários do MetricsService — FR31.
 */
import { describe, it, expect, vi } from "vitest";
import { MetricsService } from "./metrics.service.js";
import type { IDecisionRepository } from "./ports.js";
import type { IOrderIntentRepository } from "../trading-mode/ports.js";

const makeDecision = (decision: "operar" | "nao_operar", mode: "demo" | "production") => ({
  id: crypto.randomUUID(),
  userId: "u1",
  decision,
  instrumentId: "i1",
  symbolInternal: "BTCUSD",
  timeframe: "H1",
  horizonte: "swing",
  candidateId: null,
  orderIntentId: null,
  rationale: "test",
  tagsJson: null,
  note: null,
  mode,
  createdAt: new Date(),
});

const makeIntent = (status: string) => ({
  id: crypto.randomUUID(),
  userId: "u1",
  instrumentId: "i1",
  symbolInternal: "BTCUSD",
  side: "buy",
  quantity: 1,
  price: null,
  mode: "demo" as const,
  timeframe: "H1",
  horizonte: "swing",
  candidateId: null,
  connectorResponseJson: "{}",
  status,
  idempotencyKey: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("MetricsService", () => {
  it("retorna zeros quando não há dados", async () => {
    const decisionRepo = { findByUserId: vi.fn().mockResolvedValue([]) } as unknown as IDecisionRepository;
    const orderIntentRepo = { findByUserId: vi.fn().mockResolvedValue([]) } as unknown as IOrderIntentRepository;
    const svc = new MetricsService(decisionRepo, orderIntentRepo);

    const result = await svc.getSummary("u1");

    expect(result.totalDecisions).toBe(0);
    expect(result.operateRate).toBe(0);
    expect(result.fillRate).toBe(0);
    expect(result.period.from).toBeNull();
  });

  it("calcula contagens e taxa de operar correctamente", async () => {
    const decisions = [
      makeDecision("operar", "demo"),
      makeDecision("operar", "demo"),
      makeDecision("nao_operar", "demo"),
    ];
    const decisionRepo = { findByUserId: vi.fn().mockResolvedValue(decisions) } as unknown as IDecisionRepository;
    const orderIntentRepo = { findByUserId: vi.fn().mockResolvedValue([]) } as unknown as IOrderIntentRepository;
    const svc = new MetricsService(decisionRepo, orderIntentRepo);

    const result = await svc.getSummary("u1");

    expect(result.totalDecisions).toBe(3);
    expect(result.byDecision.operar).toBe(2);
    expect(result.byDecision.nao_operar).toBe(1);
    expect(result.operateRate).toBeCloseTo(2 / 3);
  });

  it("calcula taxa de fill de intenções", async () => {
    const intents = [
      makeIntent("filled"),
      makeIntent("filled"),
      makeIntent("pending"),
    ];
    const decisionRepo = { findByUserId: vi.fn().mockResolvedValue([]) } as unknown as IDecisionRepository;
    const orderIntentRepo = { findByUserId: vi.fn().mockResolvedValue(intents) } as unknown as IOrderIntentRepository;
    const svc = new MetricsService(decisionRepo, orderIntentRepo);

    const result = await svc.getSummary("u1");

    expect(result.totalIntents).toBe(3);
    expect(result.filledIntents).toBe(2);
    expect(result.fillRate).toBeCloseTo(2 / 3);
  });

  it("distribui decisões por modo correctamente", async () => {
    const decisions = [
      makeDecision("operar", "demo"),
      makeDecision("operar", "production"),
      makeDecision("nao_operar", "demo"),
    ];
    const decisionRepo = { findByUserId: vi.fn().mockResolvedValue(decisions) } as unknown as IDecisionRepository;
    const orderIntentRepo = { findByUserId: vi.fn().mockResolvedValue([]) } as unknown as IOrderIntentRepository;
    const svc = new MetricsService(decisionRepo, orderIntentRepo);

    const result = await svc.getSummary("u1");

    expect(result.byMode.demo).toBe(2);
    expect(result.byMode.production).toBe(1);
  });
});
