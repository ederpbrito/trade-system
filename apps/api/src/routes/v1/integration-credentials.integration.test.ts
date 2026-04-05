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

describe("integration-credentials API", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const email = "integration-creds@localhost";
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

  it("não devolve segredos em texto claro no GET", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    const { csrfToken } = login.json() as { csrfToken: string };
    const cookie = cookieHeaderFromSetCookie(login.headers["set-cookie"]);

    const save = await app.inject({
      method: "POST",
      url: "/api/v1/integration-credentials",
      headers: {
        cookie,
        "x-csrf-token": csrfToken,
      },
      payload: { sourceKey: "test-connector", credentials: { apiKey: "super-secret-value" } },
    });
    expect(save.statusCode).toBe(200);

    const list = await app.inject({
      method: "GET",
      url: "/api/v1/integration-credentials",
      headers: { cookie },
    });
    expect(list.statusCode).toBe(200);
    const raw = list.body;
    expect(raw).not.toContain("super-secret-value");
    expect(raw).not.toContain("encrypted_payload");
    const body = JSON.parse(raw) as { credentials: Array<{ sourceKey: string; hasSecret: boolean }> };
    const row = body.credentials.find((c) => c.sourceKey === "test-connector");
    expect(row?.hasSecret).toBe(true);
  });
});
