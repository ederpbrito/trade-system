import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { loadEnv } from "../../config/env.js";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function cookieHeaderFromSetCookie(setCookie: string | string[] | undefined): string {
  if (!setCookie) return "";
  const parts = Array.isArray(setCookie) ? setCookie : [setCookie];
  return parts.map((p) => p.split(";")[0]!.trim()).join("; ");
}

async function migrateLatest(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 1 });
  const d = drizzle(client);
  const migrationsFolder = path.join(__dirname, "../../../drizzle/migrations");
  await migrate(d, { migrationsFolder });
  await client.end();
}

async function ensureTestUser(email: string, password: string) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 4);
  await db.insert(users).values({ email, passwordHash });
}

describe("risk routes (integração)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const email = "integration-risk@localhost";
  const password = "integration-test-risk";
  let cookie: string;
  let csrfToken: string;

  beforeAll(async () => {
    const env = loadEnv();
    await migrateLatest(env.DATABASE_URL);
    await ensureTestUser(email, password);
    app = await buildApp(env);
    await app.ready();

    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    csrfToken = (login.json() as { csrfToken: string }).csrfToken;
    cookie = cookieHeaderFromSetCookie(login.headers["set-cookie"]);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/risk/limits — devolve 401 sem sessão", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/risk/limits" });
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/v1/risk/limits — devolve 200 com sessão autenticada (bug da chave de sessão)", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/risk/limits", headers: { cookie } });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { limits: unknown };
    expect("limits" in body).toBe(true);
  });

  it("PUT /api/v1/risk/limits — persiste limites válidos", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/v1/risk/limits",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { maxPositionSize: 10, maxDailyLoss: 500, maxConcentration: 0.2, maxTotalExposure: 5000 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { limits: { maxPositionSize: number } };
    expect(body.limits.maxPositionSize).toBe(10);
  });

  it("PUT /api/v1/risk/limits — rejeita valor inválido com 422", async () => {
    const res = await app.inject({
      method: "PUT",
      url: "/api/v1/risk/limits",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { maxPositionSize: -5 },
    });
    expect(res.statusCode).toBe(422);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("RISK_LIMITS_INVALID");
  });

  it("POST /api/v1/risk/check — devolve resultado de aderência com before/after distintos", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/risk/check",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { positionSize: 5, price: 1.2345, currentDailyLoss: 100 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { result: { ok: boolean; before: { positionSize: number }; after: { positionSize: number } } };
    expect(body.result.ok).toBe(true);
    expect(body.result.before.positionSize).toBe(0);
    expect(body.result.after.positionSize).toBe(5);
  });

  it("POST /api/v1/risk/check — detecta violação quando proposta excede limite guardado", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/risk/check",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { positionSize: 99 },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { result: { ok: boolean; violations: Array<{ limitKey: string }> } };
    expect(body.result.ok).toBe(false);
    expect(body.result.violations[0]?.limitKey).toBe("maxPositionSize");
  });

  it("POST /api/v1/risk/exception — regista exceção com motivo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/risk/exception",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: {
        limitKey: "maxPositionSize",
        proposedValue: 99,
        limitValue: 10,
        reason: "Oportunidade excecional de teste",
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json() as { exception: { approved: boolean; reason: string } };
    expect(body.exception.approved).toBe(true);
    expect(body.exception.reason).toBe("Oportunidade excecional de teste");
  });

  it("POST /api/v1/risk/exception — rejeita limitKey inválido com 422", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/risk/exception",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: {
        limitKey: "invalidKey",
        proposedValue: 99,
        limitValue: 10,
        reason: "teste",
      },
    });
    expect(res.statusCode).toBe(422);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("RISK_INVALID_LIMIT_KEY");
  });

  it("POST /api/v1/risk/exception — rejeita motivo vazio com 422", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/risk/exception",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: {
        limitKey: "maxPositionSize",
        proposedValue: 99,
        limitValue: 10,
        reason: "   ",
      },
    });
    expect(res.statusCode).toBe(422);
    const body = res.json() as { error: { code: string } };
    expect(body.error.code).toBe("RISK_EXCEPTION_REASON_REQUIRED");
  });

  it("GET /api/v1/risk/exceptions — devolve trilha de exceções", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/risk/exceptions", headers: { cookie } });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { exceptions: unknown[] };
    expect(Array.isArray(body.exceptions)).toBe(true);
    expect(body.exceptions.length).toBeGreaterThan(0);
  });
});
