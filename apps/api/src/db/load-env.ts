import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Parser mínimo de `.env` (sem dependência `dotenv`).
 * Garante que valores do ficheiro sobrepõem variáveis de ambiente já definidas (ex.: `DATABASE_URL=""` no Windows).
 */
function parseEnvContent(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = raw.replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function pathDepth(abs: string): number {
  return abs.split(path.sep).filter(Boolean).length;
}

/**
 * Caminhos candidatos a `.env` para scripts em `apps/api` (migrate, seed).
 */
function collectEnvFilePaths(scriptDir: string): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  const add = (p: string) => {
    const abs = path.resolve(p);
    if (seen.has(abs)) return;
    seen.add(abs);
    if (fs.existsSync(abs)) paths.push(abs);
  };

  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 12; i++) {
    add(path.join(dir, ".env"));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // A partir de `src/db/`: `../..` = `apps/api`, `../../../..` = raiz do monorepo
  add(path.join(scriptDir, "..", "..", "..", "..", ".env"));
  add(path.join(scriptDir, "..", "..", ".env"));

  add(path.join(process.cwd(), "apps", "api", ".env"));

  return paths;
}

// Vitest define `VITEST`; não misturar `.env` local com `test.env` do vitest.config.
if (process.env.VITEST !== "true") {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const files = collectEnvFilePaths(scriptDir);
  files.sort((a, b) => pathDepth(a) - pathDepth(b));

  const merged: Record<string, string> = {};
  for (const f of files) {
    Object.assign(merged, parseEnvContent(fs.readFileSync(f, "utf8")));
  }
  for (const [key, value] of Object.entries(merged)) {
    process.env[key] = value;
  }
}
