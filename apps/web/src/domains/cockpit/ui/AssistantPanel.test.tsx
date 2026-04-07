import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AssistantPanel } from "./AssistantPanel";

const mockThesis = {
  schemaVersion: "1.0",
  symbolInternal: "EURUSD",
  timeframe: "M15",
  horizonte: "dia",
  sections: [
    { id: "resumo", title: "Resumo da tese", content: "Análise de EURUSD no timeframe 15 minutos." },
    { id: "fatores", title: "Fatores relevantes", content: "Timeframe: 15 minutos." },
    { id: "incerteza", title: "Incerteza e limitações", content: "Análise por regras determinísticas." },
  ],
  conflict: {
    shortTermNarrative: "Sinal de curto prazo para EURUSD.",
    longTermNarrative: "Sem sinal de longo prazo.",
    severity: "none" as const,
  },
  riskRelation: {
    hasLimits: false,
    adherenceSummary: "Sem limites de risco configurados.",
    headroomPositionSize: null,
    headroomDailyLoss: null,
  },
  generatedAt: new Date().toISOString(),
};

const decisionContext = {
  candidateId: "cand-1",
  instrumentId: "inst-1",
  symbolInternal: "EURUSD",
  timeframe: "M15",
  horizonte: "dia",
};

describe("AssistantPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // AC 6-4: sem contexto — mensagem de placeholder
  it("mostra placeholder quando sem contexto", () => {
    render(<AssistantPanel decisionContext={null} />);
    expect(screen.getByText(/Seleccione um candidato/i)).toBeInTheDocument();
  });

  // AC 6-1: secções estáveis aparecem na UI
  it("mostra secções da tese após carregar", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText("Resumo da tese")).toBeInTheDocument();
    });
    expect(screen.getByText("Fatores relevantes")).toBeInTheDocument();
    expect(screen.getByText("Incerteza e limitações")).toBeInTheDocument();
  });

  // AC 6-1: schemaVersion visível na UI
  it("mostra schemaVersion do contrato", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText(/v1\.0/)).toBeInTheDocument();
    });
  });

  // AC 6-2: painel de conflito com severidade
  it("mostra painel de conflito entre janelas", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Conflito entre janelas")).toBeInTheDocument();
    });
    expect(screen.getByText("Sem conflito")).toBeInTheDocument();
    expect(screen.getByText("Curto prazo")).toBeInTheDocument();
    expect(screen.getByText("Longo prazo")).toBeInTheDocument();
  });

  // AC 6-2: conflito com severidade low
  it("mostra severidade de conflito corretamente", async () => {
    const thesisWithConflict = {
      ...mockThesis,
      conflict: { ...mockThesis.conflict, severity: "low" as const },
    };
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: thesisWithConflict }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText("Conflito baixo")).toBeInTheDocument();
    });
  });

  // AC 6-3: limites de risco da API
  it("mostra limites de risco quando configurados", async () => {
    const thesisWithRisk = {
      ...mockThesis,
      riskRelation: {
        hasLimits: true,
        adherenceSummary: "Tamanho máximo de posição: 10 (espaço disponível: 7.00).",
        headroomPositionSize: 7,
        headroomDailyLoss: null,
      },
    };
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: thesisWithRisk }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText(/Posição: 7.00 disponível/)).toBeInTheDocument();
    });
  });

  // AC 6-3: sem limites — mensagem informativa
  it("mostra mensagem informativa quando sem limites de risco", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText(/Sem limites de risco configurados/)).toBeInTheDocument();
    });
  });

  // AC 6-4: disclaimer visível
  it("mostra disclaimer que análise não substitui checks de risco", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByRole("note")).toBeInTheDocument();
    });
    expect(screen.getByRole("note").textContent).toMatch(/não substitui os checks de risco/);
  });

  // AC 6-4: conteúdo actualiza ao mudar candidato
  it("recarrega tese ao mudar candidato", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn(async () => {
      callCount++;
      return new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const { rerender } = render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => expect(callCount).toBe(1));

    // Mudar candidato deve disparar nova chamada
    rerender(
      <AssistantPanel
        decisionContext={{ ...decisionContext, candidateId: "cand-2", symbolInternal: "XAUUSD" }}
      />,
    );

    await waitFor(() => expect(callCount).toBe(2));
  });

  // AC 6-4: mesmo candidato não recarrega
  it("não recarrega quando candidato não muda", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn(async () => {
      callCount++;
      return new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const { rerender } = render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => expect(callCount).toBe(1));

    // Re-render com mesmo candidato não deve disparar nova chamada
    rerender(<AssistantPanel decisionContext={{ ...decisionContext }} />);

    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBe(1);
  });

  // AC 6-4: estado de sessão (secções expandidas) preservado ao mudar candidato
  it("preserva estado de sessão (secções expandidas) ao mudar candidato", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ thesis: mockThesis }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    const { rerender } = render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByText("Resumo da tese")).toBeInTheDocument();
    });

    // Expandir "fatores" (inicialmente colapsado)
    fireEvent.click(screen.getByText("Fatores relevantes"));

    // Verificar que o conteúdo de "fatores" está visível após expandir
    expect(screen.getByText("Timeframe: 15 minutos.")).toBeInTheDocument();

    // Mudar candidato
    rerender(
      <AssistantPanel
        decisionContext={{ ...decisionContext, candidateId: "cand-2", symbolInternal: "XAUUSD" }}
      />,
    );

    await waitFor(() => expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2));

    // Estado de expansão deve persistir — conteúdo de "fatores" ainda visível
    await waitFor(() => {
      expect(screen.getByText("Timeframe: 15 minutos.")).toBeInTheDocument();
    });
  });

  // Erro de rede
  it("mostra erro quando API falha", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ error: { message: "Erro interno" } }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof fetch;

    render(<AssistantPanel decisionContext={decisionContext} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
