/**
 * Testes do ApiErrorDisplay — FR36, UX-DR12.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApiErrorDisplay } from "./ApiErrorDisplay";

describe("ApiErrorDisplay", () => {
  it("não renderiza nada quando error é null", () => {
    const { container } = render(<ApiErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("mostra mensagem de erro", () => {
    render(<ApiErrorDisplay error={{ message: "Algo correu mal." }} />);
    expect(screen.getByText("Algo correu mal.")).toBeInTheDocument();
  });

  it("mostra código de erro", () => {
    render(<ApiErrorDisplay error={{ code: "UNAUTHORIZED", message: "Não autenticado." }} />);
    expect(screen.getByText("UNAUTHORIZED")).toBeInTheDocument();
  });

  it("mostra requestId copiável quando presente (FR36)", () => {
    const requestId = "req-abc-123";
    render(<ApiErrorDisplay error={{ message: "Erro.", requestId }} />);
    expect(screen.getByText(requestId)).toBeInTheDocument();
    const copyBtn = screen.getByRole("button", { name: /copiar requestid/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it("não mostra botão de cópia quando requestId está ausente", () => {
    render(<ApiErrorDisplay error={{ message: "Erro sem requestId." }} />);
    const copyBtn = screen.queryByRole("button", { name: /copiar requestid/i });
    expect(copyBtn).not.toBeInTheDocument();
  });

  it("tem role alert para acessibilidade", () => {
    render(<ApiErrorDisplay error={{ message: "Erro." }} />);
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
  });
});
