/**
 * Percurso 1 — Happy path: decisão demo (UX-DR15).
 *
 * Cenário: utilizador autenticado regista uma decisão "Operar" em modo demo,
 * com racional obrigatório, e vê confirmação de sucesso.
 *
 * Cobre: FR17, FR20, UX-DR8, UX-DR6 (badge DEMO visível).
 */
import { test, expect } from "@playwright/test";
import { loginViaUI } from "./helpers/auth";

test.describe("Happy path — decisão demo", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test("badge DEMO é visível no cockpit", async ({ page }) => {
    // UX-DR6: badge DEMO persistente
    const demoBadge = page.locator('[aria-label*="demonstração"], [aria-label*="DEMO"]').or(
      page.locator("text=DEMO").first()
    ).first();
    await expect(demoBadge).toBeVisible({ timeout: 8000 });
  });

  test("aviso de incerteza é visível nos fluxos de execução/decisão", async ({ page }) => {
    // FR32/UX-DR14: aviso de incerteza
    const disclaimer = page.locator('[role="note"][aria-label*="incerteza"]').first();
    await expect(disclaimer).toBeVisible({ timeout: 8000 });
  });

  test("formulário de decisão aceita racional obrigatório e submete com sucesso", async ({ page }) => {
    // FR20, UX-DR8: decisão com racional obrigatório — deve SEMPRE passar
    const decisionSection = page
      .locator("section")
      .filter({ hasText: /Registo de decisão/i })
      .first();

    await expect(decisionSection).toBeVisible({ timeout: 8000 });

    // Selecciona "Operar"
    const operarRadio = decisionSection.locator('input[type="radio"][value="operar"]').first();
    await expect(operarRadio).toBeVisible({ timeout: 5000 });
    await operarRadio.check();

    // Preenche racional (obrigatório)
    const rationaleField = decisionSection.locator('textarea').first();
    await expect(rationaleField).toBeVisible({ timeout: 5000 });
    await rationaleField.fill("Tendência de alta confirmada com volume acima da média.");

    // Submete
    const submitBtn = decisionSection.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();

    // Aguarda feedback de sucesso — deve aparecer elemento com "Decisão registada"
    const success = page.locator('[role="status"]').filter({ hasText: /Decisão registada/i }).first();
    await expect(success).toBeVisible({ timeout: 8000 });
  });
});
