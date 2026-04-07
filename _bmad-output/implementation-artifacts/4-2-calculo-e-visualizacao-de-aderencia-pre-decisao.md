---
story_key: 4-2-calculo-e-visualizacao-de-aderencia-pre-decisao
epic: 4
story: 2
status: review
generated: "2026-04-05"
---

# Story 4.2: Cálculo e visualização de aderência pré-decisão

Status: review

## Story

Como **Eder**,  
quero **ver se uma intenção respeita os limites antes de confirmar**,  
para **FR14, FR16**.

## Acceptance Criteria

**Given** limites configurados e proposta de tamanho/preço  
**When** solicito pré-visualização de aderência  
**Then** o sistema indica OK vs violação por limite  
**And** posso ver estado dos limites antes e depois da simulação (FR16)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Review Findings

- [x] [Review][Decision] Clarificar o modelo de pré-visualização de aderência — resolvido: separados inputs de limites e proposta, adicionado campo `price`, `before.positionSize=0` e `after.positionSize=proposta`, tipo `AdherenceProposal` distinto de `RiskLimitsInput`.

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.2]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (2026-04-06)

### Debug Log References

(sem bloqueios)

### Completion Notes List

- `RiskService.checkAdherence(limits, proposal)` — método puro (sem I/O) que compara proposta contra limites e devolve `{ ok, violations, before, after }`.
- `violations` lista cada limite violado com `limitKey`, `proposedValue`, `limitValue`, `label` (PT).
- `before`/`after` expõem o estado da proposta antes e depois da simulação (FR16).
- Rota `POST /api/v1/risk/check` carrega limites do utilizador e invoca `checkAdherence`.
- UI: botão "Verificar aderência" no `RiskPanel`; resultado com cor semântica (verde/vermelho); `<details>` com estado antes/depois (FR16); botão "Registar exceção" por violação (ligação à 4.3).
- 10 testes unitários cobrem: OK dentro dos limites, cada tipo de violação, múltiplas violações, limites null, limits=null.

### File List

(ver 4.1 — implementação partilhada no mesmo conjunto de ficheiros)

### Change Log

- 2026-04-06: Implementado como parte do conjunto 4.1/4.2/4.3.
