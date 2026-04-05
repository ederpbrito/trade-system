---
story_key: 2-6-armazenamento-seguro-de-credenciais-de-integracao
epic: 2
story: 6
status: done
generated: "2026-04-05"
---

# Story 2.6: Armazenamento seguro de credenciais de integração

Status: done

## Story

Como **Eder**,  
quero **guardar credenciais de fontes/conetores sem aparecerem na UI nem no git**,  
para **FR34 e NFR-S2/S5**.

## Acceptance Criteria

**Given** formulário de configuração de fonte no servidor  
**When** guardo credenciais  
**Then** são persistidas encriptadas ou via segredo do ambiente conforme documentação  
**And** nunca são devolvidas em texto claro à API de leitura para o cliente  
**And** `.env.example` lista apenas chaves necessárias, sem valores secretos

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Patch] Com `NODE_ENV=production`, `CREDENTIALS_ENCRYPTION_KEY` obrigatória no arranque (`loadEnv` via `superRefine`). [`apps/api/src/config/env.ts`, `apps/api/src/config/env.production-credentials.test.ts`]

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.6]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor agent (implementação única épico 2 — stories 2-1 a 2-6)

### Debug Log References

### Completion Notes List

- Tabela `integration_credentials` com `encrypted_payload` (AES-256-GCM); `CREDENTIALS_ENCRYPTION_KEY` opcional em dev/test (derivação a partir de `SESSION_SECRET` quando ausente — apenas ambientes não produtivos); em **produção** a chave é obrigatória no `loadEnv()`.
- `POST /api/v1/integration-credentials` (CSRF) grava; `GET` devolve apenas `sourceKey`, `hasSecret`, `updatedAt`.
- Teste `integration-credentials.integration.test.ts` garante ausência de texto claro na resposta.

### File List

- apps/api/src/db/schema.ts
- apps/api/drizzle/migrations/0001_market_data.sql
- apps/api/src/config/env.ts
- apps/api/src/config/env.production-credentials.test.ts
- apps/api/src/repositories/drizzle-integration-credentials.repository.ts
- apps/api/src/services/integration-credentials/credentials-crypto.ts
- apps/api/src/services/integration-credentials/credentials-crypto.test.ts
- apps/api/src/services/integration-credentials/integration-credentials.service.ts
- apps/api/src/routes/v1/integration-credentials.routes.ts
- apps/api/src/routes/v1/integration-credentials.integration.test.ts
- apps/api/src/composition/create-app-services.ts
- apps/api/src/composition/http-stack.ts
- .env.example

### Change Log

- 2026-04-05: Story 2.6 implementada no âmbito do batch épico 2; estado sprint → review.
- 2026-04-05: Code review — estado → in-progress (patch env produção pendente).
- 2026-04-05: Patch aplicado — `superRefine` em `loadEnv` exige `CREDENTIALS_ENCRYPTION_KEY` em produção; teste `env.production-credentials.test.ts`.
- 2026-04-05: Épico 2 fechado — story `done`; `sprint-status` actualizado.
