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

describe("POST /api/v1/market-data/mock/sync (integração)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const email = "integration-market@localhost";
  const password = "integration-test";

  beforeAll(async () => {
    const env = loadEnv();
    await migrateLatest(env.DATABASE_URL);
    await ensureTestUser(email, password);
    app = await buildApp(env);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("grava barras e expõe saúde na API", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    const { csrfToken } = login.json() as { csrfToken: string };
    const cookie = cookieHeaderFromSetCookie(login.headers["set-cookie"]);

    const sync = await app.inject({
      method: "POST",
      url: "/api/v1/market-data/mock/sync",
      headers: {
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { simulateFailure: "none" },
    });
    expect(sync.statusCode).toBe(200);
    const syncBody = sync.json() as { ok: boolean; barsWritten: number };
    expect(syncBody.ok).toBe(true);
    expect(syncBody.barsWritten).toBeGreaterThan(0);

    const health = await app.inject({
      method: "GET",
      url: "/api/v1/data-sources/health",
      headers: { cookie },
    });
    expect(health.statusCode).toBe(200);
    const h = health.json() as { sources: Array<{ connectorId: string; state: string }> };
    expect(h.sources.some((s) => s.connectorId === "mock")).toBe(true);
  });
});
