# Tradesystem

Monorepo com SPA **Vite + React** (`apps/web`) e **API Fastify** (`apps/api`), PostgreSQL e **Drizzle ORM**.

## Pré-requisitos

- **Node.js** LTS (20 ou 22 recomendado)
- **Docker** (para PostgreSQL em desenvolvimento) ou instância PostgreSQL acessível
- **npm** (incluído com Node) ou **pnpm** (`pnpm-workspace.yaml` incluído para quem preferir pnpm)

## Configuração rápida

1. Copie variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Ajuste `SESSION_SECRET` (mínimo 32 caracteres) e `SESSION_SALT` (mínimo 16 caracteres) em produção.

2. Inicie o PostgreSQL:

   ```bash
   docker compose up -d
   ```

   O Compose expõe o Postgres em **`localhost:5433`** (a porta **5432** no host costuma estar ocupada por instalações locais). O `DATABASE_URL` em `.env.example` já usa essa porta.

3. Instale dependências na raiz:

   ```bash
   npm install
   ```

4. Compile o pacote partilhado e aplique migrações:

   ```bash
   npm run build -w @tradesystem/shared
   npm run db:migrate -w api
   npm run db:seed -w api
   ```

   As migrações actuais incluem o modelo mínimo de mercado (`instruments`, `ohlc_bars`, `connector_health`) e armazenamento de metadados de credenciais de integração (payload encriptado no servidor).

5. Desenvolvimento (web + API):

   ```bash
   npm run dev
   ```

   - SPA: [http://localhost:5173](http://localhost:5173) (proxy `/api` → API, incluindo **WebSocket** para `/api/v1/stream`; após ligar, o cliente envia `{ "type": "subscribe", "payload": { "symbols": ["…"] } }` para receber `market.tick` por símbolo)
   - API: [http://localhost:3001](http://localhost:3001)
   - Healthcheck: `GET http://localhost:3001/api/v1/health`

## Credenciais iniciais (*seed*)

Por defeito (`.env.example`):

- Email: `admin@localhost`
- Palavra-passe: `changeme` (ou o valor de `SEED_USER_PASSWORD` no `.env`)

## Política de sessão (NFR-S3)

- A sessão é armazenada num **cookie encriptado** (*httpOnly*, `SameSite=Lax`), via `@fastify/secure-session`.
- A duração máxima do cookie e da sessão no servidor segue **`SESSION_MAX_AGE_MS`** (por defeito 7 dias), em milissegundos.
- Em **produção**, defina `NODE_ENV=production` para `Secure` no cookie (HTTPS).

## Segurança web (mutações)

- **CORS**: apenas a origem definida em `WEB_ORIGIN` (ex.: `http://localhost:5173`), com `credentials: true`.
- **CSRF**: pedidos `POST`/`PUT`/`PATCH`/`DELETE` sob `/api/v1` (exceto `POST /api/v1/auth/login`) exigem o cabeçalho **`X-CSRF-Token`** alinhado com o token da sessão. Obtenha o token com `GET /api/v1/auth/csrf` (ou no corpo da resposta de login).

## Testes

```bash
npm run test -w api
npm run test -w web
```

Na raiz, `npm test` executa ambos quando configurado.

## Estrutura

- `apps/web` — SPA, rotas `/login` e `/cockpit`
- `apps/api` — REST sob `/api/v1`, Drizzle em `src/db/`, migrações em `drizzle/migrations/`
- `packages/shared` — esquemas Zod partilhados (ex.: login)

### Modularização e SOLID

Regra do Cursor (sempre activa): [`.cursor/rules/tradesystem-modular-solid.mdc`](.cursor/rules/tradesystem-modular-solid.mdc).

**API (`apps/api/src`):** `composition/` (registo de plugins e *wiring*), `plugins/` (transversal), `services/<domínio>/` (casos de uso + `ports.ts`), `repositories/` (persistência Drizzle), `routes/v1/` (HTTP fino), `shared/` (sem regra de negócio).

**Web (`apps/web/src`):** `app/` (*shell*, router, *providers*), `domains/<contexto>/` (ex.: `identity`, `cockpit`), `shared/http/` (cliente da API).

Consulte `_bmad-output/planning-artifacts/architecture.md` para o mapa completo de pastas e padrões (erros `{ error: { code, message, requestId } }`, *snake_case* na BD, *camelCase* no JSON).
