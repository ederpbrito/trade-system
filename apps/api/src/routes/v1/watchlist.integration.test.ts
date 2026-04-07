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

describe("watchlist + instruments + candidates (integração)", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const email = "integration-watchlist@localhost";
  const password = "integration-test";

  beforeAll(async () => {
    // Barras mock usam `hourOpen` (início da hora UTC); 5 min de *staleness* falhariam fora dos primeiros minutos.
    process.env.MARKET_DATA_MAX_STALENESS_MS = String(3_600_000);
    const env = loadEnv();
    await migrateLatest(env.DATABASE_URL);
    await ensureTestUser(email, password);
    app = await buildApp(env);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("CRUD watchlist e catálogo após ingestão mock", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    const { csrfToken } = login.json() as { csrfToken: string };
    const cookie = cookieHeaderFromSetCookie(login.headers["set-cookie"]);

    const existingWl = await app.inject({ method: "GET", url: "/api/v1/watchlist", headers: { cookie } });
    expect(existingWl.statusCode).toBe(200);
    for (const e of (existingWl.json() as { entries: Array<{ id: string }> }).entries) {
      const delPrev = await app.inject({
        method: "DELETE",
        url: `/api/v1/watchlist/${e.id}`,
        headers: { cookie, "x-csrf-token": csrfToken },
      });
      expect(delPrev.statusCode).toBe(204);
    }

    const sync = await app.inject({
      method: "POST",
      url: "/api/v1/market-data/mock/sync",
      headers: { cookie, "x-csrf-token": csrfToken },
      payload: { simulateFailure: "none" },
    });
    expect(sync.statusCode).toBe(200);

    const cat = await app.inject({ method: "GET", url: "/api/v1/instruments", headers: { cookie } });
    expect(cat.statusCode).toBe(200);
    const instruments = (cat.json() as { instruments: Array<{ id: string }> }).instruments;
    expect(instruments.length).toBeGreaterThan(0);
    const instId = instruments[0]!.id;

    const post = await app.inject({
      method: "POST",
      url: "/api/v1/watchlist",
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { instrumentId: instId, priority: "high" },
    });
    expect(post.statusCode).toBe(201);
    const entry = (post.json() as { entry: { id: string } | null }).entry;
    expect(entry?.id).toBeTruthy();

    const list = await app.inject({ method: "GET", url: "/api/v1/watchlist", headers: { cookie } });
    expect(list.statusCode).toBe(200);
    expect((list.json() as { entries: unknown[] }).entries.length).toBeGreaterThan(0);

    const cand = await app.inject({
      method: "GET",
      url: "/api/v1/opportunities/candidates?sort=priority",
      headers: { cookie },
    });
    expect(cand.statusCode).toBe(200);
    const cj = cand.json() as { candidates: Array<{ timeframe?: string; horizonte?: string }> };
    expect(cj.candidates.length).toBeGreaterThan(0);
    expect(cj.candidates[0]?.timeframe).toBeTruthy();
    expect(cj.candidates[0]?.horizonte).toBeTruthy();

    const patch = await app.inject({
      method: "PATCH",
      url: `/api/v1/watchlist/${entry!.id}`,
      headers: { cookie, "x-csrf-token": csrfToken, "content-type": "application/json" },
      payload: { priority: "low" },
    });
    expect(patch.statusCode).toBe(200);

    const del = await app.inject({
      method: "DELETE",
      url: `/api/v1/watchlist/${entry!.id}`,
      headers: { cookie, "x-csrf-token": csrfToken },
    });
    expect(del.statusCode).toBe(204);
  });
});
