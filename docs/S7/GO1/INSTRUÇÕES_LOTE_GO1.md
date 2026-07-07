# INSTRUÇÕES PRÁTICAS — Completer Produção Lote Piloto GO1

**Status:** Pré-execução  
**Data:** 3 de julho de 2026  
**Objetivo:** Processar 10 blocos de GO1 através do pipeline de validação  

---

## RESUMO EXECUTIVO

Você tem **3 próximos passos críticos:**

1. **Disparar os produtores** (se ainda não foram) para gerar conteúdo dos 10 blocos
2. **Chamar os Juízes + Adversarial + Integrador** para cada lote
3. **Gravar JSONs aprovados** e rodar `npm run manifesto`

Como agente, **preparei tudo** para você executar isso. Aqui está como.

---

## PASSO 1: Confirmar que os Produtores Retornaram com Conteúdo

### O que você precisa verificar:

Cada bloco deve ter **narrativa + flashcards + casos + conexões**, não apenas esqueleto.

```powershell
# Para verificar um bloco:
cd C:\Users\vegag\.claude\anima\med
cat .\dist\blocos\go1\s7-go1-00-000.json | jq '.narrativa | length'
# Deve retornar > 0, não []
```

**Se todos os arrays ainda estão vazios:**  
→ Você precisa disparar os **3 produtores** ANTES de prosseguir:
- Produtor Bloco 1 (s7-go1-00-000, s7-go1-00-001, s7-go1-00-002)
- Produtor Bloco 2 (s7-go1-00-003, s7-go1-01-000, s7-go1-01-001)
- Produtor Bloco 3 (s7-go1-01-002, s7-go1-01-003, s7-go1-01-004, s7-go1-01-005)

---

## PASSO 2: Disparar Juízes + Adversarial + Integrador por Lote

### Lote 1 (blocos 1-3)

Abra **3 abas do Claude** em paralelo e dispare CADA UMA COM ESTE PROMPT:

---

### **JUIZ 1 — PEDAGOGIA**

```
Tu és um juiz pedagógico experiente em ensino médico.

Vou te dar um BLOCO do ANIMA (plataforma de educação em medicina).
Cada bloco DEVE conter uma narrativa que siga as 8 ETAPAS ANIMA:

① POR QUE — problema biológico existencial
② COMO RESOLVE — solução elegante
③ DO QUE É FEITO — componentes
④ COMO FUNCIONA — mecanismo passo a passo
⑤ COM O QUE SE ARTICULA — conexões a outros blocos
⑥ NOME — etimologia
⑦ ANALOGIA — comparação que ilumina (não infantiliza)
⑧ IMAGEM — esquema didático

BLOCO A JULGAR:
[COLAR AQUI O CONTEÚDO JSON DO BLOCO]

TAREFA:
1. Verifique se as 8 etapas estão presentes na narrativa
2. Verifique se os flashcards testam conceitos-chave (não details)
3. Verifique se os casos clínicos têm "revelação" (twist final)
4. Verifique se a linguagem é acessível sem simplificar demais
5. Dê nota 1-10 para pedagogia geral
6. Liste 3 pontos FORTES e 3 pontos FRACOS

RETORNE UM JSON ASSIM:
{
  "bloco_id": "...",
  "juiz": "pedagogia",
  "nota": 8,
  "passou": true/false,
  "pontos_fortes": ["...", "...", "..."],
  "pontos_fracos": ["...", "...", "..."],
  "recomendacoes": "..."
}
```

---

### **JUIZ 2 — PRECISÃO**

```
Tu és um juiz de precisão científica em medicina.

Vou te dar um BLOCO com narrativa sobre conceitos ginecológicos.
Você DEVE verificar:

1. Mecanismo fisiológico é correto?
2. Terminologia é exata (nomes científicos, não coloquialismos)?
3. Referências implícitas são sólidas (baseadas em fisiologia real)?
4. Sem contradições com blocos pais/filhos?
5. Dosagens/valores de referência estão corretos?
6. Fisiopatologia não tem "saltos lógicos"?

BLOCO A JULGAR:
[COLAR AQUI O CONTEÚDO JSON DO BLOCO]

RETORNE UM JSON:
{
  "bloco_id": "...",
  "juiz": "precisao",
  "nota": 8,
  "passou": true/false,
  "erros_encontrados": ["erro1", "erro2"],
  "contradicoes": ["..."],
  "recomendacoes": "..."
}
```

---

### **JUIZ 3 — ESTÉTICA & DIDÁTICA**

```
Tu és um juiz de estética e didática em educação médica.

Vou te dar um BLOCO para avaliar:

1. Imagens são claras e legíveis?
2. Proporção de texto vs imagens é saudável?
3. Analogias iluminam (ou confundem)?
4. Conexões a blocos pais/filhos estão linkadas?
5. Casos clínicos têm "tensão narrativa"?
6. Flashcards são visuais (ou muito texto)?

BLOCO A JULGAR:
[COLAR AQUI O CONTEÚDO JSON DO BLOCO]

RETORNE UM JSON:
{
  "bloco_id": "...",
  "juiz": "estetica",
  "nota": 8,
  "passou": true/false,
  "melhorias": ["...", "...", "..."],
  "recomendacoes": "..."
}
```

---

### **ADVERSARIAL**

```
Tu és um crítico adversarial. Tua job é QUEBRAR o bloco — encontrar
fraquezas que os juízes normais deixaram passar.

BLOCO A CRITCAR:
[COLAR AQUI O CONTEÚDO JSON DO BLOCO]

Procure por:
❌ Armadilhas pedagógicas (o que os estudantes vão errar?)
❌ Erros científicos silenciosos (sutis, fácil de perder)
❌ Gaps na narrativa (o que falta dizer?)
❌ Conteúdo que deveria estar em outro bloco?
❌ Casos clínicos que não testam o que promete?
❌ Analogias que enganam?

RETORNE UM JSON:
{
  "bloco_id": "...",
  "adversarial": true,
  "criticas_maiores": ["...", "...", "..."],
  "criticas_menores": ["...", "..."],
  "risco_geral": "CRITICO / ALTO / MÉDIO / BAIXO",
  "pode_aprovar": true/false,
  "recomendacoes": "..."
}
```

---

### **INTEGRADOR**

```
Tu és o INTEGRADOR FINAL. Recebeste feedback de 4 avaliadores:
- Juiz Pedagogia
- Juiz Precisão
- Juiz Estética
- Adversarial

Tua tarefa: sintetizar tudo e DECIDIR.

BLOCO ID: [ID]
FEEDBACK JUIZ PEDAGOGIA: [JSON]
FEEDBACK JUIZ PRECISÃO: [JSON]
FEEDBACK JUIZ ESTÉTICA: [JSON]
FEEDBACK ADVERSARIAL: [JSON]

TAREFA:
1. Agrupa os feedbacks por tema (conteúdo, forma, rigor, conexões)
2. Identifica consenso vs discordância
3. Pesa: erros científicos > falhas pedagógicas > problemas estéticos
4. DECIDE: APROVAR ou REVISAR

SE APROVAR:
  → Retorna JSON com decisão + lista de correções menores (for later)
  → Bloco segue para gravação
  
SE REVISAR:
  → Retorna JSON com lista de CORREÇÕES OBRIGATÓRIAS
  → Bloco volta para produtor

RETORNE UM JSON:
{
  "bloco_id": "...",
  "decisao": "APROVAR" / "REVISAR",
  "nota_final": 8.5,
  "resumo_analise": "...",
  "pontos_criticos": ["...", "..."],
  "pontos_positivos": ["...", "..."],
  "se_revisar": {
    "correcoes_obrigatorias": ["...", "..."],
    "prazo": "24h"
  },
  "se_aprovar": {
    "melhorias_futuras": ["...", "..."],
    "pode_gravar": true,
    "observacoes": "..."
  }
}
```

---

## PASSO 3: Gravar JSONs Aprovados

Após Integrador aprovar, execute isto:

```powershell
# 1. Copie o JSON aprovado do Integrador

# 2. Salve em variável PowerShell
$blocoAprovado = @{
    resumo_id = "s7-go1-00-000"
    # ... resto do JSON ...
} | ConvertTo-Json -Depth 20

# 3. Grave em dist/blocos/go1/
$caminh o = "C:\Users\vegag\.claude\anima\med\dist\blocos\go1\s7-go1-00-000.json"
$blocoAprovado | Out-File -Encoding UTF8 -Path $caminho -Force

# 4. Confirme
Write-Host "✅ Gravado: s7-go1-00-000" -ForegroundColor Green
```

---

## PASSO 4: Rodar Manifesto (por disciplina)

```powershell
cd "C:\Users\vegag\.claude\anima\med"
npm run manifesto
# Isto registra os blocos no índice global
```

---

## SEQUÊNCIA RECOMENDADA (Timeline)

| Tempo | Ação |
|-------|------|
| T+0h | Disparar 3 Juízes para Lote 1 (blocos 1-3) — 3 abas em paralelo |
| T+30min | Disparar Adversarial para Lote 1 |
| T+45min | Disparar Integrador para Lote 1 |
| T+60min | Gravar JSONs aprovados do Lote 1 |
| T+65min | Rodar `npm run manifesto` |
| T+70min | Disparar 3 Juízes para Lote 2 (blocos 4-6) |
| T+2h | Integrador para Lote 2 |
| T+2h15min | Gravar + Manifesto para Lote 2 |
| T+2h20min | Disparar Lote 3 (blocos 7-10) |
| T+3h30min | **LOTE PILOTO GO1 COMPLETO** ✅ |

---

## O QUE ESPERAR DE CADA AGENTE

### Juízes (tempo: 10-15 min cada)
- Retornam JSON estruturado com nota 1-10
- Listam pontos FORTES e FRACOS
- Dão recomendações específicas

### Adversarial (tempo: 15-20 min)
- Retorna críticas maiores + menores
- Classifica risco: CRÍTICO, ALTO, MÉDIO, BAIXO
- Pode bloqueando aprovação se acha que risco é CRÍTICO

### Integrador (tempo: 20-30 min)
- Sintetiza tudo em 1 decisão
- Se APROVAR: pronto para gravar
- Se REVISAR: lista exata do que mudar

---

## TROUBLESHOOTING

### Problema: Juiz retorna nota baixa (< 5)

**Solução:** Bloco deve voltar para **produtor revisar**. Envie feedback do juiz + adversarial para o produtor e re-dispare.

### Problema: Integrador diz REVISAR

**Solução:** Implemente as correções obrigatórias na narrativa/flashcards, re-envie para Integrador.

### Problema: npm run manifesto falha

**Solução:** Verifique se JSON está com encoding UTF8 (não UTF16) e sintaxe JSON válida.

```powershell
# Validar JSON
Test-Json -Path "C:\Users\vegag\.claude\anima\med\dist\blocos\go1\s7-go1-00-000.json"
```

---

## Checklist Final por Bloco

Antes de gravar cada bloco, verifique:

- ✅ Todas as 8 etapas ANIMA presentes na narrativa?
- ✅ Mínimo 5 flashcards, máximo 10?
- ✅ Mínimo 1 caso clínico (folhas) ou 0 (organizadores)?
- ✅ Imagens têm descrição no JSON?
- ✅ Conexões aos pais/filhos linkadas?
- ✅ Metadata.status = "produção"?
- ✅ Metadata.nivel_confianca = "validado"?
- ✅ Metadata.versao = "1.0"?

---

## Métricas de Sucesso

Ao fim dos 3 lotes, você deve ter:

| Métrica | Meta |
|---------|------|
| Blocos processados | 10/10 ✅ |
| Aprovados | 9-10 |
| Taxa aprovação | >85% |
| Tempo total | 3-4 horas |
| Blocos gravados em dist/blocos/go1/ | 9-10 |
| `npm run manifesto` executado | 3 vezes (por lote) |

---

## Próximas Etapas (Após GO1)

1. Lotes 4-6 de GO1 (módulos 2-3)
2. Lotes 7-9 de GO1 (módulos 4-6)
3. Completer primeira rodada de **todas as 14 disciplinas** (Semestre 7)
4. Iniciar Semestre 8

---

**Boa sorte! Qualidade inviolável. 💪**

