# Semestre 9 — Organização de Produção

**Data:** 2026-07-03  
**Status:** Completo - Pronto para produção

---

## Resumo Executivo

O blueprint do Semestre 9 foi processado e organizado em **93 lotes** distribuídos entre **9 disciplinas**, totalizando **1.246 blocos**. Cada lote contém ~13-14 blocos ordenados respeitando a hierarquia (pais sempre antes dos filhos).

---

## Arquivos Gerados

| Arquivo | Tamanho | Propósito |
|---------|---------|----------|
| `_s9_trabalho_lotes.json` | 548 KB | **PRINCIPAL** - JSON completo com todos os blocos organizados por lote |
| `_s9_trabalho_index.json` | 8 KB | Índice rápido (sem blocos) para navegar a estrutura |
| `_s9_trabalho_preview.json` | 7 KB | Amostra com resumo + 1 lote exemplo |
| `_s9_trabalho_summary.html` | 8 KB | Visualização em HTML com tabelas e estatísticas |
| `_s9_LEIAME.md` | Este arquivo | Documentação e instruções de uso |

---

## Estrutura do JSON Principal

### Formato Geral

```json
[
  {
    "disciplina_id": "cir2",
    "disciplina_nome": "Cirurgia II",
    "total_blocos": 146,
    "total_lotes": 11,
    "blocos_por_lote": [
      {
        "lote": 1,
        "blocos": [...],
        "total": 14
      },
      {
        "lote": 2,
        "blocos": [...],
        "total": 14
      }
    ]
  },
  // ... mais 8 disciplinas
]
```

### Estrutura de um Bloco

Cada bloco contém:

```json
{
  "id": "s9-cir2-01-001",
  "titulo": "A Decisão de Operar — Indicação Cirúrgica",
  "pai": "s9-cir2-01-000",
  "nivel": "tema",
  "contexto": "Quando operar vs tratar clínico: risco-benefício, urgência vs eletivo",
  "lentes": ["conduta"],
  "profundidade": 3
}
```

**Campos:**
- `id` - Identificador único (s9-{disciplina}-{módulo}-{tema})
- `titulo` - Nome legível do bloco
- `pai` - ID do bloco pai (null se é raiz)
- `nivel` - Um de: `disciplina`, `modulo`, `tema`, `visao_geral`, `folha`
- `contexto` - Escopo/objetivo do bloco (extraído do blueprint)
- `lentes` - Array de lentes pedagógicas (ex: `["conduta", "diagnostico"]`)
- `profundidade` - Nível na hierarquia (1=raiz, 2=módulo, 3=tema, 4+=folhas)

---

## Disciplinas Processadas

| ID | Nome | Blocos | Lotes |
|----|------|--------|-------|
| `cir2` | Cirurgia II | 146 | 11 |
| `emerg` | Medicina de Urgência | 185 | 14 |
| `geri-pali-reab` | Geriatria, Cuidados Paliativos e Reabilitação | 174 | 13 |
| `mi3` | Medicina Interna III | 82 | 6 |
| `onco` | Oncologia | 133 | 10 |
| `orl` | Otorrinolaringologia | 134 | 10 |
| `ped2` | Pediatria II | 153 | 11 |
| `saude-avancada` | Saúde Indígena, Coletiva Avançada e Telemedicina | 117 | 9 |
| `saude-coletiva` | Saúde Pública e Coletiva | 122 | 9 |

**Total:** 1.246 blocos em 93 lotes

---

## Como Usar

### 1. Copiar o JSON Completo

```bash
cat _s9_trabalho_lotes.json | xclip -selection clipboard
```

Ou abrir `_s9_trabalho_lotes.json` no editor e copiar manualmente.

### 2. Processar por Disciplina

Para processar blocos de uma disciplina:

```python
import json

with open('_s9_trabalho_lotes.json', 'r', encoding='utf-8') as f:
    dados = json.load(f)

# Buscar disciplina
cir2 = next(d for d in dados if d['disciplina_id'] == 'cir2')

# Iterar sobre lotes
for lote in cir2['blocos_por_lote']:
    print(f"Lote {lote['lote']}: {lote['total']} blocos")
    for bloco in lote['blocos']:
        print(f"  - {bloco['id']}: {bloco['titulo']}")
```

### 3. Visualizar em HTML

Abrir `_s9_trabalho_summary.html` em um navegador para ver tabelas interativas e estatísticas.

### 4. Usar com Pipeline de Produção

1. Passar `_s9_trabalho_lotes.json` para agentes especializados
2. Para cada lote, usar os campos como entrada:
   - `titulo` → Gera conteúdo
   - `contexto` → Define escopo
   - `lentes` → Determina abordagem pedagógica
   - `profundidade` → Ajusta nível de detalhe
3. Respeitar hierarquia: sempre referenciar `pai` para contexto

---

## Garantias de Qualidade

✓ **Ordem de Hierarquia Respeitada**
- Blocos pais aparecem SEMPRE antes de seus filhos
- Algoritmo DFS garante ordenação correta

✓ **Divisão em Lotes Uniforme**
- Média de 13-14 blocos por lote
- Variação mínima (min: 6, max: 14)

✓ **Contexto Preservado**
- Campo `contexto` extraído diretamente do blueprint
- Mantém intenção pedagógica original

✓ **Lentes Mapeadas**
- Todas as lentes do blueprint mantidas
- Pronto para aplicar diretrizes ANIMA

---

## Próximos Passos

1. **Validação:** Revisar um lote de exemplo com Gustavo
2. **Configuração:** Ajustar tamanho de lotes se necessário
3. **Produção:** Iniciar agentes para primeira disciplina (sugestão: `cir2`)
4. **Escala:** Expandir para demais disciplinas conforme validação

---

## Troubleshooting

**P: O JSON é muito grande para copiar/colar**
R: Use `_s9_trabalho_index.json` (compacto) para navegar, depois extraia disciplinas específicas conforme necessário.

**P: Preciso de apenas uma disciplina?**
R: Filtrar `_s9_trabalho_lotes.json` por `disciplina_id` desejado.

**P: A hierarquia está correta?**
R: Verificar campo `pai` — se for `null`, é raiz; caso contrário, o pai deve aparecer ANTES na lista.

**P: Posso alterar o tamanho dos lotes?**
R: Sim — reprocessar com `tamanho_lote = X` na linha 109 do script de geração.

---

## Contato & Suporte

Gerado por: Agente de Organização S9  
Timestamp: 2026-07-03 22:37 UTC  
Blueprint original: `blueprint/_MESTRE-s9.json`

Para dúvidas sobre estrutura ou conteúdo, consultar documentação ANIMA:
- Diretrizes de Produção: `anima_diretrizes_producao.md`
- Bloco Canônico: `anima_bloco_canonico.md`
- Filosofia ANIMA: `anima_filosofia.md`
