import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import * as AuthContext from "../context/AuthContext";

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("redirecciona para login quando não autenticado", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/cockpit"]}>
        <Routes>
          <Route path="/login" element={<div data-testid="login">login</div>} />
          <Route
            path="/cockpit"
            element={
              <RequireAuth>
                <div>cockpit</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByTestId("login")).toBeInTheDocument();
  });
});
