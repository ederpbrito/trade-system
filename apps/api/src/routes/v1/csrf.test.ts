import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadEnv } from "../../config/env.js";
import { buildApp } from "../../app.js";

describe("CSRF em mutações", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    const env = loadEnv();
    app = await buildApp(env);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejeita logout sem token CSRF (sessão vazia)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: {},
    });
    expect(res.statusCode).toBe(403);
    const body = res.json() as { error: { code: string; requestId: string } };
    expect(body.error.code).toBe("CSRF_INVALID");
    expect(body.error.requestId).toBeTruthy();
  });
});
