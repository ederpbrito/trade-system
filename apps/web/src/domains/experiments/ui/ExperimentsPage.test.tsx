import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ExperimentsPage } from "./ExperimentsPage";

const makeExperiment = (n: number) => ({
  id: `exp-${n}`,
  policyVersion: n,
  datasetHash: `demo-dataset-v${n}-00000007`,
  metrics: {
    profitFactorProxy: 1.2 + n * 0.1,
    simulatedDrawdown: 0.08 + n * 0.01,
    winRate: 0.52 + n * 0.01,
    totalTrades: 100 + n * 10,
  },
  artifactPath: null,
  label: `auto-run-policy-v${n}`,
  trainingJobId: `job-${n}`,
  createdAt: new Date().toISOString(),
});

const makeJob = (n: number) => ({
  id: `job-${n}`,
  status: "success" as const,
  policyVersion: n,
  createdAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
  errorMessage: null,
});

describe("ExperimentsPage (FR23/FR24)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn(async (url: string | URL) => {
      const u = String(url);
      if (u.includes("training-jobs")) {
        return new Response(
          JSON.stringify({ jobs: [makeJob(1), makeJob(2)] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (u.includes("experiments")) {
        return new Response(
          JSON.stringify({ experiments: [makeExperiment(1), makeExperiment(2)] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as unknown as typeof fetch;
  });

  it("mostra título da página de experimentos", async () => {
    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Experimentos e comparação/i)).toBeInTheDocument();
  });

  it("lista experimentos com versão de política e métricas (FR23)", async () => {
    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText("auto-run-policy-v1")).toBeInTheDocument();
      expect(screen.getByText("auto-run-policy-v2")).toBeInTheDocument();
    });
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
  });

  it("mostra jobs de treino recentes com estado visível (FR22)", async () => {
    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getAllByText("success").length).toBeGreaterThan(0);
    });
  });

  it("botão de treino está presente (FR22 — paper/demo)", () => {
    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/iniciar ciclo de treino/i)).toBeInTheDocument();
  });

  it("comparador e métricas aparecem ao seleccionar 2 experimentos (FR24)", async () => {
    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );

    // Esperar que os experimentos carreguem
    await waitFor(() => {
      const labels = screen.getAllByText(/auto-run-policy-v/);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    // Obter as linhas da tabela de experimentos e clicar
    const labels = screen.getAllByText(/auto-run-policy-v/);
    const tr1 = labels[0]!.closest("tr");
    const tr2 = labels[1]!.closest("tr");
    expect(tr1).not.toBeNull();
    expect(tr2).not.toBeNull();

    fireEvent.click(tr1!);
    fireEvent.click(tr2!);

    // Verificar que o comparador aparece com as métricas (FR24)
    await waitFor(() => {
      expect(screen.getByText(/Comparação lado a lado/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText("Profit Factor proxy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Drawdown simulado").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Win Rate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Total trades").length).toBeGreaterThan(0);
  });

  it("estado vazio mostra mensagem a indicar como criar experimento", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ experiments: [], jobs: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(
      <MemoryRouter>
        <ExperimentsPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText(/Sem experimentos/i)).toBeInTheDocument();
    });
  });
});
