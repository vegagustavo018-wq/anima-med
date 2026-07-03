# ESTRUTURA VISUAL DO INTERNATO — v2 (reformulada após painel; pronta para implementar)
# Painel r1: UX 7.5 · Edu-médica 7 · Guardião ANIMA 8 · Front-end 7.5. Correções P0/P1 incorporadas.

## 0. Princípio
UX centrada em ROTAÇÃO + COMPETÊNCIA (não na árvore de tópicos dos S1-9). O internato é um **passaporte de plantão**, não uma enciclopédia. Toda mudança serve à pedagogia (competência real, anti-Dunning-Kruger, erro sem culpa), não à novidade.

## 1. CONTRATO DE DADOS (resolver ANTES de qualquer UI — era o P0 bloqueante)
- **Schema (schema.ts):** NÃO poluir `TipoBloco` dos S1-9. Adicionar campo opcional `metadata.formato_internato?: 'caso' | 'epa' | 'procedimento' | 'reflexao' | 'analise_erro' | 'integrador' | 'avaliacao' | 'visao_geral'`. O gerador de esqueleto emite esse campo a partir do `tipo_bloco` do blueprint. Blocos S1-9 não têm o campo (fallback → comportamento atual intacto).
- **Persistência SAGRADA (Dexie v5) — lado progresso, NUNCA em `blocos`:**
  - `logbook`: `++id, estagio_id, procedimento` + `{ registros: [{ data, supervisor?, nivel_supervisao_1a5, nota_curta, complicacao? }] }`. O contador é derivado de `registros.length`.
  - `epaProgresso`: `[estagio_id+epa_codigo]` + `{ auto_nivel, observado_nivel?, historico: [{data, instrumento, nivel}] }`.
  - `reflexoes`: `++id, evento_ref` (aponta para um logbook/caso vivido) + campos de Gibbs.
  - `passaporte`: agregados derivados (não fonte da verdade — computado de logbook+epaProgresso+casos+reflexoes).
  - `backup.ts` (export do aluno) DEVE incluir as 4 tabelas novas.
- **Roteamento (BlocoPage):** guard de `status==='esqueleto'` ACIMA de um mapa declarativo `PELE_POR_FORMATO: Record<Formato, Componente>`; fallback ao render atual dos S1-9. Mudança puramente ADITIVA. O esqueleto já mostra o placeholder "em produção" DENTRO da pele certa (o formato vem do JSON ingerido).
- **Modelo de estágio:** `CURRICULO[10-12]` ganha `estagios: [{ id, nome, trilhas }]`; rota nova `/estagio/:id` → `HubDoEstagio` (não forçar em SemestrePage). O Hub lê os blocos por prefixo de estágio + `formato_internato`.
- **Fonte de dados dos casos:** unificar via `blocos` + manifesto (o pipeline que já usamos), NÃO um segundo pipeline via seed. As vinhetas do internato são blocos como os demais.

## 2. HUB DO ESTÁGIO (nova rota /estagio/:id)
- Cabeçalho com **fala da ANIMA em 1ª pessoa** (FalaAnima) + objetivos da rotação.
- "Como você será avaliado" = card **colapsável** (aberto na 1ª visita, recolhido depois) — não painel fixo (reduz sobrecarga).
- **6 trilhas agrupadas em 2 faixas** (hierarquia, não 6 cards iguais):
  - **PRATICAR:** Casos · Casos Integradores · Procedimentos
  - **REFLETIR & AVALIAR:** Competências (EPAs) · Reflexão · Análise de Erro
- Cada card de trilha espelha um recorte do Passaporte (ex: "7/15 casos", "10/10 punções", "EPA-10: auto 3 / observado 2").

## 3. PELES POR FORMATO (com correções do painel)
- **caso / integrador → Player de Vinheta (EVOLUÇÃO real do VinhetaClinicaPlayer, não mero reuso):** barra de progresso dinâmica (`vinheta.nos.length`, não 3 fixo); campo opcional de **urgência/relógio**; abre pela decisão; destaca `decisao_sob_incerteza`; linka N pré-requisitos S1-9 e **abre o grafo** daquele conceito (preserva a espiral, Cap. 13). O **integrador** tem HUD lado-a-lado de ≥2 problemas concorrentes com trade-off de priorização explícito (distinção real, não etiqueta).
- **epa → Escada de Confiabilidade (níveis canônicos ten Cate/AAMC):** (1) presente, não autorizado a agir · (2) supervisão DIRETA (supervisor na sala) · (3) supervisão INDIRETA (disponível/on-call) · (4) prática não supervisionada · (5) supervisiona juniores. **Alvo do internato = 2→3 na maioria das EPAs (nunca 4 por padrão).** O auto-posicionamento é SEMPRE confrontado com o instrumento observado (mini-CEX/DOPS/MSF) e sinaliza discrepância ("você se marcou 4; os DOPS registrados estão em 2") — reusa a calibração confiança-vs-desempenho (Cap. 20.5, anti-Dunning-Kruger). FalaANIMA: "onde você se sente hoje? sem julgamento — e vamos ver o que os registros mostram".
- **procedimento → Guia passo-a-passo + Logbook estruturado (anti-XP):** cada passo com o PORQUÊ. O contador NUNCA aparece sozinho: cada registro exige micro-reflexão obrigatória (o que correu bem / faria diferente / nível de supervisão), no espírito de Gibbs. Quick-add de 1 toque (do Hub e do guia), auto-declarado com honestidade epistêmica (Cap. 16). Entrada estruturada: data, supervisor, nível, complicação/nota → vira evidência de portfólio/DOPS, não tally.
- **reflexao → Diário Guiado de Gibbs (pele = visual do Diário; DADOS novos):** shape `EntradaReflexao` estruturado (incidente→emoção→análise→aprendizado→plano), **ancorado num evento concreto** (disparado de um registro de logbook ou caso vivido, pré-preenchendo "incidente"). Reusa só o textarea/autosave do DiarioPage.
- **analise_erro → Sala de M&M (sem culpa):** near-miss/evento adverso, foco no sistema (queijo suíço), disclosure, "o que mudar". Alimentada por near-miss reais capturados. FalaANIMA: "erro sem culpa — vamos olhar o sistema, não a pessoa".
- **EPAs de plantão que faltavam (adicionadas):** handoff/passagem de plantão (SBAR — EPA-8), prescrição/ordens + documentação/evolução (EPA-4/5), apresentação oral de caso (EPA-6). São blocos `epa` com pele especializada (checklist SBAR, simulador de prescrição com armadilhas, roteiro de apresentação).

## 4. PASSAPORTE DO INTERNATO = CONTINUAÇÃO DO CORPO (não métrica concorrente)
- Uma só métrica-mãe por contexto. O Passaporte é lido como a **continuação do "Corpo que se Ilumina"** na fase clínica: as zonas já acesas (domínio S1-9) NÃO apagam; a confiabilidade EPA + logbook + casos + reflexões **acendem por cima**. Preserva o organismo único (Cap. 0).
- Dentro de S10-12, o Passaporte é a métrica-mãe; a aba global Corpo/Progresso mostra o Passaporte consolidado quando o semestre ativo é 10-12. `maestria.ts`/`CorpoIluminado` (que assumem SRS) NÃO quebram: blocos de internato sem SRS clássico são tratados pela métrica de confiabilidade/logbook, não pela de leitura+repetição.
- Agrega **evidência observada** (WBA de 1ª classe), não só auto-relato — é o que a banca avaliaria.

## 5. VOZ, DNA TRANSVERSAL E HONESTIDADE DE ESFORÇO
- **Voz (FalaAnima) especificada:** abertura do Hub; Escada ("sem julgamento… e o que os registros mostram"); ao registrar near-miss; ao aproximar-se do mínimo de um procedimento; ao subir um degrau de EPA observado.
- **DNA transversal (fase de conteúdo):** glossário_trilingue (pt/es/gn — UCP), relevancia_regional/contexto_ucp (Cap. 2.5), e estado_ciclo_vida='em_uso_clinico' + horizonte_validade='volatil' com badge de revisão a cada 12 meses (Cap. 7.5).
- **Honestidade de esforço:** REUSO real = primitivos, textarea/autosave do Diário, guard de esqueleto, pipeline de blocos. NOVO substantivo = extensão de schema, Dexie v5 (4 tabelas), HubDoEstagio, EscadaConfiabilidade (com confronto WBA), LogbookProcedimento (com reflexão), SalaMM, PassaporteInternato, evolução do Player de Vinheta (relógio + barra dinâmica + integrador HUD), EntradaReflexao estruturada.

## 6. PLANO DE EXECUÇÃO (piloto antes de generalizar)
1. Contrato de dados (schema + Dexie v5 + roteamento por formato) — fundação.
2. **PILOTO em UM estágio: Emergência/UTI (int3-emerg)** — as 6 peles + Passaporte, reusando ao máximo. Prova que o fluxo reduz fricção.
3. Só então generalizar Hub/Passaporte aos 7 estágios.
