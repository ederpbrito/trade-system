import { describe, it, expect } from "vitest";
import { AssistantService } from "./assistant.service.js";
import type { AssistantThesisRequest, AssistantRiskContext } from "./ports.js";
import { ASSISTANT_SCHEMA_VERSION } from "./ports.js";

const svc = new AssistantService();

const baseReq: AssistantThesisRequest = {
  instrumentId: "inst-1",
  symbolInternal: "EURUSD",
  timeframe: "M15",
  horizonte: "dia",
};

describe("AssistantService.generateThesis", () => {
  // FR9: secções estáveis com resumo, fatores, incerteza
  it("devolve secções estáveis: resumo, fatores, incerteza", () => {
    const result = svc.generateThesis(baseReq, null);
    const ids = result.sections.map((s) => s.id);
    expect(ids).toContain("resumo");
    expect(ids).toContain("fatores");
    expect(ids).toContain("incerteza");
  });

  it("inclui symbolInternal, timeframe e horizonte na resposta", () => {
    const result = svc.generateThesis(baseReq, null);
    expect(result.symbolInternal).toBe("EURUSD");
    expect(result.timeframe).toBe("M15");
    expect(result.horizonte).toBe("dia");
  });

  it("contrato JSON inclui schemaVersion versionável", () => {
    const result = svc.generateThesis(baseReq, null);
    expect(result.schemaVersion).toBe(ASSISTANT_SCHEMA_VERSION);
  });

  it("inclui generatedAt como ISO string", () => {
    const result = svc.generateThesis(baseReq, null);
    expect(() => new Date(result.generatedAt)).not.toThrow();
    expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
  });

  // FR10: conflito entre janelas
  it("detecta conflito low quando timeframe M15 e horizonte semana (divergência real)", () => {
    const req: AssistantThesisRequest = { ...baseReq, timeframe: "M15", horizonte: "semana" };
    const result = svc.generateThesis(req, null);
    expect(result.conflict.severity).toBe("low");
    expect(result.conflict.shortTermNarrative.length).toBeGreaterThan(0);
    expect(result.conflict.longTermNarrative.length).toBeGreaterThan(0);
  });

  it("detecta conflito low quando timeframe M15 e horizonte mes", () => {
    const req: AssistantThesisRequest = { ...baseReq, timeframe: "M15", horizonte: "mes" };
    const result = svc.generateThesis(req, null);
    expect(result.conflict.severity).toBe("low");
  });

  it("sem conflito quando M15/dia (timeframe e horizonte coerentes)", () => {
    const result = svc.generateThesis(baseReq, null);
    expect(result.conflict.severity).toBe("none");
  });

  it("sem conflito quando H1/semana (timeframe e horizonte alinhados)", () => {
    const req: AssistantThesisRequest = { ...baseReq, timeframe: "H1", horizonte: "semana" };
    const result = svc.generateThesis(req, null);
    expect(result.conflict.severity).toBe("none");
  });

  it("sem conflito quando H1/dia (timeframe e horizonte coerentes)", () => {
    const req: AssistantThesisRequest = { ...baseReq, timeframe: "H1", horizonte: "dia" };
    const result = svc.generateThesis(req, null);
    expect(result.conflict.severity).toBe("none");
  });

  it("sem conflito quando H4/dia (timeframe e horizonte coerentes)", () => {
    const req: AssistantThesisRequest = { ...baseReq, timeframe: "H4", horizonte: "dia" };
    const result = svc.generateThesis(req, null);
    expect(result.conflict.severity).toBe("none");
  });

  // FR11: relação com limites de risco
  it("sem limites configurados — hasLimits=false e adherenceSummary informativo", () => {
    const result = svc.generateThesis(baseReq, null);
    expect(result.riskRelation.hasLimits).toBe(false);
    expect(result.riskRelation.adherenceSummary).toBeTruthy();
    expect(result.riskRelation.headroomPositionSize).toBeNull();
    expect(result.riskRelation.headroomDailyLoss).toBeNull();
  });

  it("com limites configurados — calcula headroom de posição", () => {
    const riskCtx: AssistantRiskContext = {
      maxPositionSize: 10,
      maxDailyLoss: null,
      currentPositionSize: 3,
    };
    const result = svc.generateThesis(baseReq, riskCtx);
    expect(result.riskRelation.hasLimits).toBe(true);
    expect(result.riskRelation.headroomPositionSize).toBe(7);
    expect(result.riskRelation.adherenceSummary).toContain("10");
  });

  it("com limites configurados — calcula headroom de perda diária", () => {
    const riskCtx: AssistantRiskContext = {
      maxPositionSize: null,
      maxDailyLoss: 500,
      currentDailyLoss: 200,
    };
    const result = svc.generateThesis(baseReq, riskCtx);
    expect(result.riskRelation.hasLimits).toBe(true);
    expect(result.riskRelation.headroomDailyLoss).toBe(300);
    expect(result.riskRelation.adherenceSummary).toContain("500");
  });

  it("headroom nunca negativo quando limite já excedido", () => {
    const riskCtx: AssistantRiskContext = {
      maxPositionSize: 5,
      maxDailyLoss: null,
      currentPositionSize: 10,
    };
    const result = svc.generateThesis(baseReq, riskCtx);
    expect(result.riskRelation.headroomPositionSize).toBe(0);
  });

  it("sem limites (maxPositionSize e maxDailyLoss null) — hasLimits=false", () => {
    const riskCtx: AssistantRiskContext = {
      maxPositionSize: null,
      maxDailyLoss: null,
    };
    const result = svc.generateThesis(baseReq, riskCtx);
    expect(result.riskRelation.hasLimits).toBe(false);
  });

  it("maxPositionSize=0 (bloqueio total) é tratado como limite configurado, não como ausência", () => {
    const riskCtx: AssistantRiskContext = {
      maxPositionSize: 0,
      maxDailyLoss: null,
      currentPositionSize: 0,
    };
    const result = svc.generateThesis(baseReq, riskCtx);
    expect(result.riskRelation.hasLimits).toBe(true);
    expect(result.riskRelation.headroomPositionSize).toBe(0);
  });
});
