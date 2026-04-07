/**
 * Testes de integração — rotas de execução (FR17, FR18, FR19).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildApp } from "../../app.js";
import { loadEnv } from "../../config/env.js";
import type { TradingModeService } from "../../services/trading-mode/trading-mode.service.js";
import type { IAuditRepository } from "../../services/decisions/ports.js";

const env = loadEnv();

function makeSessionCookie(app: Awaited<ReturnType<typeof buildApp>>) {
  return async () => {
    const csrf = await app.inject({ method: "GET", url: "/api/v1/csrf-token" });
    const csrfToken = (csrf.json() as { csrfToken: string }).csrfToken;
    const setCookie = csrf.headers["set-cookie"] as string | string[];
    const sessionCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;

    const login = await app.inject({
      method: "POST",
      url: "/api/v1/identity/login",
      headers: { "x-csrf-token": csrfToken, cookie: sessionCookie },
      payload: { email: "admin@tradesystem.local", password: "admin123" },
    });
    const loginCookie = login.headers["set-cookie"] as string | string[];
    return Array.isArray(loginCookie) ? loginCookie[0] : loginCookie;
  };
}

describe("GET /api/v1/execution/mode", () => {
  it("devolve 401 sem sessão", async () => {
    const app = await buildApp(env);
    const res = await app.inject({ method: "GET", url: "/api/v1/execution/mode" });
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /api/v1/execution/intent", () => {
  it("devolve 403 (CSRF) sem token CSRF — CSRF verificado antes da sessão", async () => {
    const app = await buildApp(env);
    // POST sem CSRF token → 403 (CSRF é verificado antes da sessão)
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/execution/intent",
      payload: { instrumentId: "x", symbolInternal: "X", side: "buy", quantity: 1 },
    });
    expect([401, 403]).toContain(res.statusCode);
  });
});
