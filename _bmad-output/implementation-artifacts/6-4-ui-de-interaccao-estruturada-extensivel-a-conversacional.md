---
story_key: 6-4-ui-de-interaccao-estruturada-extensivel-a-conversacional
epic: 6
story: 4
status: done
generated: "2026-04-05"
---

# Story 6.4: UI de interacção estruturada (e extensível a conversacional)

Status: done

## Story

Como **Eder**,  
quero **interagir com o assistente no formato suportado (painel + possível chat)**,  
para **FR12**.

## Acceptance Criteria

**Given** painel do assistente na terceira coluna ou drawer  
**When** refresco contexto ao mudar candidato  
**Then** o conteúdo actualiza sem perder estado de sessão irrelevante  
**And** se chat existir, mensagens incluem *disclaimer* e não substituem checks de risco

---

## Épico 7: Agente versionado, experimentos em paper e comparação de desempenho

## Tasks / Subtasks

- [x] Implementar conforme AC (referir cada Given/When/Then nos commits ou PR)
- [x] Actualizar documentação em README se novos comandos/composes
- [x] Testes mínimos alinhados à história

### Senior Developer Review (AI)

**Outcome:** Changes Requested → Resolvido  
**Data:** 2026-04-07

### Review Follow-ups (AI)

- [x] [Review][Patch] Race condition em mudanças rápidas de candidato — adicionado `AbortController` [AssistantPanel.tsx:116]
- [x] [Review][Patch] ID `asst-title` hardcoded podia duplicar — substituído por `useId()` [AssistantPanel.tsx:104]
- [x] [Review][Patch] `adherenceSummary` null sem guarda quando `hasLimits=true` — adicionada verificação [AssistantPanel.tsx:318]
- [x] [Review][Patch] Teste de preservação de estado com asserção fraca — verificação de conteúdo visível adicionada [AssistantPanel.test.tsx:227]

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

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.4]
- [Source: `_bmad-output/planning-artifacts/prd.md`]
- [Source: `_bmad-output/planning-artifacts/architecture.md`]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium (Cursor)

### Debug Log References

Sem bloqueios.

### Completion Notes List

- Given painel do assistente na terceira coluna / When refresco contexto ao mudar candidato / Then o conteúdo actualiza sem perder estado de sessão irrelevante — implementado com useRef(prevCandidateId) + useState(expandedSections) preservado entre mudanças de candidato
- And se chat existir, mensagens incluem disclaimer e não substituem checks de risco — disclaimer implementado com role="note" no rodapé do AssistantPanel
- AssistantPanel integrado na terceira coluna do CockpitPage (layout wide) substituindo placeholder
- Secções expansíveis (toggle) com estado de expansão preservado ao mudar candidato
- 12 testes UI passam (AssistantPanel.test.tsx)

### File List

- apps/web/src/domains/cockpit/ui/AssistantPanel.tsx (novo)
- apps/web/src/domains/cockpit/ui/AssistantPanel.test.tsx (novo)
- apps/web/src/domains/cockpit/ui/CockpitPage.tsx (modificado — integração AssistantPanel)

### Change Log

- 2026-04-07: Implementação da UI de interação estruturada do assistente (FR12) com atualização de contexto e disclaimer.
