/**
 * Helpers de autenticação para testes e2e.
 */
import type { Page } from "@playwright/test";

const DEFAULT_EMAIL = process.env.E2E_USER_EMAIL ?? "test@tradesystem.local";
const DEFAULT_PASSWORD = process.env.E2E_USER_PASSWORD ?? "password123";

/**
 * Faz login na aplicação via UI.
 * Pressupõe que existe um utilizador com as credenciais de teste.
 */
export async function loginViaUI(page: Page, email = DEFAULT_EMAIL, password = DEFAULT_PASSWORD) {
  await page.goto("/");
  // Redireciona para login se não autenticado
  await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  await page.fill('[data-testid="email-input"], input[type="email"], input[name="email"]', email);
  await page.fill('[data-testid="password-input"], input[type="password"], input[name="password"]', password);
  await page.click('[data-testid="login-btn"], button[type="submit"]');
  // Aguarda redirecionamento para cockpit
  await page.waitForURL(/\/cockpit/, { timeout: 10000 });
}
