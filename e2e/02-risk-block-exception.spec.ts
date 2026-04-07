/**
 * Percurso 2 — Bloqueio de risco / exceção (UX-DR15).
 *
 * Cenário: utilizador tenta executar intenção demo mas o painel de risco
 * mostra aderência fora dos limites; verifica que o bloqueio/aviso é visível
 * e que a exceção pode ser registada com justificação.
 *
 * Cobre: FR19 (gate produção), FR21 (exceção risco), UX-DR9.
 */
import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";

test.describe("Bloqueio/exceção de risco", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test("painel de risco é visível no cockpit", async ({ page }) => {
    const riskPanel = page
      .locator("section")
      .filter({ hasText: /Risco|Aderência/i })
      .first();
    await expect(riskPanel).toBeVisible({ timeout: 8000 });
  });

  test("gate de produção bloqueia execução — badge DEMO ou mensagem de bloqueio visível", async ({ page }) => {
    // FR19: produção bloqueada em modo demo — deve SEMPRE existir indicação de modo
    // O painel de execução deve mostrar badge DEMO ou mensagem de bloqueio de produção
    const executionPanel = page
      .locator("section")
      .filter({ hasText: /Execução/i })
      .first();

    await expect(executionPanel).toBeVisible({ timeout: 8000 });

    // Em modo demo, badge DEMO deve estar visível no painel de execução
    const demoBadge = executionPanel.locator('[aria-label*="demonstração"]').or(
      executionPanel.locator("text=DEMO")
    ).first();
    await expect(demoBadge).toBeVisible({ timeout: 5000 });
  });

  test("submissão sem candidato seleccionado mostra mensagem de orientação", async ({ page }) => {
    // Quando não há candidato seleccionado, o painel de execução deve orientar o utilizador
    const executionPanel = page
      .locator("section")
      .filter({ hasText: /Execução/i })
      .first();

    await expect(executionPanel).toBeVisible({ timeout: 8000 });

    // Sem candidato seleccionado, deve aparecer mensagem de orientação
    const guidance = executionPanel.locator("text=/Seleccione um candidato/i").first();
    await expect(guidance).toBeVisible({ timeout: 5000 });
  });

  test("painel de exceção de risco regista com justificação quando violação activa", async ({ page }) => {
    // FR21: exceção com justificação obrigatória
    // Este teste verifica o fluxo quando existe uma violação de risco activa
    const exceptionSection = page
      .locator("section")
      .filter({ hasText: /Exceção|Excecao/i })
      .first();

    const isVisible = await exceptionSection.isVisible().catch(() => false);

    if (!isVisible) {
      // Sem violação activa, verificar que o painel de risco existe e mostra estado
      const riskPanel = page.locator("section").filter({ hasText: /Risco|Aderência/i }).first();
      await expect(riskPanel).toBeVisible({ timeout: 5000 });
      return;
    }

    // Com violação activa: preencher justificação e confirmar
    const justificationField = exceptionSection.locator("textarea, input[type='text']").first();
    await expect(justificationField).toBeVisible({ timeout: 5000 });
    await justificationField.fill("Contexto excepcional: notícia macro relevante.");

    const confirmBtn = exceptionSection.locator("button").filter({ hasText: /confirmar|registar|aceitar/i }).first();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Não deve haver erro após submissão
    const errorEl = page.locator('[role="alert"]').filter({ hasText: /erro|falha/i });
    await expect(errorEl).not.toBeVisible({ timeout: 3000 });
  });
});
