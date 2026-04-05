---
story_key: 1-4-protecao-csrf-e-cors-em-mutacoes-da-api
epic: 1
story: 4
status: review
generated: "2026-04-05"
---

# Story 1.4: Protecção CSRF e CORS em mutações da API

Status: review

## Story

Como **Eder**,  
quero **mutações protegidas contra CSRF com CORS explícito**,  
para **alinhamento com NFR-S3 em ambiente web**.

## Acceptance Criteria

**Given** SPA em origem permitida na configuração da API  
**When** executo uma mutação autenticada (POST/PUT/PATCH/DELETE)  
**Then** o pedido é validado conforme estratégia escolhida (token CSRF ou *SameSite*+origem documentada)  
**And** pedidos de origens não permitidas são rejeitados

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent

### Debug Log References

### Completion Notes List

- CORS: `@fastify/cors` com `origin: WEB_ORIGIN`, `credentials: true`, métodos e cabeçalhos explícitos (inclui `X-CSRF-Token`).
- CSRF: *hook* `preHandler` em `POST`/`PUT`/`PATCH`/`DELETE` sob `/api/v1` excepto login; compara `X-CSRF-Token` ao valor na sessão; `GET /api/v1/auth/csrf` para obter token.
- SameSite=Lax no cookie de sessão documentado no README como camada adicional.
- Teste `csrf.test.ts` cobre rejeição de mutação sem token válido.

### File List

- `apps/api/src/app.ts`, `apps/api/src/routes/v1/auth.ts`
- `apps/web/src/lib/api.ts`, `apps/web/src/auth/AuthContext.tsx`
- `README.md` (secção CSRF/CORS)
- `apps/api/src/routes/v1/csrf.test.ts`

### Change Log

- 2026-04-05: CORS restrito e validação de CSRF em mutações com testes.
