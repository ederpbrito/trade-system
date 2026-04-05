---
story_key: 1-3-identificador-de-correlacao-em-pedidos-e-respostas-de-erro
epic: 1
story: 3
status: done
generated: "2026-04-05"
---

# Story 1.3: Identificador de correlação em pedidos e respostas de erro

Status: done

## Story

Como **Eder**,  
quero **que cada pedido relevante tenha um requestId visível em erros**,  
para **cumprir FR36 e NFR-I3**.

## Acceptance Criteria

**Given** um pedido à API  
**When** ocorre erro 4xx/5xx  
**Then** a resposta JSON inclui `requestId` (ou campo equivalente documentado) alinhado aos logs do servidor  
**And** o cliente pode exibir ou copiar esse id (detalhe UX completo no Épico 5 — aqui mínimo em JSON + log)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent

### Debug Log References

### Completion Notes List

- Plugin `requestId`: UUID por pedido (ou `X-Request-Id` válido); propagado ao *child logger* do Fastify.
- Respostas de erro no formato `{ error: { code, message, requestId } }` via `sendError` e `errorHandler` (inclui Zod e erros 5xx).
- Teste `errors.test.ts` valida `requestId` em erro de validação.

### File List

- `apps/api/src/plugins/requestId.ts`, `apps/api/src/plugins/errorHandler.ts`, `apps/api/src/lib/errors.ts`
- `apps/api/src/app.ts`, `apps/api/src/index.ts`
- `apps/api/src/routes/v1/errors.test.ts`

### Change Log

- 2026-04-05: RequestId e formato de erro alinhados à arquitectura e testes Vitest.
- 2026-04-05: **Épico 1 fechado** — artefacto `done` (guard `VITEST` em `load-env` para não sobrescrever `vitest.config`).
