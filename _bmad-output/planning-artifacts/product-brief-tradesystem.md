---
title: "Product Brief: tradesystem"
status: "complete"
created: "2026-04-05T12:00:00Z"
updated: "2026-04-05T15:00:00Z"
inputs:
  - "Conversa de descoberta com Eder (requisitos e visão)"
  - "Referência conceitual: artigo Medium RL → MetaTrader 5 (Javier Santiago Gastón de Iriarte Cabrera)"
---

# Product Brief: tradesystem

## Resumo executivo

O **tradesystem** é um sistema pessoal de apoio à decisão e execução de trades que combina (1) um **agente que aprende com dados** (inspirado em pipelines de aprendizado por reforço da ideia “teoria → implementação operacional”) e (2) um **assistente de análise** que ajuda a enxergar oportunidades e riscos antes de operar. O foco não é prometer lucro garantido — objetivo explícito é um sistema **equilibrado**, com **gestão de risco forte**, **consistência** no processo e **fator de lucro** saudável ao longo do tempo, aprendendo com erros.

O produto monitora **vários ativos** (preferência por **ações no Brasil e nos EUA**, com possibilidade de **exposição em dólar**), destaca **oportunidades** e ancora cada análise numa **janela de operação** explícita: **timeframes de gráfico** e **horizonte temporal** (por **dia**, **semana** ou **mês**). A pergunta central passa a ser **operar ou não — e em qual janela** — com transparência de risco. A trajetória de adoção é **conta demonstrativa primeiro**, com desenho **preparado para produção** quando métricas e controles validarem o comportamento.

## O problema

Operar com consistência exige processar muita informação, manter disciplina de risco e revisar o que funcionou ou falhou. Ferramentas genéricas ou estratégias “manuais” tendem a gerar **fadiga decisória**, **inconsistência** entre o que se planeja e o que se executa, e **pouca memória institucional** sobre erros — o mesmo tipo de equívoco se repete. Por outro lado, bots totalmente autônomos costumam ou **assumir riscos opacos** ou **não conversar** com o operador humano no momento da dúvida.

Para você, a dor é ter um fluxo que una **aprendizado de máquina**, **monitoramento multi-ativo**, **gestão de risco explícita** e **apoio cognitivo** na análise — incluindo **alinhar oportunidade, timeframe e horizonte** (scalp/dia vs swing/semana vs posição/mês) para não misturar contextos de decisão — sem ilusão de “sistema que só lucra”.

## A solução

Um sistema integrado que:

1. **Monitora** uma carteira configurável de ativos (B3 e EUA como prioridade; dólar/FX como extensão).
2. **Identifica oportunidades** candidatas ao longo do dia (sinais, contexto e priorização — não apenas um alerta cru), sempre **rotuladas ou filtráveis** por **timeframe** (ex.: M5, M15, H1, D1 — conforme mercado e dados) e por **janela de operação** no sentido de **horizonte**: **intradiário/dia**, **semanal** ou **mensal** (posição mais longa).
3. **Apoia a decisão** com o assistente explicitando **em qual combinação timeframe + horizonte** a oportunidade faz sentido, **conflitos** entre janelas (ex.: sinal curto contra tendência semanal) e implicações de **risco e tempo de exposição**. O formato exato do assistente — painéis estruturados, explicações, ou interação mais conversacional — continua em aberto no produto.
4. **Incorpora um agente que aprende** com dados e feedback dos resultados (erros e acertos alimentam o ciclo de melhoria).
5. **Impõe e exibe gestão de risco** (limites, exposição, cenários adversos) como parte do fluxo padrão, não como opcional.
6. **Opera primeiro em demo**, com instrumentação e critérios claros para evolução a produção.

## O que diferencia esta abordagem

- **Realismo de expectativas** como requisito: o sucesso é **processo + risco controlado + edge mensurável**, não promessa de lucro contínuo.
- **Duplo núcleo**: aprendizado automático **e** assistência humana na decisão — reduz “caixa-preta” e reforça accountability.
- **Multi-ativo e multi-mercado** como visão, com prioridade geográfica clara (Brasil e EUA).
- **Coerência de janela**: o sistema não trata “operar” como binário único — **timeframe e horizonte (dia / semana / mês)** fazem parte da tese de cada trade e do papel do assistente.
- **Caminho demo → produção** explícito: valor na preparação, não só no protótipo.

O diferencial competitivo, no seu caso, é **execução disciplinada + loop de aprendizado + UX de decisão** adaptada ao seu operacional — não necessariamente um algoritmo único irreplicável.

## Para quem é

- **Usuário primário:** você (uso individual, pesquisa e operação pessoal).
- **Sucesso para o usuário:** menos decisões impulsivas, mais clareza de risco, histórico auditável, sensação de que o sistema **melhora com o tempo** sem esconder perdas ou variância.

## Critérios de sucesso

Mistura de métricas de **processo** e de **performance** (medidas em demo antes de produção):

| Área | Sinais de sucesso (exemplos) |
|------|------------------------------|
| Risco | Limites respeitados; drawdown máximo dentro de faixas definidas por você; rejeição explícita de trades fora de perfil |
| Consistência | Taxa de aderência ao plano; registro completo de “por que entramos / não entramos” |
| Performance | **Profit factor**, retorno ajustado ao risco, estabilidade entre períodos fora da amostra (evitar só “fit” no passado) |
| Aprendizado | Melhoria mensurável após erros documentados (política, features ou parâmetros — conforme arquitetura) |
| Utilidade diária | Visão clara de oportunidades nos ativos monitorados; **cada candidata ligada a timeframe + horizonte**; assistente ajuda a decidir **se a janela atual combina com seu plano** |

## Escopo (MVP e fronteiras)

**Dentro do escopo inicial (demo-first):**

- Lista de ativos monitorados com varredura de oportunidades (incluindo visão **diária** como ritmo principal de uso).
- **Janela de operação** como conceito de primeira classe: seleção ou sugestão de **timeframe(s)** e de **horizonte** (dia / semana / mês); o assistente **apoia a decisão** de operar ou não **nessa** janela (e alerta desalinhamentos).
- Fluxo explícito **oportunidade + janela → análise de risco → recomendação de operar / não operar** (com trilha de auditoria).
- Agente com pipeline de aprendizado (conforme referência RL + integração operacional) **validado em paper/demo**.
- Módulo de gestão de risco configurável (tamanho de posição, perdas diárias, concentração, etc.).

**Fora ou posterior (até segunda ordem):**

- Promessa de rentabilidade mínima ou “só lucro”.
- Produção real sem critérios de validação quantitativos e operacionais acordados.
- Escopo regulatório/compliance de produto para terceiros (não é o foco — uso pessoal).

**Premissa técnica importante:** a referência Medium enfatiza **MetaTrader 5**; **ações B3 e EUA** costumam exigir **corretoras, APIs e feeds** distintos (ou camadas adicionais). O brief assume uma **camada de execução e dados** flexível; detalhar provedores é trabalho de arquitetura/PRD.

## Visão (2–3 anos)

Um cockpit pessoal que unifica **pesquisa, sinal, risco, execução e pós-trade** em vários mercados, com o agente e o assistente cada vez mais alinhados ao seu estilo — mantendo transparência, métricas e humildade estatística diante dos mercados.

## Abordagem técnica (alto nível)

- **Aprendizado por reforço (ou híbrido)** como eixo conceitual, do treino à operação, inspirado na linha “teoria → implementação” da referência compartilhada.
- **Integração com ambientes de negociação** compatíveis com os mercados-alvo (pode incluir MT5 para parte FX/CFD e outras integrações para ações, conforme escolha de corretora).
- **Observabilidade:** logs de decisão (incluindo **timeframe e horizonte** associados a cada sinal ou trade), métricas e reprodutibilidade de experimentos para evitar overfitting silencioso.

---

*Documento vivo: revisar após escolha de corretoras/dados, definição do formato do “assistente” e lista fechada de timeframes/horizontes prioritários.*
