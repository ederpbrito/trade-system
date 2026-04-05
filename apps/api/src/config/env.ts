import "../db/load-env.js";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET deve ter pelo menos 32 caracteres"),
  SESSION_SALT: z.string().min(16).default("dev-salt-not-for-prod"),
  SESSION_MAX_AGE_MS: z.coerce.number().default(7 * 24 * 60 * 60 * 1000),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  /** 64 hex (32 bytes). Opcional em dev/test — ver IntegrationCredentialsService. */
  CREDENTIALS_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "CREDENTIALS_ENCRYPTION_KEY deve ser 64 caracteres hexadecimais")
    .optional(),
  OPPORTUNITY_DEGRADATION_POLICY: z.enum(["suppress", "uncertain"]).default("suppress"),
  /** Idade máxima da última barra para considerar dados frescos (FR27). */
  MARKET_DATA_MAX_STALENESS_MS: z.coerce.number().default(300_000),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === "production" && !data.CREDENTIALS_ENCRYPTION_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "CREDENTIALS_ENCRYPTION_KEY é obrigatória em produção (64 caracteres hexadecimais).",
      path: ["CREDENTIALS_ENCRYPTION_KEY"],
    });
  }
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Variáveis de ambiente inválidas");
  }
  return parsed.data;
}
