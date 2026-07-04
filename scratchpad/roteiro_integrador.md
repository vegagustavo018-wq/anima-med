# Roteiro do Integrador — Lote 1 Pediatria II

**Data:** 03/07/2026
**Disciplina:** Pediatria II (s9-ped2)
**Total de blocos:** 12
**Status:** Aguardando conclusão das revisões

## Sua tarefa como INTEGRADOR

Você recebe:
1. **12 blocos produzidos** (3 arquivos JSON com 4 blocos cada)
2. **48 avaliações de revisores** (3 juízes + 1 adversário por bloco)

Seu trabalho: **SINTETIZAR, INCORPORAR FEEDBACK, E GERAR OUTPUT FINAL**

## Algoritmo

### Fase 1 — Leitura e Categorização
Para cada bloco:
- Ler as 4 avaliações (3 juízes + adversário)
- Categorizar em:
  - **VERDE** (aprovado por 3+): Aprova como está, sem mudanças
  - **AMARELO** (aprovado por 2, precisa revisão por 1): Aplica ajustes pontuais
  - **VERMELHO** (PRECISA_REVISAO por 2+): Rejeita, solicita reescrita do produtor

### Fase 2 — Síntese de Feedback
Para blocos AMARELO:
- Extrair observações-chave do juiz que pediu revisão
- Priorizar: Filosofia > Diretrizes > Precisão
- Listar 2-3 mudanças específicas (não genéricas)

### Fase 3 — Decisão Final
Para cada bloco:
```
{
  "bloco_id": "s9-ped2-XX-XXX",
  "status_final": "APROVADO | PRECISA_REVISAO",
  "pontuacao_media": 0-10,
  "feedback_integrador": "...",
  "mudancas_aplicadas": ["mudança1", "mudança2"]
}
```

### Fase 4 — Output Final
Arquivo único: `ped2_lote1_final.json`
```json
{
  "lote": 1,
  "disciplina": "ped2",
  "data": "2026-07-03",
  "total_blocos": 12,
  "aprovados": [...],
  "precisam_revisao": [...],
  "metricas": {
    "taxa_aprovacao": 0.0,
    "score_medio": 0.0,
    "blocos_verdes": 0,
    "blocos_amarelos": 0,
    "blocos_vermelhos": 0
  }
}
```

## Critérios de Aceitação FINAL

✅ Filosofia ANIMA 100% — nenhuma concessão
✅ Diretrizes de Produção 100% — granularidade e tom
✅ Precisão médica 100% — nenhum erro
✅ Pensamento pediátrico 100% — por que criança ≠ adulto
✅ 5-8 flashcards por bloco
✅ 1+ caso clínico com cascata (quando aplicável)
✅ Analogias com mapeamento
✅ Conexões presentes
✅ Sem listas secas no corpo

Se qualquer bloco falhar em um critério, vai para PRECISA_REVISAO.

## Tempo estimado
- Leitura + análise: 30-45 minutos
- Síntese: 15-20 minutos
- Total: ~1 hora

## Entrega
Arquivo `ped2_lote1_final.json` salvo em `C:\Users\vegag\.claude\anima\med\scratchpad\`
