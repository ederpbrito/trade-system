import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      VITEST: "true",
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://tradesystem:tradesystem@127.0.0.1:5433/tradesystem",
      SESSION_SECRET: "abcdefghijklmnopqrstuvwxyz012345",
      SESSION_SALT: "mq9hDxBvDpmsObGC",
      SESSION_MAX_AGE_MS: "604800000",
      WEB_ORIGIN: "http://localhost:5173",
    },
    fileParallelism: false,
  },
});
