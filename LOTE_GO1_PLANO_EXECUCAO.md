# LOTE PILOTO GO1 — Plano de Execução (s7-go1)

**Data:** 3 de julho de 2026  
**Disciplina:** Ginecologia-Obstetrícia I (GO1)  
**Total de blocos:** 10  
**Estratégia:** Processamento em lotes de 3 em paralelo  

---

## Blocos a Processar

| # | ID | Título | Pai | Nível | Profundidade |
|----|------|--------|-----|-------|--------------|
| 1 | `s7-go1-00-000` | Ginecologia — Visão Geral | — | disciplina | 1 |
| 2 | `s7-go1-00-001` | O Que a Ginecologia Cuida | s7-go1-00-000 | visao_geral | 2 |
| 3 | `s7-go1-00-002` | Anatomia do Aparelho Genital Aplicada | s7-go1-00-001 | folha | 3 |
| 4 | `s7-go1-00-003` | Embriologia dos Ductos de Müller | s7-go1-00-001 | folha | 3 |
| 5 | `s7-go1-01-000` | Módulo 1 — Ciclo Menstrual e Eixo HHO | s7-go1-00-000 | modulo | 2 |
| 6 | `s7-go1-01-001` | Por Que Existe um Ciclo | s7-go1-01-000 | visao_geral | 3 |
| 7 | `s7-go1-01-002` | O Eixo Hipotálamo-Hipófise-Ovário | s7-go1-01-000 | folha | 3 |
| 8 | `s7-go1-01-003` | Retroalimentação Hormonal | s7-go1-01-000 | folha | 3 |
| 9 | `s7-go1-01-004` | Fase Folicular e Folículo Dominante | s7-go1-01-000 | folha | 3 |
| 10 | `s7-go1-01-005` | Ovulação — Pico de LH | s7-go1-01-000 | folha | 3 |

---

## Fluxo de Aprovação por Bloco

```
JSON com conteúdo (narrativa, flashcards, casos, conexões)
    ↓
┌─────────────────────────────────────┐
│  3 JUÍZES EM PARALELO (effort: M)   │
├─────────────────────────────────────┤
│ • Juiz Pedagogia                    │
│ • Juiz Precisão Científica          │
│ • Juiz Estética & Didática          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  ADVERSARIAL (effort: M)            │
│  Crítica técnica independente       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  INTEGRADOR (effort: H)             │
│  Sintetiza feedback dos 4 agentes   │
│  Decide: APROVAR ou REVISAR         │
└─────────────────────────────────────┘
    ↓
IF APROVAR:
    → Grava em dist/blocos/go1/{id}.json
    → Atualiza metadata.status → "produção"
    → Atualiza metadata.data_ultima_revisao
    → Atualiza metadata.nivel_confianca → "validado"
ELSE:
    → Retorna lista de correções
    → Re-disparar produtor com feedback
```

---

## Cronograma de Execução

### LOTE 1 (Blocos 1-3)
**Timestamp:** 2026-07-03T23:00  
**Blocos:** `s7-go1-00-000`, `s7-go1-00-001`, `s7-go1-00-002`  
**Status:** ⏳ Aguardando feedback dos Juízes  

**Etapas:**
1. Disparar 3 Juízes em paralelo (T+0 a T+30min)
2. Disparar Adversarial (T+35min)
3. Disparar Integrador (T+40min)
4. Gravar aprovados (T+50min)
5. Rodar `npm run manifesto` (T+55min)

---

### LOTE 2 (Blocos 4-6)
**Timestamp:** 2026-07-03T23:55  
**Blocos:** `s7-go1-00-003`, `s7-go1-01-000`, `s7-go1-01-001`  

**Etapas:** Mesmas do Lote 1

---

### LOTE 3 (Blocos 7-10)
**Timestamp:** 2026-07-04T00:55  
**Blocos:** `s7-go1-01-002`, `s7-go1-01-003`, `s7-go1-01-004`, `s7-go1-01-005`  

**Etapas:** Mesmas do Lote 1

---

## Estrutura de Gravação PowerShell

**Após aprovação do Integrador, gravar com:**

```powershell
# Simulação: Bloco aprovado do integrador
$blo co_json = @{
    resumo_id = "s7-go1-00-000"
    metadata = @{
        status = "produção"
        data_ultima_revisao = "2026-07-03T23:50:00"
        nivel_confianca = "validado"
        versao = "1.0"
    }
    # ... resto do JSON ...
} | ConvertTo-Json -Depth 20

$path = "C:\Users\vegag\.claude\anima\med\dist\blocos\go1\s7-go1-00-000.json"
$bloco_json | Out-File -Encoding UTF8 -Path $path -Force

Write-Host "✅ Gravado: $($bloco_json.resumo_id)" -ForegroundColor Green
```

---

## Métricas Esperadas

| Métrica | Meta | Atual |
|---------|------|-------|
| **Blocos processados** | 10 | 0 |
| **Aprovados** | 9-10 | — |
| **Para revisar** | 0-1 | — |
| **Taxa de aprovação** | >85% | — |
| **Tempo total** | 4-5 horas | — |

---

## Referência: Filosofia ANIMA (8 Etapas)

Cada bloco **DEVE** ter:

1. **POR QUE** — Problema biológico/clínico existencial
2. **COMO RESOLVE** — Solução elegante que emerge do mecanismo
3. **DO QUE É FEITO** — Anatomia/fisiologia/componentes
4. **COMO FUNCIONA** — Mecanismo passo a passo
5. **COM O QUE SE ARTICULA** — Conexões a outros blocos/sistemas
6. **NOME** — Etimologia; por que chamam assim
7. **ANALOGIA** — Comparação que ilumina (não cartum, iluminação)
8. **IMAGEM** — Esquema didático (IA ou real)

**Verificação:** Narrativa e casos devem **carregar** essas 8 etapas. Flashcards devem **testar** cada etapa.

---

## Comandos para Após Aprovação

```bash
# Manifestar blocos de GO1 no índice
npm run manifesto

# Verificar se blocos foram registrados
npm run lista -- --disciplina go1

# Build & teste local
npm run build
npm run test
```

---

## Critérios de Aprovação

### Pedagogia (Juiz 1)
- ✅ As 8 etapas estão presentes na narrativa?
- ✅ Flashcards testam conceitos-chave, não details?
- ✅ Casos clínicos têm "revelação"?
- ✅ Linguagem é acessível sem simplificar demais?

### Precisão (Juiz 2)
- ✅ Mecanismo fisiológico é correto?
- ✅ Terminologia é exata (nomes científicos)?
- ✅ Referências implícitas são sólidas?
- ✅ Sem contradições com blocos pais/filhos?

### Estética (Juiz 3)
- ✅ Imagens são claras e legíveis?
- ✅ Proporção de texto vs imagens é saudável?
- ✅ Analogias iluminam vs confundem?
- ✅ Conexões laterais estão linkadas?

### Adversarial
- ❌ Encontra armadilhas pedagógicas?
- ❌ Encontra erros científicos silenciosos?
- ❌ Encontra gaps na narrativa?
- ❌ Encontra conteúdo que deve estar em outro bloco?

---

## Próximas Ações

1. **T+0:** Disparar Lote 1 (3 blocos) → 3 Juízes em paralelo
2. **T+35min:** Disparar Adversarial para Lote 1
3. **T+40min:** Disparar Integrador para Lote 1
4. **T+50min:** Gravar aprovados; rejeitar/revisar conforme necessário
5. **T+55min:** Rodar `npm run manifesto`
6. **T+60min:** Iniciar Lote 2 (mesmo fluxo)
7. **T+2h30min:** Iniciar Lote 3 (mesmo fluxo)
8. **T+3h30min:** LOTE PILOTO GO1 COMPLETO

---

**Espírito da execução:** Os primeiros 10 blocos de GO1 são a espinha dorsal. Qualidade inviolável — cada narrativa deve respirar didática. Cada flashcard deve ter significado clínico. Cada imagem deve iluminar.

