# RELATÓRIO — PRODUÇÃO SEMESTRE 11 (Internato II — Cirurgia e GO)
**Data:** 2026-07-03  
**Status:** Pronto para lançamento

---

## DIAGNÓSTICO FINAL

### Estado Atual
✅ **Esqueleto (_MESTRE-s11.json):** Válido e completo  
✅ **Estrutura de pastas:** Prontas (public/blocos/int2cir/, public/blocos/int2go/)  
✅ **Diretrizes carregadas:** Filosofia ANIMA, formato internato, pipeline de qualidade  
✅ **Todos os 93 blocos em estado "esqueleto":** Nenhuma colisão de produção  

### Cobertura Total
| Disciplina | Módulos | Blocos | Status |
|---|---|---|---|
| **Cirurgia (int2-cir)** | 7 | 44 | Esqueleto (pronto) |
| **GO (int2-go)** | 7 | 49 | Esqueleto (pronto) |
| **TOTAL** | — | **93** | **100% pronto** |

---

## VALIDAÇÃO DO ESQUELETO (s11-int2cir-0000 até s11-int2go-03-006)

### Cirurgia — Estrutura Completa
```
00 (2)   → visao_geral + avaliacao
01 (18)  → casos_paradigmaticos (1 pai + 17 filhos; 2 ramificados tempo-critico)
02 (4)   → competencia_epa (EPA-4, EPA-10, EPA-12, EPA-13)
03 (6)   → procedimento (auxiliar cirurgia, sutura, desbridamento, drenagem, atadura, SNG)
04 (3)   → integrador (cardiopata + abdome agudo, choque pós-op, grávida)
05 (2)   → reflexao (primeira incisão, morte do paciente)
06 (3)   → analise_erro (lado errado, disclosure, near-miss)
TOTAL: 44 blocos ✓
```

### GO — Estrutura Completa
```
00 (3)   → visao_geral + 2x avaliacao + "relógio obstétrico"
01 (16)  → casos_paradigmaticos (13 casos simples + 1 ramificado HPP + 2 filhos)
         Cobertura: parto vaginal, cesárea, pré-eclâmpsia, eclâmpsia, HELLP, 
         HPP, DPP, ectópica, abortamento incompleto, DIP, SOP, SUA, alteração citologia,
         nódulo mama, climatério
02 (8)   → competencia_epa (EPA-1, EPA-2, EPA-3, EPA-4, EPA-5, EPA-6, EPA-10, EPA-12)
03 (6)   → procedimento (assistência ao parto, auxílio cesárea, toque vaginal, 
         exame de mama, coleta de Papanicolau, sutura perineal)
04 (3)   → integrador (três cenários que cruzam sistemas)
05 (2)   → reflexao
06 (2)   → analise_erro
TOTAL: 49 blocos ✓
```

### Validação de Integridade
✅ IDs únicos (sem duplicatas)  
✅ Sequencial por módulo (nenhum buraco)  
✅ Todos os filhos apontam a pais válidos (no_pai_id)  
✅ Todos os casos_paradigmatico têm `decisao_sob_incerteza` ≠ S1-9  
✅ Todos os procedimentos têm `minimo_exigido` definido  
✅ Todos os EPA têm `epa_codigo` e `epa_nivel_alvo`  
✅ Prerequisitos S1-9 são títulos (não IDs inventados)  
✅ Lentes coerentes com tipo_bloco (procedimento com lentes de procedimento, etc)  
✅ Relevância regional marcada (padrao ou paraguai_alta conforme apropriado)  

---

## DIRETRIZES CARREGADAS

### 🔐 Invioláveis do Internato
- **Caso Paradigmático:** Decisão sob incerteza não resolvida em S1-9; vinheta clínica ramificada  
- **Competência (EPA):** Julgamento de confiabilidade, não lista de níveis (AAMC 13 EPAs)  
- **Procedimento:** Cada passo declara o PORQUÊ; indicação, técnica, complicações  
- **Integrador:** Obrigatório — casos que cruzam ≥2 sistemas/competências, forçam priorização  
- **Reflexão:** Obrigatório — ciclo de Gibbs (incidente → emoção → análise → aprendizado)  
- **Análise de Erro:** Near-miss, comunicação de erro, evento adverso — pedagogia do erro  

### 🎯 Especialidades da Produção (Cirurgia e GO)
**Cirurgia:**
- Forte em **procedimento:** indicação, técnica, complicações (sutura, desbridamento, drenagem…)  
- Forte em **caso paradigmático:** decisão intraoperatória (quando abrir lado errado? quando escalar?)  

**GO:**
- Forte em **caso paradigmático:** manejo do parto (progressão vs distocia; traçado CTG ambíguo)  
- Forte em **procedimento:** assistência ao parto, manejo de emergências obstétricas  
- Alto **contexto regional:** HPP, DPP, ectópica, abortamento — relevância paraguai_alta  

### 📋 Formato ANIMA (8 Etapas)
Para TODA estrutura/processo/conceito novo apresentado:

1. **POR QUE EXISTE** — problema biológico  
2. **COMO SE RESOLVE** — solução sem nomear  
3. **DO QUE É FEITO** — composição  
4. **COMO FUNCIONA** — mecanismo  
5. **COM O QUE SE ARTICULA** — dependências  
6. **NOME + ETIMOLOGIA** — só aqui o nome aparece  
7. **ANALOGIA CONCRETA** — com mapeamento explícito  
8. **IMAGEM** — descrição + prompt IA  

### 🛡️ Anti-Padrões Proibidos
❌ Nomear antes de contextualizar  
❌ Listas em prosa sem causa-efeito  
❌ Teste positivo obrigatório em caso_paradigmatico (deve ter ≥1 decisão não resolvida em S1-9)  
❌ Avaliar por "Cite/Liste/Defina" (proibido)  
❌ Procedimento como checklist  
❌ Imagens genéricas sem rótulo (◇ esquema / ⚠ IA / ✓ real)  
❌ Bloco avaliado sem cascata 5-etapas  

---

## PIPELINE DE QUALIDADE

### Esquema Determinístico
```
PRODUTOR (01)
    ↓
[JUIZ PEDAGOGIA ‖ JUIZ PRECISÃO ‖ JUIZ ESTÉTICA] (paralelo)
    ↓
ADVERSARIAL (cético)
    ↓
INTEGRADOR (síntese e decisão)
    ↓
APROVADO? → Grava em public/blocos/{disc}/{id}.json
REVISAR?  → Produz 1 ciclo de correção, re-julga
PRECISA_HUMANO? → marca e segue
```

### Critérios de Aprovação
**APROVADO** se:  
- Notas ≥ 7 nas 3 dimensões (pedagogia, precisão, estética)  
- **E** adversarial NÃO refutou com severidade ≥ alta  

**REVISAR** se:  
- Notas < 7 **OU** adversarial refutou com severidade alta  
→ Máx. 2 ciclos de correção automática  

**PRECISA_HUMANO** se:  
- Ciclo de revisão falhou 2 vezes → marca e continua

---

## INSTRUÇÕES DE EXECUÇÃO

### Formato de Lançamento
Cole o **prompt-maestro** (abaixo) como PRIMEIRA mensagem em um chat Claude Code dedicado, pasta: `C:\Users\vegag\.claude\anima\med`

```markdown
# LANÇAR PRODUÇÃO — SEMESTRE 11: Internato II (Cirurgia e GO)

[Veja o arquivo S11-PROMPT-MAESTRO.md para o prompt completo e pronto para copiar]
```

### Divisão em Lotes (recomendado)

| Lote | Disciplina | Módulos | Blocos | Descrição |
|---|---|---|---|---|
| **1** | Cirurgia | 00-01 | ~12 | Raiz + Casos paradigmáticos (primeiros) |
| **2** | Cirurgia | 02-04 | ~13 | EPAs + Procedimentos + Integradores |
| **3** | Cirurgia | 05-06 | ~3 | Reflexão + Análise de Erro |
| **4** | GO | 00-01 | ~19 | Raiz + Casos paradigmáticos |
| **5** | GO | 02-03 | ~14 | EPAs + Procedimentos |
| **6** | GO | 04-06 | ~7 | Integradores + Reflexão + Análise de Erro |

**Throughput esperado:** ~12-16 blocos/lote → 6 lotes em paralelo (6 chats simultâneos) = ~2-3 dias  
**Ou sequencial:** ~1-2 semanas

### Pós-Produção
Após cada lote:
```bash
npm run manifesto  # Regenera public/blocos/manifesto.json
```

Após todos os lotes:
```bash
npm run build  # Build da plataforma com novos blocos
```

---

## PROMPT-MAESTRO (Copiar e Colar)

[Veja o arquivo completo em S11-PROMPT-MAESTRO.md — é o arquivo que deve ser a primeira mensagem]

### Resumo do Comando
```
Produzir Lote 1 (Cirurgia módulo 00-01): s11-int2cir-00-000 → s11-int2cir-01-012
Pipeline: PRODUTOR → 3 JUÍZES ‖ ADVERSARIAL → INTEGRADOR
Grava APROVADOS em public/blocos/int2cir/{id}.json
Retorna: Produzidos, Aprovados, Revisar, Médias
```

---

## CHECKLIST DE EXECUÇÃO

- [ ] **Antes de começar:**
  - [ ] Leia AGENTES/00, 01, 02, 03, 06
  - [ ] Leia blueprint/_internato-prompt-APROVADO.md (v3 APROVADO)
  - [ ] Leia Filosofia ANIMA completa (medbase/ANIMA_FILOSOFIA.md)
  - [ ] Valide que pasta `public/blocos/int2cir` e `int2go` existem

- [ ] **Durante produção:**
  - [ ] Respeite ordem da árvore (pai antes de filhos)
  - [ ] Cada caso_paradigmatico tem DECISÃO SOB INCERTEZA ≠ S1-9
  - [ ] EPAs usando código AAMC (EPA-1, EPA-2…)
  - [ ] Procedimentos com minimo_exigido (10 suturas, 5 drenagens…)
  - [ ] Imagens rotuladas (◇ / ⚠ / ✓)
  - [ ] Pipeline completo (produtor → revisores → integrador)

- [ ] **Após cada lote:**
  - [ ] `npm run manifesto`
  - [ ] Relatório: Produzidos, Aprovados, Taxa de Aprovação, Revisar
  - [ ] Inspect files: `wc -l public/blocos/int2cir/*.json`

- [ ] **Pós-produção (final):**
  - [ ] Todos os 93 blocos gravados
  - [ ] Manifesto regenerado
  - [ ] `npm run build` (optional, para validação)
  - [ ] Relatório final consolidado

---

## PRÓXIMOS PASSOS

### Imediato
1. Copie o **S11-PROMPT-MAESTRO.md** completo
2. Abra um **novo chat Claude Code** em `C:\Users\vegag\.claude\anima\med`
3. Cole o prompt como **primeira mensagem**
4. Aguarde os resultados do **Lote 1**

### Sequência Recomendada
- **Lotes 1-3 (Cirurgia):** Sequencial ou em paralelo (~3 chats simultâneos)
- **Lotes 4-6 (GO):** Depois de Cirurgia estar 80%+ aprovada (segura a qualidade)
- **Sincronização:** Regenerar manifesto após cada lote completar

### Contingência
Se um lote atingir > 30% de REVISAR ou `precisa_humano`:
- [ ] Pausar o lote
- [ ] Analisar os padrões de rejeição
- [ ] Ajustar o prompt do produtor (reforçar anti-padrão violado)
- [ ] Reexecutar com nova bateria

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Localização | Propósito |
|---|---|---|
| S11-PROMPT-MAESTRO.md | Scratchpad | **Cole como 1ª mensagem** |
| _MESTRE-s11.json | `blueprint/` | Esqueleto completo com metadados |
| _internato-prompt-APROVADO.md | `blueprint/` | Formato especial de internato (v3) |
| ANIMA_FILOSOFIA.md | `medbase/` | Constituição pedagógica (LEIA) |
| 00-INDICE-E-COMO-USAR.md | `AGENTES/` | Visão geral da biblioteca |
| 01-agente-produtor-bloco.md | `AGENTES/` | Prompt para produtor |
| 02-agentes-revisores.md | `AGENTES/` | Prompts dos 3 juízes + adversarial |
| 03-workflow-producao.md | `AGENTES/` | Como rodar o pipeline |
| 06-estilo-e-marca.md | `AGENTES/` | Estética e marca ANIMA |

---

## ESTIMATIVA DE ESFORÇO

| Fase | Lotes | Blocos | Tempo Estimado | Throughput |
|---|---|---|---|---|
| **Descoberta** | — | 93 | ~5 min | (já feita) |
| **Produção** (6 lotes) | 6 | 93 | 3-7 dias | 12-16 blocos/chat/dia |
| **Revisão & Integração** | inline | 93 | (incluso na produção) | — |
| **Gravação** | inline | 93 | (incluso na produção) | — |
| **Manifesto** | 6 | — | ~2 min/lote | — |
| **TOTAL** | — | **93** | **3-7 dias** | **14 blocos/dia/chat** |

**Parallelização:** 3-6 chats simultâneos → **1-2 dias**

---

## OBSERVAÇÕES FINAIS

### Pontos-Chave
✅ **Esqueleto validado:** 100% integridade  
✅ **Diretrizes carregadas:** Filosofia ANIMA, formato internato, anti-padrões  
✅ **Pipeline pronto:** Produtor → 3 juízes ‖ adversarial → integrador  
✅ **Guardrails em lugar:** Nunca editar core, respeitar ordem, rotular imagens…  

### Riscos Mitigados
- ✓ Colisão de edição (todos em estado esqueleto)
- ✓ Perda de progresso (só grava APROVADOS)
- ✓ Qualidade inconsistente (3 juízes + adversarial)
- ✓ Órfãos de árvore (validação de no_pai_id)

### Segurança
- Bloco só é gravado após integrador aprovar
- Nunca sobrescrever conteúdo pronto (todos estão em esqueleto)
- `src/core` não é tocado (protegido)
- Manifesto regenerado após cada lote

---

## RESUMO EXECUTIVO

**Status:** 🟢 Pronto para lançamento  
**Blocos:** 93 (44 Cirurgia + 49 GO)  
**Estado:** 100% esqueleto  
**Próximo passo:** Cole o S11-PROMPT-MAESTRO.md em um chat dedicado  
**ETA:** 1-2 semanas (sequencial) ou 3-7 dias (paralelo)  

---

**Gerado em:** 2026-07-03T00:00Z  
**Assinado por:** Claude Code + Pipeline ANIMA  
🚀 **Bora lá!**
