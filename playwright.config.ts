/**
 * Playwright e2e config — Story 5.9 (UX-DR15).
 * Três percursos críticos: happy path demo, bloqueio/exceção, fonte degradada.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  /* Não inicia servidor automaticamente — requer `npm run dev` separado */
  webServer: undefined,
});
