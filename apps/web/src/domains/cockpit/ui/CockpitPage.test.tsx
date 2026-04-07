import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CockpitPage } from "./CockpitPage";
import * as AuthContext from "../../identity/context/AuthContext";

describe("CockpitPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn(async (url: string | URL) => {
      const u = String(url);
      if (u.includes("/data-sources/health")) {
        return new Response(
          JSON.stringify({
            sources: [
              {
                connectorId: "mock",
                state: "operational",
                lastHeartbeatAt: null,
                latencyMs: 10,
                updatedAt: new Date().toISOString(),
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (u.includes("/watchlist")) {
        return new Response(JSON.stringify({ entries: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (u.includes("/instruments") && !u.includes("watchlist")) {
        return new Response(JSON.stringify({ instruments: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (u.includes("/opportunities/candidates") && !u.includes("preview")) {
        return new Response(
          JSON.stringify({
            candidates: [],
            suppressionReason: null,
            policy: "uncertain",
            sortBy: "priority",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("", { status: 404 });
    }) as typeof fetch;
  });

  it("mostra estado das fontes quando autenticado", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { id: "1", email: "a@b.c" },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(<CockpitPage />);

    await waitFor(() => {
      expect(screen.getByText("mock")).toBeInTheDocument();
    });
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Lista monitorizada")).toBeInTheDocument();
    });
  });
});
