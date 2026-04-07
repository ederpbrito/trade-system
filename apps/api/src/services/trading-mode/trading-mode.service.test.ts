/**
 * Testes unitários — TradingModeService (FR17, FR19).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TradingModeService } from "./trading-mode.service.js";
import type { IExecutionConnector, IOrderIntentRepository, OrderIntentInput, OrderIntentRecord } from "./ports.js";

const makeRecord = (overrides: Partial<OrderIntentRecord> = {}): OrderIntentRecord => ({
  id: "intent-1",
  userId: "user-1",
  instrumentId: "instr-1",
  symbolInternal: "EURUSD",
  side: "buy",
  quantity: 0.1,
  price: null,
  mode: "demo",
  timeframe: "M15",
  horizonte: "dia",
  candidateId: null,
  connectorResponseJson: JSON.stringify({ connectorId: "demo-stub", status: "simulated" }),
  status: "filled",
  idempotencyKey: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

function makeDemoConnector(): IExecutionConnector {
  return {
    connectorId: "demo-stub",
    mode: "demo",
    submit: vi.fn().mockResolvedValue({ connectorId: "demo-stub", status: "simulated", message: "ok" }),
  };
}

function makeRepo(existing?: OrderIntentRecord): IOrderIntentRepository {
  return {
    create: vi.fn().mockResolvedValue(makeRecord()),
    findById: vi.fn().mockResolvedValue(null),
    findByIdempotencyKey: vi.fn().mockResolvedValue(existing ?? null), // (key, userId)
    findByUserId: vi.fn().mockResolvedValue([]),
  };
}

describe("TradingModeService", () => {
  let connector: IExecutionConnector;
  let repo: IOrderIntentRepository;
  let service: TradingModeService;

  beforeEach(() => {
    connector = makeDemoConnector();
    repo = makeRepo();
    service = new TradingModeService(connector, repo);
  });

  it("expõe o modo do conetor", () => {
    expect(service.currentMode).toBe("demo");
  });

  it("submete intenção demo e persiste registo", async () => {
    const input: OrderIntentInput = {
      userId: "user-1",
      instrumentId: "instr-1",
      symbolInternal: "EURUSD",
      side: "buy",
      quantity: 0.1,
    };
    const result = await service.submitIntent(input);
    expect(connector.submit).toHaveBeenCalledOnce();
    expect(repo.create).toHaveBeenCalledOnce();
    expect(result.record.mode).toBe("demo");
    expect(result.idempotent).toBe(false);
  });

  it("rejeita quantidade inválida", async () => {
    await expect(
      service.submitIntent({ userId: "u", instrumentId: "i", symbolInternal: "X", side: "buy", quantity: 0 }),
    ).rejects.toMatchObject({ code: "INTENT_INVALID_QUANTITY" });
  });

  it("rejeita lado inválido", async () => {
    await expect(
      service.submitIntent({ userId: "u", instrumentId: "i", symbolInternal: "X", side: "hold" as "buy", quantity: 1 }),
    ).rejects.toMatchObject({ code: "INTENT_INVALID_SIDE" });
  });

  it("respeita idempotência: devolve registo existente sem chamar conetor", async () => {
    const existing = makeRecord({ idempotencyKey: "key-abc" });
    repo = makeRepo(existing);
    service = new TradingModeService(connector, repo);

    const result = await service.submitIntent({
      userId: "user-1",
      instrumentId: "instr-1",
      symbolInternal: "EURUSD",
      side: "buy",
      quantity: 0.1,
      idempotencyKey: "key-abc",
    });

    expect(connector.submit).not.toHaveBeenCalled();
    expect(result.record.idempotencyKey).toBe("key-abc");
    expect(result.idempotent).toBe(true);
  });
});
