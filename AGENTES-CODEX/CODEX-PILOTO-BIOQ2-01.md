# ANIMA — Produção via Codex (Bioquímica II — Metabolismo)

Você vai produzir conteúdo real para a plataforma ANIMA Med, um app de estudo médico. Diferente de outras IAs que usamos até agora (que só devolviam texto para colarmos manualmente), você tem acesso direto ao disco — então, além de escrever o conteúdo, você mesmo vai integrá-lo na árvore do currículo ao final, rodando os scripts de validação.

Rode a partir da pasta `C:\Users\vegag\.claude\anima\med` (essa é a raiz do workspace — todos os caminhos abaixo são relativos a ela).

## Passo 1 — Leia o contexto (nesta ordem, na íntegra, antes de escrever qualquer coisa)

1. `C:\Users\vegag\.claude\anima\ANIMA_FILOSOFIA.md` (um nível acima da raiz do workspace `med/` — fonte única, não há mais cópia dentro de `med/`) — a constituição pedagógica do projeto. Isso define o padrão de qualidade, tom e estrutura obrigatórios. Não pule isso.
2. `AGENTES-CODEX/01-agente-produtor-bloco.md` — instruções condensadas do agente produtor de blocos.
3. `public/blocos/histologia/s1-hist-02-001-tecido-epitelial-visao-geral.json` — exemplo canônico de bloco já aprovado. Use como referência de profundidade, tom e variedade de narrativa — não copie a estrutura literal, cada tema pede sua própria abordagem.

## Passo 2 — Os blocos-alvo desta rodada (esqueletos já existem no disco, não invente IDs novos)

Esta é uma rodada de AMOSTRA de controle de qualidade — apenas estes 3 blocos, nesta ordem:
- `public/blocos/bioq2/s3-bioq2-00-004.json` — "Os Quatro Modos de Controlar uma Enzima Reguladora"
- `public/blocos/bioq2/s3-bioq2-01-000.json` — "Bioenergética — Visão do Módulo"
- `public/blocos/bioq2/s3-bioq2-01-001.json` — "Termodinâmica da Vida — Visão Geral"

(Não repita os já produzidos em 06/07/2026: `s3-bioq2-00-002`, `s3-bioq2-00-003` e `s3-bioq2-00-005`. Em rodadas futuras, verifique quais esqueletos ainda têm `narrativa: []` em `public/blocos/bioq2/` para escolher os próximos.)

Leia cada esqueleto (já tem `metadata.titulo`, `resumo_id`, `no_pai_id`, `nos_filhos_ids` preenchidos — preserve esses valores exatamente como estão).

## Passo 3 — Escreva o bloco completo para cada um

Para cada um, preencha (schema v3.1):
- `resumo_conciso`
- `narrativa[]` — mínimo 8-10 elementos variados (tipos: secao, texto, pausa, etimologia, highlight, analogia, contrafactual, imagem — use pelo menos 5 tipos diferentes)
- `flashcards[]` — mínimo 3, tipos variados (por_que | mecanismo | contrafactual | clinico | comparacao | armadilha | etimologia)
- `casos_clinicos[]` — se o tema permitir uma vinheta clínica relevante (cascata de 5 etapas); pode ficar vazio `[]` se não fizer sentido forçar um caso
- `conexoes.prerequisitos[]`, `.futuras[]`, `.laterais[]`

**REGRA CRÍTICA (CORRIGIDA em 06/07/2026 — a instrução anterior estava invertida e teve que ser corrigida em ~250 prerequisitos no currículo inteiro):** em `conexoes.prerequisitos[].bloco_id`, o valor deve ser o **ID técnico real** do bloco pré-requisito (ex: `s3-bioq2-00-001`), exatamente como aparece no campo `resumo_id` daquele bloco. O campo `titulo` (ao lado de `bloco_id` no mesmo objeto) é que leva o título humano. NUNCA coloque o título dentro de `bloco_id` — o código do app (`src/core/anima/grafo.ts`) resolve arestas do grafo comparando `bloco_id` contra `resumo_id` de outros blocos; se `bloco_id` for um título, a aresta é descartada silenciosamente (sem erro, só some do grafo). Para descobrir o ID correto, abra o arquivo do bloco pré-requisito e copie o valor de `resumo_id` (não o `metadata.titulo`).

**REGRA CRÍTICA (erro que você mesmo cometeu na rodada anterior, 06/07/2026): cada objeto de `casos_clinicos[]` deve ter EXATAMENTE estes 8 campos — não pule `conexao_com_bloco` nem `disciplinas_relacionadas`, os dois ficaram faltando nos 3 blocos da rodada passada e tivemos que completar manualmente.** Siga exatamente este formato (exemplo real de outro bloco aprovado):
```json
{
  "caso_id": "ID_DO_BLOCO-caso01",
  "titulo": "Título curto e concreto do caso (não genérico)",
  "apresentacao": "Vinheta clínica realista: idade, profissão/contexto, queixa, história, achados de exame físico ou exames complementares relevantes.",
  "cascata": [
    { "etapa": "Causa", "descricao": "O que desencadeou o processo, no nível mais fundamental." },
    { "etapa": "Estrutura Afetada", "descricao": "Qual estrutura/tecido/célula é afetada e como, ligando ao conteúdo do bloco." },
    { "etapa": "Disfunção", "descricao": "O que para de funcionar corretamente como consequência." },
    { "etapa": "Sintoma", "descricao": "Como essa disfunção se manifesta clinicamente." },
    { "etapa": "Consequência", "descricao": "O desfecho previsível se não houver intervenção, ou o mecanismo do tratamento." }
  ],
  "conexao_com_bloco": "Explique explicitamente como o caso ilustra o conceito central do bloco.",
  "disciplinas_relacionadas": ["disciplina1", "disciplina2"],
  "diagnostico_revelado": "Nome do diagnóstico.",
  "tratamento_resumido": "Tratamento em 1-2 frases."
}
```
Antes de salvar cada bloco, confira campo por campo que `casos_clinicos[0]` (se não estiver vazio) tem os 8 campos acima, nesta ordem, nenhum a menos.

**REGRA CRÍTICA (erro que você mesmo cometeu em 2 de 3 blocos numa rodada anterior, 06/07/2026): acentuação e cópia exata de títulos.** Numa rodada anterior, os blocos `s3-bioq2-00-004` e `s3-bioq2-01-000` saíram com o texto quase inteiro SEM acentuação portuguesa (ex: "celula" em vez de "célula", "nao" em vez de "não", "solucao" em vez de "solução") — só o terceiro bloco da mesma rodada saiu certo. Isso é inaceitável: todo o texto (`resumo_conciso`, `narrativa[]`, `flashcards[]`, `casos_clinicos[]`) deve usar português correto e completo, com todos os acentos (á é í ó ú â ê ô ã õ ç). O mesmo problema apareceu em `conexoes.prerequisitos[].bloco_id`: em vez de copiar o título do bloco pré-requisito caractere por caractere do arquivo original (incluindo o travessão "—" e os acentos), o texto foi retipado de memória e saiu sem acento e com hífen "-" no lugar do travessão "—", quebrando a correspondência exata exigida. Antes de salvar CADA bloco, releia o próprio texto que você escreveu e confirme: (1) há acentos em todas as palavras que precisam deles — se um parágrafo inteiro não tem nenhum acento, isso é sinal de bug, pare e reescreva; (2) cada `bloco_id` em `prerequisitos[]` foi copiado exatamente do campo `metadata.titulo` do arquivo do bloco pré-requisito (abra o arquivo de novo se precisar, não confie na memória).

Salve cada bloco completo **sobrescrevendo o próprio arquivo do esqueleto** em `public/blocos/bioq2/{id}.json` (preservando os campos estruturais que já estavam lá).

## Passo 4 — Rode a integração e validação você mesmo

No diretório `C:\Users\vegag\.claude\anima\med`, rode nesta ordem:
```
npm run manifesto
node scripts/verificar-curriculo.mjs
```
O resultado esperado é `0 órfãos, 0 duplicados` e a contagem total de blocos permanecendo a mesma (a produção só preenche esqueletos existentes, não cria nem remove blocos da árvore).

## Passo 5 — Relatório final

Me diga: quais dos 3 blocos você completou, quantos elementos de narrativa/flashcards/casos_clínicos cada um ficou, e o resultado exato do `verificar-curriculo.mjs` (contagem total, órfãos, duplicados). Se algo der errado em qualquer passo, pare e reporte o erro em vez de tentar contornar.
