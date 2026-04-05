import { afterEach, describe, expect, it, vi } from "vitest";

const envBackup = { ...process.env };

describe("loadEnv — CREDENTIALS_ENCRYPTION_KEY em produção", () => {
  afterEach(() => {
    process.env = { ...envBackup };
    vi.resetModules();
  });

  it("falha no arranque se NODE_ENV=production e a chave falta", async () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@127.0.0.1:5432/t";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz012345";
    process.env.WEB_ORIGIN = "http://localhost:5173";
    delete process.env.CREDENTIALS_ENCRYPTION_KEY;

    const { loadEnv } = await import("./env.js");
    expect(() => loadEnv()).toThrow();
  });

  it("aceita produção com chave hex válida de 64 caracteres", async () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://u:p@127.0.0.1:5432/t";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz012345";
    process.env.WEB_ORIGIN = "http://localhost:5173";
    process.env.CREDENTIALS_ENCRYPTION_KEY = "a".repeat(64);

    const { loadEnv } = await import("./env.js");
    const env = loadEnv();
    expect(env.CREDENTIALS_ENCRYPTION_KEY).toHaveLength(64);
  });
});
