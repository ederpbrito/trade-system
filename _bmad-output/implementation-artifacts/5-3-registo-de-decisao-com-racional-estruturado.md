---
story_key: 5-3-registo-de-decisao-com-racional-estruturado
epic: 5
story: 3
status: review
generated: "2026-04-05"
---

# Story 5.3: Registo de decisão com racional estruturado

Status: review

## Story

Como **Eder**,  
quero **registar operar / não operar com racional**,  
para **FR20 e UX-DR8**.

## Acceptance Criteria

**Given** fluxo pós-análise  
**When** escolho decisão e preencho campos mínimos do racional  
**Then** registo é persistido e associado à janela e ao candidato  
**And** validação impede submissão vazia onde o PRD exige estrutura mínima

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.3]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-07)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Tabela `decision_log` criada no schema Drizzle com campos: decision, instrumentId, symbolInternal, timeframe, horizonte, candidateId, orderIntentId, rationale (obrigatório), tagsJson, note, mode.
- `DecisionsService` em `apps/api/src/services/decisions/` com validação de racional obrigatório e tipo de decisão.
- `DrizzleDecisionRepository` persiste e consulta decisões com filtros.
- Rota `POST /api/v1/decisions` persiste decisão associada à janela e ao candidato.
- Formulário `DecisionForm.tsx` (UX-DR8): campos decisão (radio operar/não operar), motivo (obrigatório), tags (opcional, multi-select), nota breve (opcional).
- Validação no cliente impede submissão com racional vazio.
- Validação no servidor rejeita racional vazio com código `DECISION_RATIONALE_REQUIRED`.
- 7 testes unitários passam em `decisions.service.test.ts`.

### File List

- `apps/api/src/services/decisions/ports.ts` (novo)
- `apps/api/src/services/decisions/decisions.service.ts` (novo)
- `apps/api/src/services/decisions/decisions.service.test.ts` (novo)
- `apps/api/src/repositories/drizzle-decision.repository.ts` (novo)
- `apps/api/src/routes/v1/decisions.routes.ts` (novo)
- `apps/api/src/routes/v1/decisions.integration.test.ts` (novo)
- `apps/web/src/domains/cockpit/ui/DecisionForm.tsx` (novo)
- `apps/api/src/db/schema.ts` (modificado — tabela decision_log)

## Change Log

- 2026-04-07: Implementação completa da Story 5.3 — registo de decisão com racional estruturado, validação e formulário UX-DR8.
