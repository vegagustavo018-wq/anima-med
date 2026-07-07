# Teste de Nível de Raciocínio — Codex

Objetivo: descobrir o menor `model_reasoning_effort` que ainda produz um bloco ANIMA de qualidade aprovada — sem pagar o custo extra de um nível mais alto que não traz ganho real.

## Como rodar

Para cada nível, edite `~/.codex/config.toml`:
```toml
model_reasoning_effort = "low"     # depois "medium", depois "high", depois "xhigh"
```
E rode o Codex CLI **a partir da pasta `C:\Users\vegag\.claude\anima\med`** (essa precisa ser a raiz do workspace dele, senão ele não enxerga os arquivos abaixo), com **exatamente o mesmo prompt abaixo**, salvando a saída em arquivos separados:
- `producao/teste-raciocinio-low.json`
- `producao/teste-raciocinio-medium.json`
- `producao/teste-raciocinio-high.json`
- `producao/teste-raciocinio-xhigh.json`

Não deixe ele integrar nada ainda — só gerar o JSON e salvar em cada arquivo. Depois eu comparo os 4 lado a lado.

## Prompt (o mesmo em todas as 4 rodadas)

```
Primeiro, leia estes três arquivos na íntegra, nesta ordem, antes de fazer qualquer outra coisa:
1. C:\Users\vegag\.claude\anima\ANIMA_FILOSOFIA.md (um nível acima da raiz do workspace med/ — fonte única, não há mais cópia dentro de med/)
2. AGENTES-CODEX/01-agente-produtor-bloco.md
3. public/blocos/histologia/s1-hist-02-001-tecido-epitelial-visao-geral.json (exemplo canônico de bloco já aprovado — use como referência de profundidade e tom, não copie a estrutura literal)

Depois, leia o esqueleto real deste bloco (ele já existe no disco, não invente um ID novo):
public/blocos/bioq2/s3-bioq2-00-004.json

Escreva o bloco COMPLETO para esse esqueleto, seguindo o schema v3.1 e a Filosofia ANIMA à risca: resumo_conciso, narrativa (mínimo 8-10 elementos variados: secao, texto, pausa, etimologia, highlight, analogia, contrafactual, imagem), flashcards (mínimo 3, tipos variados do enum), casos_clinicos (se fizer sentido para o tema), e conexoes (prerequisitos/futuras/laterais).

REGRA CRÍTICA: em conexoes.prerequisitos[], o campo bloco_id deve conter o TÍTULO exato do bloco pré-requisito (igual ao campo titulo do mesmo objeto), NUNCA o ID técnico tipo "s3-bioq2-00-003".

Preserve EXATAMENTE os campos estruturais do esqueleto original (resumo_id, no_pai_id, nos_filhos_ids, conexoes_laterais_ids, metadata.disciplina, metadata.semestre) — não altere esses valores.

Salve o resultado em: producao/teste-raciocinio-{NIVEL}.json (troque {NIVEL} pelo nível de raciocínio atual: low, medium, high ou xhigh)

NÃO rode nenhum script de integração agora. Só gere e salve o arquivo.
```
