import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadEnv } from "../../config/env.js";
import { buildApp } from "../../app.js";

describe("Erros JSON", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    const env = loadEnv();
    app = await buildApp(env);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("inclui requestId em erro de validação", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "nope", password: "" },
      headers: { "content-type": "application/json" },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json() as { error: { code: string; requestId: string; message: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
