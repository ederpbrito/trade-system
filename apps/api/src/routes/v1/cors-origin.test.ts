import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loadEnv } from "../../config/env.js";
import { buildApp } from "../../app.js";

describe("CORS — origem permitida vs bloqueada", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const allowed = "http://localhost:5173";

  beforeAll(async () => {
    process.env.WEB_ORIGIN = allowed;
    const env = loadEnv();
    app = await buildApp(env);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("reflecte Access-Control-Allow-Origin para a origem configurada", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { origin: allowed },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(allowed);
  });

  it("não reflecte CORS para origem não permitida (GET)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health",
      headers: { origin: "https://origem-nao-permitida.example" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("preflight OPTIONS sem origem permitida não devolve ACAO para o atacante", async () => {
    const res = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/health",
      headers: {
        origin: "https://origem-nao-permitida.example",
        "access-control-request-method": "GET",
      },
    });
    // Com origem rejeitada o plugin pode não tratar o preflight (404) ou responder sem ACAO.
    expect([204, 404]).toContain(res.statusCode);
    const acao = res.headers["access-control-allow-origin"];
    expect(acao).not.toBe("https://origem-nao-permitida.example");
    expect(acao).toBeUndefined();
  });
});
