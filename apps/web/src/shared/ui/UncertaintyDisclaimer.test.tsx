/**
 * Testes do UncertaintyDisclaimer — FR32, UX-DR14.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UncertaintyDisclaimer } from "./UncertaintyDisclaimer";

describe("UncertaintyDisclaimer", () => {
  it("renderiza aviso com role note", () => {
    render(<UncertaintyDisclaimer />);
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("contém texto de aviso de garantia financeira", () => {
    render(<UncertaintyDisclaimer />);
    expect(screen.getAllByText(/garantia de resultado financeiro/i).length).toBeGreaterThan(0);
  });

  it("variante compact mostra texto compacto", () => {
    render(<UncertaintyDisclaimer variant="compact" />);
    expect(screen.getAllByText(/Sem garantia de resultado/i).length).toBeGreaterThan(0);
  });

  it("variante banner mostra título 'Aviso importante'", () => {
    render(<UncertaintyDisclaimer variant="banner" />);
    expect(screen.getAllByText("Aviso importante").length).toBeGreaterThan(0);
  });

  it("mostra contexto quando fornecido", () => {
    render(<UncertaintyDisclaimer context="BTCUSD" />);
    expect(screen.getAllByText(/BTCUSD/).length).toBeGreaterThan(0);
  });

  it("tem aria-label de incerteza", () => {
    render(<UncertaintyDisclaimer />);
    const els = screen.getAllByRole("note");
    expect(els.length).toBeGreaterThan(0);
    expect(els[0]).toHaveAttribute("aria-label");
  });
});
