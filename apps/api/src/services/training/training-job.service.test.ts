import { describe, expect, it, vi } from "vitest";
import { TrainingJobService } from "./training-job.service.js";
import type { ITrainingJobRepository, TrainingJob } from "./ports.js";
import type { IExperimentRepository, ExperimentRun } from "../experiments/ports.js";
import type { IRankingPolicyRepository } from "../ranking-policy/ports.js";

const makeJob = (overrides: Partial<TrainingJob> = {}): TrainingJob => ({
  id: "job-1",
  userId: "user-1",
  policyVersion: 1,
  status: "queued",
  paramsJson: null,
  errorMessage: null,
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  ...overrides,
});

const makeExperiment = (): ExperimentRun => ({
  id: "exp-1",
  userId: "user-1",
  trainingJobId: "job-1",
  policyVersion: 1,
  datasetHash: "demo-dataset-v1-00000007",
  metrics: { profitFactorProxy: 1.55, simulatedDrawdown: 0.09, winRate: 0.59, totalTrades: 121 },
  artifactPath: null,
  label: "auto-run-policy-v1",
  createdAt: new Date(),
});

describe("TrainingJobService (FR22)", () => {
  const makeRepos = () => {
    const jobRepo: ITrainingJobRepository = {
      create: vi.fn().mockResolvedValue(makeJob()),
      findById: vi.fn().mockResolvedValue(makeJob({ status: "success" })),
      listByUserId: vi.fn().mockResolvedValue([makeJob()]),
      updateStatus: vi.fn().mockImplementation((id, status, extra) =>
        Promise.resolve(makeJob({ status, ...extra })),
      ),
    };
    const experimentRepo: IExperimentRepository = {
      create: vi.fn().mockResolvedValue(makeExperiment()),
      findById: vi.fn().mockResolvedValue(null),
      listByUserId: vi.fn().mockResolvedValue([]),
    };
    const policyRepo: IRankingPolicyRepository = {
      findActive: vi.fn().mockResolvedValue({ id: "p1", version: 1, name: "v1", weights: { priorityWeight: 0.5, timeWeight: 0.3, horizonBonus: 0.2 }, isActive: true, createdAt: new Date() }),
      listAll: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    };
    return { jobRepo, experimentRepo, policyRepo };
  };

  it("createAndRun cria job, executa em paper/demo e termina com success", async () => {
    const { jobRepo, experimentRepo, policyRepo } = makeRepos();
    const svc = new TrainingJobService(jobRepo, experimentRepo, policyRepo);

    const result = await svc.createAndRun({ userId: "user-1" });

    expect(jobRepo.create).toHaveBeenCalledWith({ userId: "user-1", policyVersion: 1, paramsJson: undefined });
    expect(jobRepo.updateStatus).toHaveBeenCalledWith("job-1", "running", expect.objectContaining({ startedAt: expect.any(Date) }));
    expect(experimentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        policyVersion: 1,
        artifactPath: "artifacts/paper-demo/job-1.json",
      }),
    );
    expect(result.status).toBe("success");
  });

  it("createAndRun corre isolado da produção (usa política paper/demo)", async () => {
    const { jobRepo, experimentRepo, policyRepo } = makeRepos();
    const svc = new TrainingJobService(jobRepo, experimentRepo, policyRepo);

    await svc.createAndRun({ userId: "user-1", policyVersion: 2 });

    expect(jobRepo.create).toHaveBeenCalledWith({ userId: "user-1", policyVersion: 2, paramsJson: undefined });
    const createCall = (experimentRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.policyVersion).toBe(2);
    expect(createCall.artifactPath).toBe("artifacts/paper-demo/job-1.json");
  });

  it("estado é visível via getStatus (queued/running/failed/success)", async () => {
    const { jobRepo, experimentRepo, policyRepo } = makeRepos();
    const svc = new TrainingJobService(jobRepo, experimentRepo, policyRepo);

    const job = await svc.getStatus("job-1");
    expect(job).not.toBeNull();
    expect(["queued", "running", "success", "failed"]).toContain(job!.status);
  });

  it("listForUser devolve jobs do utilizador", async () => {
    const { jobRepo, experimentRepo, policyRepo } = makeRepos();
    const svc = new TrainingJobService(jobRepo, experimentRepo, policyRepo);

    const jobs = await svc.listForUser("user-1");
    expect(Array.isArray(jobs)).toBe(true);
  });
});
