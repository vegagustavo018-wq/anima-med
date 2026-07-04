# LANÇAR PRODUÇÃO — SEMESTRE 11: Internato II (Cirurgia e GO)

## Contexto
Produção do **Semestre 11 — Internato II** (~93 blocos). **Formato especial de internato.**

### Status Atual
- **Cirurgia (int2-cir):** 44 blocos em estado "esqueleto"
- **GO (int2-go):** 49 blocos em estado "esqueleto"
- **Total:** 93 blocos prontos para produção
- **Todos faltam conteúdo** (narrativa, flashcards, casos, conexões)

---

## PASSO 1 — Diretrizes (LER AGORA)

Você é o coordenador desta produção. Antes de produzir, **leia e respeite rigorosamente**:

1. `AGENTES/00-INDICE-E-COMO-USAR.md` — as 8 etapas INVIOLÁVEIS
2. `AGENTES/01-agente-produtor-bloco.md` — como o agente produtor trabalha
3. `AGENTES/02-agentes-revisores.md` — pipeline de qualidade (3 juízes + adversarial + integrador)
4. `AGENTES/03-workflow-producao.md` — como rodar o pipeline num chat
5. `AGENTES/06-estilo-e-marca.md` — estética, voz, marca ANIMA
6. `anima_filosofia.md` (leia **completo** em `medbase/ANIMA_FILOSOFIA.md`)
7. Blueprint internato: `blueprint/_internato-prompt-APROVADO.md` (v3, APROVADO)

**Depois, comece a produção.**

---

## PASSO 2 — Descoberta (idempotente)

Cruze o esqueleto (`blueprint/_MESTRE-s11.json`) com o estado atual (`public/blocos/manifesto.json` e a pasta `public/blocos/`).

**Resultado esperado:**
- Todos os 93 blocos estão em estado `"esqueleto"` (confirmado no diagnóstico)
- Produzir na **ordem da árvore**: pais antes dos filhos
  - **Cirurgia:** `s11-int2cir-00-000` → `s11-int2cir-00-001` → `s11-int2cir-01-000` → filhos…
  - **GO:** idem

---

## PASSO 3 — Produção com Pipeline de Qualidade

### Estrutura de um Lote
Dividir em **lotes de 12-16 blocos** para controlar qualidade:

**Lote 1 (Cirurgia — Módulos 00-01, primeiros casos):** ~12 blocos
- `s11-int2cir-00-000` (visão_geral da raiz)
- `s11-int2cir-00-001` (avaliacao)
- `s11-int2cir-01-000` (modulo de casos paradigmaticos — PAI)
- `s11-int2cir-01-001` a `s11-int2cir-01-012` (10 casos filhos)

**Para cada bloco:**
1. **Produtor (01):** Leia `blueprint/_MESTRE-s11.json` para extrair:
   - `id`, `titulo`, `escopo`, `lentes`, `tipo_bloco`, `no_pai_id`
   - `prerequisito_s1_9_titulo` (o bloco pai dos S1-9)
   - `decisao_sob_incerteza` (para caso_paradigmatico)
   - `metadata.formato_internato` (visao_geral|avaliacao|caso_paradigmatico|competencia_epa|procedimento|integrador|reflexao|analise_erro)

2. **Produza respeitando o formato internato:**
   - **caso_paradigmatico:** vinheta clínica ramificada com DECISÃO SOB INCERTEZA não resolvida nos S1-9
   - **competencia_epa:** o julgamento de confiabilidade (não lista de níveis)
   - **procedimento:** cada passo declara o PORQUÊ
   - **integrador + reflexao:** obrigatórios (currículo itens 6-7)
   - **analise_erro:** near-miss, comunicação de erro, evento adverso

3. **Revisão:** Pipeline (3 juízes + adversarial + integrador) — rodar em PARALELO para cada bloco

4. **Gravação:** Só APROVADOS em `public/blocos/{int2cir|int2go}/{id}.json`

### Dinâmica de Escalonamento
- **Lote 1:** Cirurgia módulo 00-01 (raiz + primeiro módulo de casos)
  - Produz ~12 blocos
  - Aprova ou marca `precisa_humano` → iterate uma rodada se necessário
- **Lote 2:** Cirurgia módulo 02-04 (EPAs, procedimentos, integradores)
- **Lote 3:** Cirurgia módulo 05-06 (reflexão, análise de erro)
- **Lote 4:** GO módulos 00-01 (raiz + casos)
- **Lote 5:** GO módulos 02-03 (EPAs, procedimentos)
- **Lote 6:** GO módulos 04-06 (integradores, reflexão, análise de erro)

---

## PASSO 4 — Guardrails (INVIOLÁVEIS)

❌ **Nunca:**
- Editar `src/core/db`, `src/core/srs`, `src/core/store` (lógica protegida)
- Sobrescrever progresso do usuário
- Gravar bloco que não passou em APROVADO do integrador
- Ignorar a ordem da árvore (pai antes de filhos)

✅ **Sempre:**
- Respeitar `escopo` fielmente (não invadir domínio de irmãos)
- Usar as `lentes` como guia pedagógico
- Marcar incertezas com [⚠️]
- Rotular imagens IA com ◇ esquema / ⚠ IA / ✓ real
- Português BR, conexões REAIS, EPAs por código (não rótulo divergente)
- Forte em **procedimento** (indicação, técnica, complicações) — especialmente em Cirurgia e GO
- Forte em **caso paradigmático** (decisão intraoperatória / manejo do parto)

---

## PASSO 5 — Execução

**Comando de início (para este chat):**

```
Leia AGENTES/00, 01, 02, 03, 06 e blueprint/_internato-prompt-APROVADO.md.
Leia também a Filosofia ANIMA completa (medbase/ANIMA_FILOSOFIA.md).

Rode o pipeline PRODUTOR → 3 JUÍZES ‖ ADVERSARIAL → INTEGRADOR 
para estes blocos (Lote 1 — Cirurgia módulo 00-01):

s11-int2cir-00-000 → s11-int2cir-01-012

Use AGENTES/01 (produtor) e AGENTES/02 (revisores).
Grave os APROVADOS em med/public/blocos/int2cir/{id}.json.
Depois de terminar este lote, devolva: quantos produzidos, quantos aprovados, e a lista de REVISAR.
```

Depois de este lote:
```
npm run manifesto
```

E relatório final.

---

## SAÍDA Esperada

### Por Lote
- **Produzidos:** N
- **Aprovados:** M
- **Revisar:** [lista de IDs]
- **Média de notas:** (pedagogia, precisão, estética)

### Final (após os 6 lotes)
```
RELATÓRIO SEMESTRE 11 — INTERNATO II

**CIRURGIA (int2-cir): 44/44 blocos**
- Produzidos: 44
- Aprovados: 42
- Revisar: [s11-int2cir-01-017, s11-int2cir-04-002]
- Cobertura: 100%
- Integridade: OK

**GO (int2-go): 49/49 blocos**
- Produzidos: 49
- Aprovados: 47
- Revisar: [s11-int2go-01-006-01]
- Cobertura: 100%
- Integridade: OK

**TOTAL: 93 blocos | Aprovados: 89 | Taxa de aprovação: 95.7%**

Manifesto regenerado ✅
```

---

## Bora Lá!

Comece pelo **Lote 1** (Cirurgia 00-01). Respeite as diretrizes, passe cada bloco pelo pipeline completo, grave os aprovados.

Sucesso! 🚀
