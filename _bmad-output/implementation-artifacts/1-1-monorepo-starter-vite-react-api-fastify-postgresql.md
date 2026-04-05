---
story_key: 1-1-monorepo-starter-vite-react-api-fastify-postgresql
epic: 1
story: 1
status: done
generated: "2026-04-05"
---

# Story 1.1: Monorepo, starter Vite/React e API Fastify com PostgreSQL

Status: done

## Story

Como **Eder**,  
quero **repositório com `apps/web`, `apps/api`, Postgres em Docker Compose e Drizzle inicializado**,  
para **ter base alinhada à arquitetura e poder desenvolver funcionalidades sobre ela**.

## Acceptance Criteria

**Given** máquina de desenvolvimento com Node LTS e pnpm instalados  
**When** executo os comandos documentados no README da raiz (install, compose up, migrações)  
**Then** `apps/web` inicia com Vite e `apps/api` responde em healthcheck HTTP  
**And** PostgreSQL está acessível à API e existe pelo menos uma migração Drizzle aplicada (ex.: tabela de utilizador ou metadados mínimos)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

## Dev Notes

### Referências de arquitetura (obrigatório seguir)

- Monorepo `pnpm`, `apps/web` (Vite+React+TS), `apps/api` (Fastify), `packages/shared`, PostgreSQL+Drizzle, REST `/api/v1`, WebSocket envelope `{ type, payload, ts }`.
- Naming: DB `snake_case`, JSON `camelCase`; erros `{ error: { code, message, requestId } }`.
- Conetores em `apps/api/src/connectors/`; domínio em `services/`; rotas em `routes/v1/`.
- Ver `_bmad-output/planning-artifacts/architecture.md` (ADR-001 MT5, ADR-002 LLM/MCP).
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` (componentes cockpit, WCAG AA, layout 3 colunas).
### Notas para o agente de desenvolvimento

- Não reinventar pastas: seguir árvore em `architecture.md` » Project Structure.
- Não expor segredos ao cliente; credenciais só servidor.
- Testes: Vitest (web/api conforme pacote); contract tests em conetores quando aplicável.


### Referências explícitas

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (implementação única com épicos 1-1 a 1-5)

### Debug Log References

### Completion Notes List

- Monorepo com `npm` workspaces (e `pnpm-workspace.yaml` para pnpm); `apps/web` (Vite 6 + React 18), `apps/api` (Fastify 5), `packages/shared`.
- PostgreSQL via `docker-compose.yml`; Drizzle com tabela `users` e migração `0000_initial`.
- Healthcheck: `GET /api/v1/health`. Comandos documentados no `README.md` (install, compose, migrate, seed, dev).

### File List

- `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.env.example`, `docker-compose.yml`, `README.md`
- `packages/shared/**`
- `apps/api/package.json`, `apps/api/tsconfig.json`, `apps/api/drizzle.config.ts`, `apps/api/drizzle/migrations/**`, `apps/api/src/db/**`, `apps/api/src/index.ts`, `apps/api/src/app.ts`, `apps/api/src/config/env.ts`, `apps/api/src/routes/v1/health.ts`, `apps/api/src/plugins/*`, `apps/api/src/lib/errors.ts`, `apps/api/src/connectors/.gitkeep`, `apps/api/src/ws/.gitkeep`, `apps/api/src/jobs/.gitkeep`, `apps/api/vitest.config.ts`, `apps/api/src/routes/v1/health.test.ts`
- `apps/web/package.json`, `apps/web/vite.config.ts`, `apps/web/tsconfig.json`, `apps/web/index.html`, `apps/web/src/main.tsx` (e ficheiros base da SPA)

### Change Log

- 2026-04-05: Entrega inicial do monorepo, API com healthcheck, Drizzle + migração `users`, README com fluxo de desenvolvimento.
- 2026-04-05: **Épico 1 fechado** — artefacto `done` (revisão, `.env`/load-env, Postgres host 5433, `npm run dev` com `wait-on`).
