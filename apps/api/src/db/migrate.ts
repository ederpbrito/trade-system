import "./load-env.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL em falta. Crie `.env` na raiz do monorepo (ex.: copie `.env.example`) com DATABASE_URL=...",
  );
  console.error(
    "Nota (Windows): se existir DATABASE_URL vazia nas variáveis de utilizador/sistema, remova-a — antes o ficheiro .env era ignorado.",
  );
  console.error(`cwd: ${process.cwd()}`);
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const migrationsFolder = path.join(__dirname, "../../drizzle/migrations");

await migrate(db, { migrationsFolder });
await client.end();
console.log("Migrations applied.");
