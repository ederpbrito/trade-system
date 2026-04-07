import { describe, expect, it, vi } from "vitest";
import { RankingPolicyService } from "./ranking-policy.service.js";
import type { IRankingPolicyRepository, RankingPolicy, PolicyWeights } from "./ports.js";

const makePolicy = (version: number, isActive = false): RankingPolicy => ({
  id: `policy-${version}`,
  version,
  name: `Política v${version}`,
  weights: { priorityWeight: 0.5, timeWeight: 0.3, horizonBonus: 0.2 },
  isActive,
  createdAt: new Date("2026-01-01"),
});

describe("RankingPolicyService (FR21)", () => {
  it("getActive devolve null quando não há política activa", async () => {
    const repo: IRankingPolicyRepository = {
      findActive: vi.fn().mockResolvedValue(null),
      listAll: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    };
    const svc = new RankingPolicyService(repo);
    expect(await svc.getActive()).toBeNull();
  });

  it("getActive devolve a política activa com versão e metadados", async () => {
    const active = makePolicy(1, true);
    const repo: IRankingPolicyRepository = {
      findActive: vi.fn().mockResolvedValue(active),
      listAll: vi.fn().mockResolvedValue([active]),
      create: vi.fn(),
    };
    const svc = new RankingPolicyService(repo);
    const result = await svc.getActive();
    expect(result).not.toBeNull();
    expect(result!.version).toBe(1);
    expect(result!.isActive).toBe(true);
  });

  it("listAll devolve políticas ordenadas por versão (repositório responsável pela ordem)", async () => {
    const policies = [makePolicy(2), makePolicy(1)];
    const repo: IRankingPolicyRepository = {
      findActive: vi.fn().mockResolvedValue(null),
      listAll: vi.fn().mockResolvedValue(policies),
      create: vi.fn(),
    };
    const svc = new RankingPolicyService(repo);
    const result = await svc.listAll();
    expect(result).toHaveLength(2);
    expect(result[0]!.version).toBe(2);
  });

  it("create cria nova política e delega ao repositório", async () => {
    const newPolicy = makePolicy(1, true);
    const repo: IRankingPolicyRepository = {
      findActive: vi.fn().mockResolvedValue(null),
      listAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(newPolicy),
    };
    const svc = new RankingPolicyService(repo);
    const weights: PolicyWeights = { priorityWeight: 0.6, timeWeight: 0.3, horizonBonus: 0.1 };
    const result = await svc.create("Nova Política", weights);
    expect(repo.create).toHaveBeenCalledWith({ name: "Nova Política", weights });
    expect(result.isActive).toBe(true);
  });
});
