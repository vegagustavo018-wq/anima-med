# GUIA PRÁTICO — Produção S7 em Paralelo (6 Chats)

**Objetivo:** Produzir todos os 808 blocos do Semestre 7 em background, usando paralelismo real.

**Tempo estimado:** 2-3 semanas com 6 chats rodando simultaneamente.

---

## 1. ANTES DE COMEÇAR

### Pré-requisitos
- ✅ Blueprint do S7 pronto: `blueprint/_MESTRE-s7.json`
- ✅ Estrutura de diretórios: `dist/blocos/{disciplina}/`
- ✅ Filosofia ANIMA memorizada (ver abaixo)
- ✅ 1 bloco piloto gravado: `dist/blocos/go1/s7-go1-00-000.json` (referência de qualidade)

### Distribuição de Trabalho (6 chats paralelos)

| Chat | Disciplina | ID | Blocos | ETA |
|------|-----------|----|---------|----|
| A | Ginecologia-Obstetrícia I | go1 | 122 | 2 sem |
| B | Hematologia | hemat | 140 | 2 sem |
| C | Medicina Interna I | mi1 | 142 | 2 sem |
| D | Pneumologia | pneumo | 131 | 2 sem |
| E | Psiquiatria | psiq | 156 | 2.5 sem |
| F | Urologia | uro | 117 | 2 sem |

---

## 2. FILOSOFIA ANIMA (ESSENCIAL)

Copie integralmente antes de colar em cada chat:

```
# ANIMA — Filosofia Pedagógica (Regras Invioláveis)

## As 8 Etapas Obrigatórias
① POR QUE EXISTE — problema biológico
② COMO SE RESOLVE — solução, sem nomear
③ DO QUE É FEITO — composição, material
④ COMO FUNCIONA — mecanismo em movimento
⑤ COM O QUE SE ARTICULA — dependências
⑥ NOME + ETIMOLOGIA — o nome aparece aqui
⑦ ANALOGIA CONCRETA — com mapeamento explícito
⑧ IMAGEM — descrição + prompt IA

## Princípios Inegociáveis
- Narrativa em espiral causal, não listas soltas
- Parágrafos de 3-6 linhas
- Flashcards 8 tipos variados
- Caso clínico cascata 5 etapas: Causa→Estrutura→Disfunção→Sintoma→Consequência
- Incertezas [⚠️], imagens IA rotuladas (◇/⚠/✓)
- Conexões futuras: CASCATA_CAUSAL, ALVO_TERAPEUTICO, RECONHECIMENTO_CLINICO, MECANISMO_COMPARTILHADO
- Nomenclatura BR, proporções realistas

## Anti-padrões Proibidos
❌ Nomear antes de contextualizar
❌ Listas em prosa sem causa-efeito
❌ Flashcard "O que é X?"
❌ Conexão futura inventada
❌ Caso sem 5 etapas
```

---

## 3. PROMPT PARA CADA CHAT

Cole este prompt em CADA um dos 6 chats dedicados:

```
# EXECUTOR DE PRODUÇÃO S7 — [DISCIPLINA]

Você vai produzir TODOS os blocos da disciplina [DISCIPLINA_ID] do Semestre 7.

## Configuração
- Disciplina: [DISCIPLINA_ID] — [DISCIPLINA_NOME]
- Total de blocos: [TOTAL]
- Diretório de saída: C:\Users\vegag\.claude\anima\med\dist\blocos\[DISCIPLINA_ID]\
- Blueprint: blueprint/_MESTRE-s7.json

## Filosofia ANIMA
[COPIE A FILOSOFIA DO ITEM 2]

## Procedimento para CADA Bloco

1. Leia o blueprint para [DISCIPLINA_ID]
2. Processe blocos em ORDEM de árvore (pai antes dos filhos)
3. Para cada bloco:
   a. Chamar subagent PRODUTOR (effort: high):
      - Escreva 1 bloco JSON schema v3.0 completo
      - 8 etapas ANIMA + 8+ flashcards + caso clínico + conexões + imagem
      - Retorne JSON válido
   
   b. Chamar subagent GRAVADOR (effort: medium):
      - Receba o JSON do produtor
      - Grave em `dist/blocos/[DISC]/[ID].json`
      - Valide: narrativa.length > 0? flashcards.length ≥ 8?
      - Retorne: {id: "[ID]", gravado: true/false, timestamp}
   
   c. Relatar: "[ID] ✅ Gravado" ou "[ID] ⚠️ Revisar"

4. PROCESSE SEQUENCIALMENTE (não paralelo) para evitar conflito de gravação
5. Após cada 10 blocos: rode `npm run manifesto`
6. Após disciplina completa: rode `npm run manifesto` uma vez final

## Relatório Final

Após completar todos os blocos de [DISCIPLINA_ID], retorne:
```json
{
  "disciplina": "[DISCIPLINA_ID]",
  "total": [TOTAL],
  "processados": X,
  "gravados": Y,
  "revisar": Z,
  "tempo_total_horas": N,
  "taxa_sucesso": "Y/X",
  "timestamp": "2026-07-03"
}
```

## COMECE AGORA. Não pare até disciplina estar 100% completa.
```

---

## 4. EXEMPLO PARA CHAT A (GO1)

Cole isto no Chat A:

```
# EXECUTOR DE PRODUÇÃO S7 — GO1

Você vai produzir TODOS os 122 blocos de Ginecologia-Obstetrícia I (GO1) do Semestre 7.

## Configuração
- Disciplina: go1 — Ginecologia-Obstetrícia I
- Total de blocos: 122
- Diretório de saída: C:\Users\vegag\.claude\anima\med\dist\blocos\go1\
- Blueprint: blueprint/_MESTRE-s7.json

## Filosofia ANIMA
[COPIE EXATAMENTE DO ITEM 2]

## Procedimento para CADA Bloco

1. Leia blueprint para go1
2. Blocos em ordem: s7-go1-00-000, s7-go1-00-001, ... s7-go1-13-012
3. Para cada bloco:
   a. Produtor (effort: high) → JSON completo 8 etapas
   b. Gravador (effort: medium) → grava em dist/blocos/go1/[ID].json
   c. Relata resultado

4. Sequencial (não paralelo)
5. A cada 10 blocos: `npm run manifesto`
6. Fim: `npm run manifesto` + relatório

## COMECE AGORA.
```

---

## 5. CONFIGURAR OS 6 CHATS

### Chat A (GO1)
```
Versão com go1 (copie do item 4)
```

### Chat B (HEMAT)
```
Versão com hemat — 140 blocos
[Adapte o item 4 substituindo disciplina e total]
```

### Chat C (MI1)
```
Versão com mi1 — 142 blocos
```

### Chat D (PNEUMO)
```
Versão com pneumo — 131 blocos
```

### Chat E (PSIQ)
```
Versão com psiq — 156 blocos
```

### Chat F (URO)
```
Versão com uro — 117 blocos
```

---

## 6. MONITORAMENTO

### Verificar Progresso (diariamente)
```bash
# Contar blocos gravados por disciplina
cd C:\Users\vegag\.claude\anima\med
$disciplinas = @("go1", "hemat", "mi1", "pneumo", "psiq", "uro")
foreach ($d in $disciplinas) {
  $count = (Get-ChildItem "dist\blocos\$d\s7-$d-*.json" 2>$null).Count
  Write-Host "$d : $count"
}
```

### Verificar Qualidade (amostra)
```bash
# Ler 1 bloco aleatório para validar conteúdo
$bloco = Get-Content dist\blocos\go1\s7-go1-00-000.json | ConvertFrom-Json
$bloco.narrativa.Count  # deve ser ≥ 8
$bloco.flashcards.Count # deve ser ≥ 8
$bloco.casos_clinicos.Count # deve ser ≥ 1
```

### Regenerar Manifesto (quando necessário)
```bash
cd C:\Users\vegag\.claude\anima\med
npm run manifesto
```

---

## 7. TIMELINE ESPERADA

- **Dia 1-3:** Chats A-F lancei e começam produção
- **Semana 1:** GO1 (122) deve estar 50% completo
- **Semana 2:** GO1 completo, HEMAT 50%, MI1 iniciado
- **Semana 2.5:** HEMAT completo, MI1 e PNEUMO em andamento
- **Semana 3:** MI1 completo, PNEUMO 80%, PSIQ iniciado
- **Semana 3.5:** PNEUMO completo, PSIQ 50%
- **Semana 4:** PSIQ completo, URO em andamento
- **Semana 4.5-5:** URO completo

**Total: 808/808 blocos prontos em ~5 semanas**

---

## 8. TROUBLESHOOTING

### "Blocos não estão sendo gravados"
- Verifique caminho: `C:\Users\vegag\.claude\anima\med\dist\blocos\[disc]\[id].json`
- Certifique que subagent GRAVADOR está usando PowerShell correto
- Teste um arquivo manualmente: `echo '{}' | Out-File -Path "..." -Encoding UTF8`

### "Conflito de gravação entre chats"
- Cada chat trabalha em disciplina DIFERENTE → sem conflito
- Manifesto regenerado ao fim de cada disciplina → OK

### "Agente parou sem terminar disciplina"
- Relance o chat com: "Continuar a partir de [ÚLTIMO_ID_PROCESSADO]"
- Agentes resumem do checkpoint anterior

### "Blocos têm qualidade inconsistente"
- Revise 5-10 blocos aleatoriamente com checklist ANIMA
- Se muitos falharem: lance agente de AUDITORIA para revisar + corrigir

---

## 9. PÓS-PRODUÇÃO

Quando todos os 808 blocos estiverem prontos:

1. **Auditoria Final**
   ```bash
   npm run manifesto
   # Verificar total de blocos no manifesto
   ```

2. **Validação de Qualidade**
   - Amostra: 30 blocos aleatórios
   - Checklist: 8 etapas presentes? Flashcards variados? Caso com cascata?

3. **Integração no App**
   - Blocos já em schema v3.0 → pronto para React
   - Importar em IndexedDB via scripts existentes

4. **Publicação**
   - Deploy app ANIMA com Semestre 7 completo
   - Notificar alunos

---

## REFERÊNCIAS

- Filosofia ANIMA: `memory/anima_filosofia.md`
- Bloco Canônico: `dist/blocos/histologia/s1-hist-02-001-tecido-epitelial-visao-geral.json`
- Diretrizes Produção: `AGENTES/01-agente-produtor-bloco.md`
- Schema v3.0: `src/core/types/schema.ts`

---

**INÍCIO IMEDIATO. Abra 6 chats Claude Code dedicados. Cole versões A-F. Deixe rodar. Volte em 5 semanas. 808/808 completo.**
