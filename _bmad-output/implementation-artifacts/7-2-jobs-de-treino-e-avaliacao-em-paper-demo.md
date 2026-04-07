---
story_key: 7-2-jobs-de-treino-e-avaliacao-em-paper-demo
epic: 7
story: 2
status: done
generated: "2026-04-05"
---

# Story 7.2: Jobs de treino e avaliação em paper/demo

Status: done

## Story

Como **Eder**,  
quero **disparar ciclo de treino/avaliação apenas em ambiente paper/demo**,  
para **FR22**.

## Acceptance Criteria

**Given** configuração paper  
**When** solicito treino  
**Then** job corre isoladamente da produção e estado é visível (queued/running/failed/success)

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium

### Debug Log References

### Completion Notes List

- Tabela `training_jobs` com enum `training_job_status` (queued/running/success/failed) adicionada ao schema.
- `TrainingJobService` com `createAndRun` que executa ciclo de treino isolado em paper/demo.
- Simulação determinística de treino (`simulatePaperTraining`) que gera métricas sintéticas por versão de política.
- Porta `ITrainingJobRepository` + `DrizzleTrainingJobRepository` implementados.
- Rotas `GET /api/v1/training-jobs`, `GET /api/v1/training-jobs/:id`, `POST /api/v1/training-jobs`.
- Estado visível: queued → running → success/failed com timestamps.
- 4 testes unitários para `TrainingJobService`.

### File List

- apps/api/src/services/training/ports.ts (novo)
- apps/api/src/services/training/training-job.service.ts (novo)
- apps/api/src/services/training/training-job.service.test.ts (novo)
- apps/api/src/repositories/drizzle-training-job.repository.ts (novo)
- apps/api/src/routes/v1/training-jobs.routes.ts (novo)
- apps/api/src/composition/create-app-services.ts (modificado)
- apps/api/src/composition/http-stack.ts (modificado)

### Change Log

- 2026-04-07: Implementação completa da história 7.2 — jobs de treino em paper/demo, estado visível, rotas e testes.

### Review Findings

- [x] [Review][Patch] `POST /api/v1/training-jobs` não verifica modo demo/paper — **resolvido**: gate `403` quando `currentMode !== "demo"` (`training-jobs.routes.ts`, batch 2026-04-07).
- [x] [Review][Patch] `policy_version` no job não reflectia a versão resolvida — **resolvido**: versão calculada antes de `jobRepo.create` (`training-job.service.ts`, batch 2026-04-07).
