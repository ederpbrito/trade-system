/**
 * Testes unitários — DecisionsService (FR20, FR29, FR30).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DecisionsService } from "./decisions.service.js";
import type { IDecisionRepository, IAuditRepository, DecisionInput, DecisionRecord } from "./ports.js";

const makeDecisionRecord = (overrides: Partial<DecisionRecord> = {}): DecisionRecord => ({
  id: "dec-1",
  userId: "user-1",
  decision: "operar",
  instrumentId: "instr-1",
  symbolInternal: "EURUSD",
  timeframe: "M15",
  horizonte: "dia",
  candidateId: null,
  orderIntentId: null,
  rationale: "Tendência clara de alta",
  tagsJson: null,
  note: null,
  mode: "demo",
  createdAt: new Date(),
  ...overrides,
});

function makeDecisionRepo(): IDecisionRepository {
  return {
    create: vi.fn().mockResolvedValue(makeDecisionRecord()),
    findById: vi.fn().mockResolvedValue(makeDecisionRecord()),
    findByUserId: vi.fn().mockResolvedValue([makeDecisionRecord()]),
  };
}

function makeAuditRepo(): IAuditRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "audit-1",
      userId: "user-1",
      eventType: "decision.created",
      mode: "demo",
      timeframe: null,
      horizonte: null,
      correlationId: null,
      entityId: "dec-1",
      entityType: "decision",
      payloadJson: "{}",
      occurredAt: new Date(),
    }),
    findByUserId: vi.fn().mockResolvedValue([]),
  };
}

describe("DecisionsService", () => {
  let decisionRepo: IDecisionRepository;
  let auditRepo: IAuditRepository;
  let service: DecisionsService;

  beforeEach(() => {
    decisionRepo = makeDecisionRepo();
    auditRepo = makeAuditRepo();
    service = new DecisionsService(decisionRepo, auditRepo);
  });

  const validInput: DecisionInput = {
    userId: "user-1",
    decision: "operar",
    instrumentId: "instr-1",
    symbolInternal: "EURUSD",
    timeframe: "M15",
    horizonte: "dia",
    rationale: "Tendência clara",
    mode: "demo",
  };

  it("regista decisão válida e emite evento de auditoria", async () => {
    const result = await service.recordDecision(validInput, "req-123");
    expect(decisionRepo.create).toHaveBeenCalledOnce();
    expect(auditRepo.create).toHaveBeenCalledOnce();
    expect(result.decision).toBe("operar");
  });

  it("rejeita racional vazio", async () => {
    await expect(
      service.recordDecision({ ...validInput, rationale: "" }),
    ).rejects.toMatchObject({ code: "DECISION_RATIONALE_REQUIRED" });
    expect(decisionRepo.create).not.toHaveBeenCalled();
  });

  it("rejeita racional só com espaços", async () => {
    await expect(
      service.recordDecision({ ...validInput, rationale: "   " }),
    ).rejects.toMatchObject({ code: "DECISION_RATIONALE_REQUIRED" });
  });

  it("rejeita tipo de decisão inválido", async () => {
    await expect(
      service.recordDecision({ ...validInput, decision: "talvez" as "operar" }),
    ).rejects.toMatchObject({ code: "DECISION_INVALID_TYPE" });
  });

  it("aceita decisão nao_operar", async () => {
    decisionRepo.create = vi.fn().mockResolvedValue(makeDecisionRecord({ decision: "nao_operar" }));
    const result = await service.recordDecision({ ...validInput, decision: "nao_operar" });
    expect(result.decision).toBe("nao_operar");
  });

  it("lista decisões do utilizador", async () => {
    const list = await service.listDecisions("user-1", { symbolInternal: "EURUSD" });
    expect(decisionRepo.findByUserId).toHaveBeenCalledWith("user-1", { symbolInternal: "EURUSD" });
    expect(list).toHaveLength(1);
  });

  it("não bloqueia se auditoria falhar", async () => {
    auditRepo.create = vi.fn().mockRejectedValue(new Error("DB down"));
    // Não deve lançar erro
    await expect(service.recordDecision(validInput)).resolves.toBeDefined();
  });
});
