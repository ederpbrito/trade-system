import { describe, it, expect, vi, beforeEach } from "vitest";
import { RiskService } from "./risk.service.js";
import type { IRiskLimitsRepository, IRiskExceptionRepository, RiskLimits, RiskExceptionRecord } from "./ports.js";

function makeLimits(overrides: Partial<RiskLimits> = {}): RiskLimits {
  return {
    userId: "user-1",
    maxPositionSize: 10,
    maxDailyLoss: 500,
    maxConcentration: 0.2,
    maxTotalExposure: 5000,
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeExceptionRecord(overrides: Partial<RiskExceptionRecord> = {}): RiskExceptionRecord {
  return {
    id: "exc-1",
    userId: "user-1",
    limitKey: "maxPositionSize",
    proposedValue: 15,
    limitValue: 10,
    reason: "Oportunidade excecional",
    contextJson: null,
    approved: true,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("RiskService — 4.1: setLimits", () => {
  let limitsRepo: IRiskLimitsRepository;
  let exceptionRepo: IRiskExceptionRepository;
  let svc: RiskService;

  beforeEach(() => {
    limitsRepo = {
      findByUserId: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue(makeLimits()),
    };
    exceptionRepo = {
      create: vi.fn().mockResolvedValue(makeExceptionRecord()),
      findByUserId: vi.fn().mockResolvedValue([]),
    };
    svc = new RiskService(limitsRepo, exceptionRepo);
  });

  it("persiste limites válidos", async () => {
    const result = await svc.setLimits("user-1", { maxPositionSize: 10, maxDailyLoss: 500 });
    expect(limitsRepo.upsert).toHaveBeenCalledWith("user-1", { maxPositionSize: 10, maxDailyLoss: 500 });
    expect(result.userId).toBe("user-1");
  });

  it("rejeita maxPositionSize negativo", async () => {
    await expect(svc.setLimits("user-1", { maxPositionSize: -5 })).rejects.toMatchObject({
      code: "RISK_LIMITS_INVALID",
    });
  });

  it("rejeita maxConcentration > 1", async () => {
    await expect(svc.setLimits("user-1", { maxConcentration: 1.5 })).rejects.toMatchObject({
      code: "RISK_LIMITS_INVALID",
    });
  });

  it("aceita maxConcentration = 1 (100%)", async () => {
    await expect(svc.setLimits("user-1", { maxConcentration: 1 })).resolves.toBeDefined();
  });

  it("aceita campos nulos (limpar limite)", async () => {
    await expect(svc.setLimits("user-1", { maxPositionSize: null })).resolves.toBeDefined();
  });

  it("getLimits devolve null quando não configurado", async () => {
    const result = await svc.getLimits("user-1");
    expect(result).toBeNull();
  });
});

describe("RiskService — 4.2: checkAdherence", () => {
  let svc: RiskService;

  beforeEach(() => {
    svc = new RiskService(
      { findByUserId: vi.fn(), upsert: vi.fn() },
      { create: vi.fn(), findByUserId: vi.fn() },
    );
  });

  it("ok=true quando proposta dentro dos limites", () => {
    const limits = makeLimits();
    const result = svc.checkAdherence(limits, { positionSize: 5, currentDailyLoss: 100 });
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("detecta violação de positionSize", () => {
    const limits = makeLimits({ maxPositionSize: 10 });
    const result = svc.checkAdherence(limits, { positionSize: 15 });
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].limitKey).toBe("maxPositionSize");
    expect(result.violations[0].proposedValue).toBe(15);
    expect(result.violations[0].limitValue).toBe(10);
  });

  it("detecta violação de dailyLoss", () => {
    const limits = makeLimits({ maxDailyLoss: 500 });
    const result = svc.checkAdherence(limits, { currentDailyLoss: 600 });
    expect(result.ok).toBe(false);
    expect(result.violations[0].limitKey).toBe("maxDailyLoss");
  });

  it("detecta violação de concentração", () => {
    const limits = makeLimits({ maxConcentration: 0.2 });
    const result = svc.checkAdherence(limits, { concentration: 0.35 });
    expect(result.ok).toBe(false);
    expect(result.violations[0].limitKey).toBe("maxConcentration");
  });

  it("detecta múltiplas violações", () => {
    const limits = makeLimits();
    const result = svc.checkAdherence(limits, { positionSize: 20, currentDailyLoss: 1000 });
    expect(result.violations).toHaveLength(2);
  });

  it("ok=true quando limites são null (não configurados)", () => {
    const limits = makeLimits({ maxPositionSize: null, maxDailyLoss: null });
    const result = svc.checkAdherence(limits, { positionSize: 9999 });
    expect(result.ok).toBe(true);
  });

  it("ok=true quando limits=null (sem configuração)", () => {
    const result = svc.checkAdherence(null, { positionSize: 9999 });
    expect(result.ok).toBe(true);
  });

  it("before.positionSize=0 e after.positionSize=proposta (FR16 — antes/depois da simulação)", () => {
    const limits = makeLimits();
    const proposal = { positionSize: 5, price: 1.2345, currentDailyLoss: 100 };
    const result = svc.checkAdherence(limits, proposal);
    expect(result.before.positionSize).toBe(0);
    expect(result.after.positionSize).toBe(5);
    expect(result.before.price).toBe(1.2345);
    expect(result.after.price).toBe(1.2345);
    expect(result.before.currentDailyLoss).toBe(100);
    expect(result.after.currentDailyLoss).toBe(100);
  });

  it("before e after são distintos quando positionSize é fornecido", () => {
    const limits = makeLimits();
    const result = svc.checkAdherence(limits, { positionSize: 8 });
    expect(result.before.positionSize).toBe(0);
    expect(result.after.positionSize).toBe(8);
  });
});

describe("RiskService — 4.3: recordException / recordBlock", () => {
  let exceptionRepo: IRiskExceptionRepository;
  let svc: RiskService;

  beforeEach(() => {
    exceptionRepo = {
      create: vi.fn().mockResolvedValue(makeExceptionRecord()),
      findByUserId: vi.fn().mockResolvedValue([]),
    };
    svc = new RiskService({ findByUserId: vi.fn(), upsert: vi.fn() }, exceptionRepo);
  });

  it("regista exceção com motivo preenchido", async () => {
    const result = await svc.recordException({
      userId: "user-1",
      limitKey: "maxPositionSize",
      proposedValue: 15,
      limitValue: 10,
      reason: "Oportunidade excecional",
    });
    expect(exceptionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ approved: true, reason: "Oportunidade excecional" }),
    );
    expect(result.approved).toBe(true);
  });

  it("rejeita exceção sem motivo", async () => {
    await expect(
      svc.recordException({
        userId: "user-1",
        limitKey: "maxPositionSize",
        proposedValue: 15,
        limitValue: 10,
        reason: "   ",
      }),
    ).rejects.toMatchObject({ code: "RISK_EXCEPTION_REASON_REQUIRED" });
  });

  it("regista bloqueio automático com approved=false", async () => {
    (exceptionRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(makeExceptionRecord({ approved: false }));
    const result = await svc.recordBlock({
      userId: "user-1",
      limitKey: "maxPositionSize",
      proposedValue: 15,
      limitValue: 10,
    });
    expect(exceptionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ approved: false, reason: "bloqueio-automático" }),
    );
    expect(result.approved).toBe(false);
  });

  it("getExceptionLog delega ao repositório", async () => {
    await svc.getExceptionLog("user-1");
    expect(exceptionRepo.findByUserId).toHaveBeenCalledWith("user-1", undefined);
  });
});
