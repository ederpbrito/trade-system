import { describe, expect, it, vi } from "vitest";
import { ExperimentsService } from "./experiments.service.js";
import type { IExperimentRepository, ExperimentRun } from "./ports.js";

const makeExperiment = (overrides: Partial<ExperimentRun> = {}): ExperimentRun => ({
  id: "exp-1",
  userId: "user-1",
  trainingJobId: "job-1",
  policyVersion: 1,
  datasetHash: "demo-dataset-v1-00000007",
  metrics: { profitFactorProxy: 1.55, simulatedDrawdown: 0.09, winRate: 0.59, totalTrades: 121 },
  artifactPath: null,
  label: "auto-run-policy-v1",
  createdAt: new Date(),
  ...overrides,
});

describe("ExperimentsService (FR23)", () => {
  it("getById devolve experimento com versão política, hash dataset e métricas", async () => {
    const exp = makeExperiment();
    const repo: IExperimentRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(exp),
      listByUserId: vi.fn().mockResolvedValue([]),
    };
    const svc = new ExperimentsService(repo);
    const result = await svc.getById("exp-1");

    expect(result).not.toBeNull();
    expect(result!.policyVersion).toBe(1);
    expect(result!.datasetHash).toBe("demo-dataset-v1-00000007");
    expect(result!.metrics).toMatchObject({
      profitFactorProxy: expect.any(Number),
      simulatedDrawdown: expect.any(Number),
      winRate: expect.any(Number),
      totalTrades: expect.any(Number),
    });
  });

  it("getById devolve null para experimento inexistente", async () => {
    const repo: IExperimentRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      listByUserId: vi.fn().mockResolvedValue([]),
    };
    const svc = new ExperimentsService(repo);
    expect(await svc.getById("nao-existe")).toBeNull();
  });

  it("listForUser devolve lista de experimentos do utilizador", async () => {
    const experiments = [makeExperiment({ id: "exp-1" }), makeExperiment({ id: "exp-2", policyVersion: 2 })];
    const repo: IExperimentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      listByUserId: vi.fn().mockResolvedValue(experiments),
    };
    const svc = new ExperimentsService(repo);
    const result = await svc.listForUser("user-1");
    expect(result).toHaveLength(2);
    expect(result[0]!.policyVersion).toBe(1);
    expect(result[1]!.policyVersion).toBe(2);
  });
});
