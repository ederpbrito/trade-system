---
story_key: 1-2-autenticacao-de-sessao-para-aceder-ao-cockpit
epic: 1
story: 2
status: review
generated: "2026-04-05"
---

# Story 1.2: Autenticação de sessão para aceder ao cockpit

Status: review

## Story

Como **Eder**,  
quero **iniciar e terminar sessão com credenciais da instância**,  
para **cumprir FR33 e proteger o cockpit**.

## Acceptance Criteria

**Given** utilizador registado ou *seed* de utilizador único na instância  
**When** submeto login válido  
**Then** recebo sessão segura (cookie httpOnly conforme arquitetura) e sou redireccionado para a área autenticada  
**When** termino sessão  
**Then** o cookie é invalidado e não consigo aceder a rotas protegidas sem novo login  
**And** política de expiração de sessão está documentada (NFR-S3)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent

### Debug Log References

### Completion Notes List

- Sessão com `@fastify/secure-session` (cookie httpOnly, SameSite=Lax); expiração documentada no README (NFR-S3 / `SESSION_MAX_AGE_MS`).
- Rotas `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`; *seed* `npm run db:seed -w api` com `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.
- SPA: `AuthContext`, login e pedidos com `credentials: "include"`; após logout a sessão é removida e `/api/v1/auth/me` devolve 401.

### File List

- `apps/api/src/routes/v1/auth.ts`, `apps/api/src/services/authService.ts`, `apps/api/src/db/seed.ts`, `apps/api/src/types/secure-session.d.ts`
- `packages/shared/src/schemas/auth.ts`
- `apps/web/src/auth/AuthContext.tsx`, `apps/web/src/features/auth/LoginPage.tsx`, `apps/web/src/lib/api.ts`
- `README.md` (política de sessão e credenciais *seed*)

### Change Log

- 2026-04-05: Autenticação por sessão segura, *seed* de utilizador e documentação de expiração de sessão.
