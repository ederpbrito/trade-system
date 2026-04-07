---
story_key: 7-1-politica-versionada-que-influencia-ranking-de-candidatos
epic: 7
story: 1
status: done
generated: "2026-04-05"
---

# Story 7.1: Política versionada que influencia ranking de candidatos

Status: done

## Story

Como **Eder**,  
quero **classificar candidatos com política registada e versionada**,  
para **FR21**.

## Acceptance Criteria

**Given** política v1 aplicada  
**When** listo candidatos  
**Then** ordenação ou *score* reflecte a política e a versão fica em metadados consultáveis

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.1]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

### Completion Notes List

- Tabela `ranking_policies` adicionada ao schema DB com versão incremental, pesos JSON e flag `isActive`.
- Migração `0006_epic7_ranking_training_experiments.sql` criada.
- `RankingPolicyService` + porta `IRankingPolicyRepository` + `DrizzleRankingPolicyRepository` implementados.
- Função `computePolicyScore` e `sortCandidatesByPolicy` adicionadas ao `candidate-sort.ts` (FR21).
- Rota `GET /api/v1/ranking-policies`, `GET /api/v1/ranking-policies/active`, `POST /api/v1/ranking-policies` criadas.
- Resposta de `GET /api/v1/opportunities/candidates` inclui `rankingPolicy: { version, name }` quando há política activa.
- Suporte a `?sort=policy` na rota de candidatos para ordenação por política versionada.
- 4 testes unitários para `RankingPolicyService` + 5 testes para `computePolicyScore`/`sortCandidatesByPolicy`.

### File List

- apps/api/src/db/schema.ts (modificado — tabelas ranking_policies, training_jobs, experiment_runs)
- apps/api/drizzle/migrations/0006_epic7_ranking_training_experiments.sql (novo)
- apps/api/src/services/ranking-policy/ports.ts (novo)
- apps/api/src/services/ranking-policy/ranking-policy.service.ts (novo)
- apps/api/src/services/ranking-policy/ranking-policy.service.test.ts (novo)
- apps/api/src/repositories/drizzle-ranking-policy.repository.ts (novo)
- apps/api/src/services/opportunities/candidate-sort.ts (modificado — computePolicyScore, sortCandidatesByPolicy)
- apps/api/src/services/opportunities/candidate-sort-policy.test.ts (novo)
- apps/api/src/routes/v1/ranking-policies.routes.ts (novo)
- apps/api/src/routes/v1/opportunities.routes.ts (modificado — suporte a sort=policy e rankingPolicy nos metadados)
- apps/api/src/composition/create-app-services.ts (modificado)
- apps/api/src/composition/http-stack.ts (modificado)

### Change Log

- 2026-04-07: Implementação completa da história 7.1 — política versionada, score por política, rotas e testes.

### Review Findings

- [x] [Review][Patch] Documentar no `README.md` da raiz as rotas do épico 7 (`/api/v1/ranking-policies`, `/api/v1/training-jobs`, `/api/v1/experiments`) e a página SPA `/experiments` — **resolvido** (batch review 2026-04-07).
- [x] [Review][Defer] `JSON.parse(row.weightsJson)` em `drizzle-ranking-policy.repository.ts` sem validação — dados corruptos na BD podem derrubar o pedido com 500; hardening transversal.
