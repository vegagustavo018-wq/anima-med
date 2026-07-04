# CHECKLIST EXECUÇÃO — Lote Piloto GO1

## PRÉ-EXECUÇÃO

- [ ] Ler `LOTE_GO1_PLANO_EXECUCAO.md` completamente
- [ ] Ler `INSTRUÇÕES_LOTE_GO1.md` completamente  
- [ ] Entender as 8 Etapas ANIMA (está em ambos os docs)
- [ ] Ter 5 abas do Claude abertas (Juiz1, Juiz2, Juiz3, Adversarial, Integrador)
- [ ] Copiar os 4 PROMPTS de INSTRUÇÕES_LOTE_GO1.md para as abas

---

## LOTE 1 — Blocos 1-3 (s7-go1-00-000, 00-001, 00-002)

### Preparação
- [ ] Confirmar que os 3 blocos têm conteúdo (narrativa, flashcards, casos) preenchido
- [ ] Se vazios, disparar PRODUTOR LOTE 1 primeiro
- [ ] Aguardar Produtor retornar com JSONs (~1-2 horas)

### Bloco 1: s7-go1-00-000 (Ginecologia Visão Geral)

**Juízes (T+0 a T+30min)**
- [ ] Tab 1: Cole PROMPT Juiz Pedagogia + JSON do bloco → Enviar
- [ ] Tab 2: Cole PROMPT Juiz Precisão + JSON do bloco → Enviar
- [ ] Tab 3: Cole PROMPT Juiz Estética + JSON do bloco → Enviar

**Coletar Feedback**
- [ ] Recebe: nota Pedagogia __/10
- [ ] Recebe: nota Precisão __/10
- [ ] Recebe: nota Estética __/10

**Adversarial (T+35min)**
- [ ] Tab 4: Cole PROMPT Adversarial + JSONs dos 3 Juízes acima + bloco JSON → Enviar

**Coletar Feedback**
- [ ] Recebe: Risco Geral: _____ (CRÍTICO / ALTO / MÉDIO / BAIXO)
- [ ] Recebe: pode_aprovar: _____ (true / false)

**Integrador (T+45min)**
- [ ] Tab 5: Cole PROMPT Integrador + todos os 4 feedbacks acima → Enviar

**Coletar Decisão**
- [ ] Recebe: decisao: _____ (APROVAR / REVISAR)
- [ ] Recebe: nota_final: __/10
- [ ] Se APROVAR: ir para Gravação
- [ ] Se REVISAR: enviar feedback para Produtor, re-fazer

### Bloco 1 — Gravação (se APROVADO)

```powershell
# 1. Copiar JSON aprovado do Integrador

# 2. No PowerShell, gravar:
$bloco = [COLAR JSON AQUI] | ConvertFrom-Json
$bloco.metadata.status = "produção"
$bloco.metadata.nivel_confianca = "validado"
$bloco.metadata.versao = "1.0"

$path = "C:\Users\vegag\.claude\anima\med\dist\blocos\go1\s7-go1-00-000.json"
$bloco | ConvertTo-Json -Depth 20 | Out-File -Encoding UTF8 -Path $path -Force

# 3. Validar
Test-Json -Path $path
```

- [ ] JSON gravado em `dist/blocos/go1/s7-go1-00-000.json`
- [ ] JSON validado com Test-Json
- [ ] Status em metadata = "produção"
- [ ] Nota no relatório: ___/10

---

### Bloco 2: s7-go1-00-001 (O Que a Ginecologia Cuida)

**Juízes (T+0 a T+30min)**
- [ ] Tab 1: Juiz Pedagogia
- [ ] Tab 2: Juiz Precisão
- [ ] Tab 3: Juiz Estética

**Adversarial (T+35min)**
- [ ] Tab 4: Adversarial

**Integrador (T+45min)**
- [ ] Tab 5: Integrador → decisão: _____ (APROVAR / REVISAR)

**Gravação (se APROVADO)**
- [ ] JSON gravado em `dist/blocos/go1/s7-go1-00-001.json`
- [ ] Nota: ___/10

---

### Bloco 3: s7-go1-00-002 (Anatomia Genital Aplicada)

**Juízes**
- [ ] Pedagogia → Nota: __/10
- [ ] Precisão → Nota: __/10
- [ ] Estética → Nota: __/10

**Adversarial**
- [ ] Feedback coletado

**Integrador**
- [ ] Decisão: _____ (APROVAR / REVISAR)

**Gravação (se APROVADO)**
- [ ] JSON gravado em `dist/blocos/go1/s7-go1-00-002.json`
- [ ] Nota: ___/10

---

### Pós-Lote 1

- [ ] Todos os 3 blocos aprovados? (SIM / NÃO)
- [ ] Todos em `dist/blocos/go1/`? (SIM / NÃO)

**Rodar Manifesto**
```powershell
cd "C:\Users\vegag\.claude\anima\med"
npm run manifesto
```
- [ ] Manifesto executado com sucesso
- [ ] Blocos registrados no índice

---

## LOTE 2 — Blocos 4-6 (s7-go1-00-003, 01-000, 01-001)

**Timeline:** T+2h30min a T+3h30min

### Bloco 4: s7-go1-00-003 (Embriologia Mülleriana)

- [ ] Pedagogia: __/10 → Precisão: __/10 → Estética: __/10
- [ ] Adversarial: Risco: _____ → pode_aprovar: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Bloco 5: s7-go1-01-000 (Módulo 1 — Ciclo HHO)

- [ ] Pedagogia: __/10 → Precisão: __/10 → Estética: __/10
- [ ] Adversarial: Risco: _____ → pode_aprovar: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Bloco 6: s7-go1-01-001 (Por Que Existe um Ciclo)

- [ ] Pedagogia: __/10 → Precisão: __/10 → Estética: __/10
- [ ] Adversarial: Risco: _____ → pode_aprovar: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Pós-Lote 2

- [ ] Todos 3 blocos aprovados e gravados?
- [ ] `npm run manifesto` rodado

---

## LOTE 3 — Blocos 7-10 (s7-go1-01-002, 01-003, 01-004, 01-005)

**Timeline:** T+3h30min a T+4h45min

### Bloco 7: s7-go1-01-002 (Eixo HHO)

- [ ] Juízes: Ped __/10, Prec __/10, Est __/10
- [ ] Adversarial: Risco: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Bloco 8: s7-go1-01-003 (Retroalimentação Hormonal)

- [ ] Juízes: Ped __/10, Prec __/10, Est __/10
- [ ] Adversarial: Risco: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Bloco 9: s7-go1-01-004 (Fase Folicular)

- [ ] Juízes: Ped __/10, Prec __/10, Est __/10
- [ ] Adversarial: Risco: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Bloco 10: s7-go1-01-005 (Ovulação)

- [ ] Juízes: Ped __/10, Prec __/10, Est __/10
- [ ] Adversarial: Risco: _____
- [ ] Integrador: decisão: _____ → nota: __/10
- [ ] Gravado: SIM / NÃO

### Pós-Lote 3

- [ ] Todos 4 blocos aprovados e gravados?
- [ ] `npm run manifesto` rodado

---

## RELATÓRIO FINAL

**Data de Início:** ___________  
**Data de Término:** ___________  
**Tempo Total:** __________ horas

| Métrica | Meta | Realizado |
|---------|------|-----------|
| Blocos processados | 10 | ___ |
| Blocos aprovados | 9-10 | ___ |
| Taxa aprovação | >85% | ___% |
| Blocos gravados | 10 | ___ |
| `npm run manifesto` executado | 3x | ___ |

### Resumo por Bloco

| # | ID | Nota Ped | Nota Prec | Nota Est | Nota Final | Decisão | Gravado |
|---|-------|----------|-----------|----------|-----------|---------|---------|
| 1 | s7-go1-00-000 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 2 | s7-go1-00-001 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 3 | s7-go1-00-002 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 4 | s7-go1-00-003 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 5 | s7-go1-01-000 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 6 | s7-go1-01-001 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 7 | s7-go1-01-002 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 8 | s7-go1-01-003 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 9 | s7-go1-01-004 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |
| 10 | s7-go1-01-005 | __/10 | __/10 | __/10 | __/10 | A/R | ✅/❌ |

**Nota Final Média:** ____/10

---

## OBSERVAÇÕES & PRÓXIMAS AÇÕES

```
Blocos para revisar (se houver rejeições):
[LISTAR IDs]

Tendências observadas:
[LISTAR PADRÕES DE FEEDBACK]

Recomendações para próximos lotes:
[LISTAR APRENDIZADOS]
```

---

## ASSINATURA

**Responsável:** _______________  
**Data:** _______________  
**Status:** ☐ COMPLETO ☐ EM ANDAMENTO ☐ BLOQUEADO

