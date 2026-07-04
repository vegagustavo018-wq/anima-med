# SEMESTRE 4 — PLANO DE EXECUÇÃO
**Data:** 2026-07-04  
**Status:** EM ANDAMENTO  
**Produtor:** Claude Code com Pipeline ANIMA (Workflow)

---

## 📊 DESCOBERTA (Idempotente)

### Estado Atual
- **Total de blocos esperados:** 745
- **Blocos com esqueleto:** 745/745 (100%)
- **Blocos com conteúdo real:** 0/745 (0%)

### Disciplinas (745 blocos totais)

| Disciplina | ID | Blocos | Status |
|---|---|---|---|
| Farmacologia I — Princípios Gerais | `farma1` | 78 | 🔴 Faltando |
| Fisiopatologia I | `fpat1` | 131 | 🔴 Faltando |
| Medicina Baseada em Evidências | `mbe` | 100 | 🔴 Faltando |
| Medicina da Família e Comunidade | `mfc` | 65 | 🔴 Faltando |
| Anatomia Patológica I — Patologia Geral | `patol1` | 223 | 🔴 Faltando |
| Semiologia I | `semi1` | 148 | 🔴 Faltando |

---

## 🚀 PIPELINE DE PRODUÇÃO

### Estratégia

```
Lote-piloto (6 blocos)  →  [Validar pipeline]
       ↓
Lotes 1-8 (Farmacologia I: 78)  →  [Produzir + testar]
Lotes 1-11 (Fisiopatologia I: 131)  →  [Produzir em paralelo]
Lotes 1-9 (MBE: 100)  →  [Produzir em paralelo]
Lotes 1-6 (MFC: 65)  →  [Produzir em paralelo]
Lotes 1-19 (Patologia Geral: 223)  →  [Produzir em paralelo]
Lotes 1-13 (Semiologia I: 148)  →  [Produzir em paralelo]
       ↓
Consolidação + Manifesto + Relatório Final
```

### Pipeline de Qualidade (cada bloco)

```
Produtor (esquema v3.0)
  ↓
Juízes paralelos (3):
  ├─ Pedagogia (8 etapas, narrativa espiral, analogias, flashcards)
  ├─ Precisão (fatos, nomenclatura BR, proteínas, conexões REAIS, [⚠️])
  └─ Estética (clareza, parágrafos, hierarquia, imagens)
  ↓
Adversarial (cético, procura refutar)
  ↓
Integrador (decisão: APROVAR se ≥7 em 3 dims + adv não crítico)
  ↓
Gravação em public/blocos/{disciplina}/{id}.json
```

### Tamanho de Lotes

- **Lotes de 12-16 blocos** (para paralelização ótima de agentes)
- **Máximo 16 agentes simultâneos por workflow**
- **Blocos pai antes dos filhos** (cascata respeitada)

### Guardrails de Segurança

✅ **Respeitados:**
- Não editar `src/core/db|srs|store`
- Não sobrescrever progresso do usuário
- Só blocos APROVADOS são gravados
- `npm run manifesto` ao final de cada disciplina

---

## 📈 PROGRESSO

### Fase 0: Lote-Piloto (Farmacologia I — top 6 blocos)
- **Blocos:** `s4-farma1-00-000` a `s4-farma1-01-000`
- **Status:** 🔄 EM PRODUÇÃO
- **Esperado:** ✅ Piloto validar pipeline

### Fases 1-6: Produção Completa
Aguardando resultado do lote-piloto para escalar.

---

## 🎯 Lentes Pedagógicas por Disciplina

### Farmacologia I (`farma1`)
- **Lentes primárias:** `molecular`, `mecanismo`, `farmacocinetica`
- **Contexto:** Ponte teórica → clínica (PK/PD antes de drogas específicas)
- **Lotes:** 7 (cada ~12 blocos)

### Fisiopatologia I (`fpat1`)
- **Lentes primárias:** `cascata_causal`, `reconhecimento_clinico`
- **Contexto:** Quando anatomia+fisiologia falham, o que acontece?
- **Lotes:** 11 (prioridade em casos clínicos 5-etapas)

### Medicina Baseada em Evidências (`mbe`)
- **Lentes primárias:** `metodologia`, `epistemia`
- **Contexto:** Como saber se algo é verdade na medicina
- **Lotes:** 9

### Medicina da Família e Comunidade (`mfc`)
- **Lentes primárias:** `contexto_regional`, `comunicacao_clinica`
- **Contexto:** Paraguai/Brasil, UBS rural, guarani, trilíngue
- **Lotes:** 6

### Anatomia Patológica I — Patologia Geral (`patol1`)
- **Lentes primárias:** `adaptacao`, `dano`, `reparacao`
- **Contexto:** O que a célula sofre; tipos de morte; inflamação
- **Lotes:** 19 (maior disciplina, mais complexa)

### Semiologia I (`semi1`)
- **Lentes primárias:** `semiologia`, `cascata_causal`, `reconhecimento_clinico`
- **Contexto:** Como o corpo **avisa** que algo está errado
- **Lotes:** 13 (muitos flashcards clínicos de reconhecimento)

---

## ✅ Critério de Conclusão

O Semestre 4 estará **PRONTO** quando:

- [ ] 745 blocos produzidos
- [ ] ≥85% taxa de aprovação na primeira passagem
- [ ] Manifesto regenerado (`npm run manifesto`)
- [ ] Relatório final por disciplina

---

## 📋 Próximos Passos

1. **Aguardar resultado do lote-piloto** (6 blocos)
2. **Se ✅:** Escalar para todas as disciplinas em paralelo
3. **Se 🔴:** Ajustar pipeline e rerun lote-piloto
4. **Gravação:** Cada bloco aprovado → `public/blocos/{disciplina}/{id}.json`
5. **Consolidação:** Ao final, regenerar manifesto e gerar relatório executivo

---

## 📚 Referências Canônicas

- Filosofia ANIMA: `ANIMA_FILOSOFIA.md`
- Agente Produtor: `AGENTES/01-agente-produtor-bloco.md`
- Agentes Revisores: `AGENTES/02-agentes-revisores.md`
- Workflow: `AGENTES/03-workflow-producao.md`
- Especificação S4: `AGENTES/SEMESTRES/s4.md`

---

*Gerado automaticamente pelo pipeline ANIMA em 2026-07-04.*
