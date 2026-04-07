---
story_key: 3-4-detalhe-do-candidato-com-timeframe-e-horizonte-explicitos
epic: 3
story: 4
status: done
generated: "2026-04-05"
---

# Story 3.4: Detalhe do candidato com timeframe e horizonte explícitos

Status: done

## Story

Como **Eder**,  
quero **painel de detalhe com TF e horizonte visíveis**,  
para **FR6 e UX-DR3/UX-DR4**.

## Acceptance Criteria

**Given** candidato seleccionado  
**When** abro o detalhe  
**Then** timeframe e horizonte são mostrados em chips ou equivalente (UX-DR4)  
**And** cartão/lista segue estados visuais definidos (UX-DR3)

---

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes (N/A)
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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

Composer (lote épico 3)

### Debug Log References

### Completion Notes List

- Painel de detalhe com *chips* TF / horizonte / certeza; estados visuais UX-DR3 (seleccionado, incerto com realce).

### File List

- apps/web/src/domains/cockpit/ui/CockpitPage.tsx
- apps/api/src/services/opportunities/degradation.test.ts

## Change Log

- 2026-04-06: Detalhe do candidato com TF e horizonte explícitos.
