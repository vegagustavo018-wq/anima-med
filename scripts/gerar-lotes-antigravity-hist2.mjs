// Gera todos os lotes restantes de Histologia II para produção via Antigravity,
// em ordem de árvore (pai antes dos filhos), 6 blocos por lote, prontos para colar.
//
// Uso: node scripts/gerar-lotes-antigravity-hist2.mjs [--inicio N] [--tamanho 6]

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')
const AGENTES_DIR = join(RAIZ, '..', 'AGENTES', 'PROMPTS-PRODUCAO')
const DRIVE_DIR = 'G:\\Meu Drive\\anima-med-ia-gemini-estudio\\PROMPTS-PRODUCAO-S2'

const args = process.argv.slice(2)
function arg(nome, def) { const i = args.indexOf('--' + nome); return i >= 0 ? args[i + 1] : def }
const INICIO = parseInt(arg('inicio', '4'), 10)   // hist2-04 em diante (03 já existe manualmente)
const TAMANHO = parseInt(arg('tamanho', '6'), 10)
// blocos já cobertos pelo lote-03 manual (não reprocessar)
const JA_EM_LOTE_ANTERIOR = new Set(['s2-hist2-01-006', 's2-hist2-01-006-01', 's2-hist2-01-006-02', 's2-hist2-01-007', 's2-hist2-01-007-01', 's2-hist2-02-000'])

const dirBlocos = join(RAIZ, 'public', 'blocos', 'hist2')
const files = readdirSync(dirBlocos).filter(f => f.endsWith('.json'))
const byId = {}
for (const f of files) {
  const j = JSON.parse(readFileSync(join(dirBlocos, f), 'utf8'))
  byId[j.resumo_id] = j
}
const raiz = Object.values(byId).find(b => !b.no_pai_id || !byId[b.no_pai_id])

const ordem = []
function dfs(id) {
  const b = byId[id]
  if (!b) return
  ordem.push(id)
  for (const filho of (b.nos_filhos_ids || [])) dfs(filho)
}
dfs(raiz.resumo_id)

function produzido(b) { return Array.isArray(b.narrativa) && b.narrativa.length > 0 }
const pendentes = ordem.filter(id => !produzido(byId[id]) && !JA_EM_LOTE_ANTERIOR.has(id))

console.log(`Total na árvore: ${ordem.length} | Pendentes (excluindo lote-03): ${pendentes.length}`)

// agrupa em lotes de TAMANHO
const lotes = []
for (let i = 0; i < pendentes.length; i += TAMANHO) lotes.push(pendentes.slice(i, i + TAMANHO))
console.log(`Serão gerados ${lotes.length} lotes (hist2-${String(INICIO).padStart(2, '0')} a hist2-${String(INICIO + lotes.length - 1).padStart(2, '0')})`)

const CABECALHO = (n) => `# PRODUÇÃO — Fábrica de Blocos ANIMA (Histologia II) — Lote ${n}

> Cole este documento INTEIRO como primeira mensagem/tarefa. Produza os blocos abaixo, um objeto JSON completo por bloco, cada um em sua própria cerca de código.

---

## 1. MISSÃO

Você é um **redator médico-pedagógico sênior** da plataforma de estudos **ANIMA** — uma base de conhecimento médico viva, para um estudante de medicina brasileiro (UCP, Paraguai). Sua única função é **emitir blocos de conteúdo em JSON válido**, com rigor científico absoluto e a alma pedagógica da ANIMA.

## 2. CONTEXTO

ANIMA organiza a medicina em **blocos**: unidades atômicas (um tema = um bloco) conectadas em grafo. O **Semestre 2 é ciência básica fundacional** (aqui: Histologia II — histologia dos sistemas). Objetivo: COMPREENDER e CONECTAR, nunca decorar. Regra de ouro: **contextualizar antes de nomear** — todo bloco abre por cena/problema, nunca por definição.

## 3. TOM DE VOZ

Professor admirado pela biologia, profundamente empático. Português brasileiro padrão. **Prosa causal contínua** — nunca listas secas. Parágrafos de 3-6 linhas. 2ª pessoa nas provocações, 1ª do plural no convite.

## 4. AS 8 ETAPAS (sempre em prosa, sempre abrindo por contexto familiar — nunca por definição)

① por que existe (a etapa mais importante) ② como se resolve (a solução, antes de nomeada) ③ do que é feito ④ como funciona (com pausas) ⑤ com o que se articula ⑥ nome + etimologia (só agora) ⑦ analogia concreta com mapeamento explícito ⑧ imagem + prompt_ia detalhado.

## 5. REGRAS DE QUALIDADE

- Prosa causal; ≥1 pausa + 1 highlight; ≥1 analogia mapeada + 1 contrafactual; etimologia em todo termo técnico novo.
- **PROIBIDO** flashcard de decoreba ("Cite/Liste/Defina"). Flashcard bom testa raciocínio.
- Precisão inviolável: incerteza sobre número/mecanismo → marcar **[⚠️]**, nunca inventar.
- Reconhecer o bloco pai/anterior na abertura ("no bloco anterior você viu que...").
- Narrativa de 12-18 elementos; 3-8 flashcards (≥1 contrafactual).
- Caso clínico com cascata de 5 etapas quando houver síndrome relevante; senão \`casos_clinicos: []\`.
- **NUNCA use markdown (\`**negrito**\`, \`# título\`) dentro dos valores de texto** — é JSON puro, sem formatação.
- **IMPORTANTE:** em \`conexoes.prerequisitos[]\`, o campo \`bloco_id\` deve conter o TÍTULO exato do bloco pré-requisito (igual ao campo \`titulo\` do mesmo objeto), NUNCA o ID técnico (ex.: use "Sistema Cardiovascular — Visão Geral", não "s2-hist2-01-000").
- O "Contexto" de cada bloco abaixo é uma DICA de escopo (vinda do mapeamento original do currículo) — desenvolva livremente em prosa rica, seguindo as 8 etapas; não copie o contexto literalmente.

## 6. CONTRATO DE SCHEMA (emita EXATAMENTE esta forma — JSON puro, sem texto antes/depois de cada bloco)

\`\`\`json
{
  "resumo_id": "<id exato>",
  "no_pai_id": "<id do pai>",
  "nos_filhos_ids": ["<ids dos filhos, se houver; senão []>"],
  "conexoes_laterais_ids": [],
  "metadata": {
    "titulo": "<título exato da lista>", "subtitulo": "pergunta provocativa?",
    "disciplina": "Histologia II", "semestre": 2, "tipo": "conceito",
    "tags": ["..."], "tempo_leitura_minutos": 10, "nivel": "CORE"
  },
  "resumo_conciso": "200-300 palavras, prosa narrativa, sem listas",
  "narrativa": [
    { "tipo": "texto", "conteudo": "..." },
    { "tipo": "secao", "titulo": "..." },
    { "tipo": "pausa", "conteudo": "..." },
    { "tipo": "etimologia", "termo": "...", "origem": "...", "significado": "...", "explicacao": "..." },
    { "tipo": "analogia", "icone": "🔑", "conteudo": "..." },
    { "tipo": "highlight", "conteudo": "..." },
    { "tipo": "contrafactual", "pergunta": "...", "resposta": "..." },
    { "tipo": "imagem", "titulo": "...", "descricao": "...", "prompt_ia": "...", "origem": "ia" }
  ],
  "flashcards": [
    { "card_id": "<id>-fc01", "tipo": "por_que|mecanismo|contrafactual|clinico|comparacao|armadilha|etimologia", "pergunta": "...", "resposta": "...", "dificuldade": 3, "nivel_alvo": 4, "tags": [] }
  ],
  "casos_clinicos": [
    { "caso_id": "<id>-caso01", "titulo": "sem revelar diagnóstico", "apresentacao": "...", "cascata": [ {"etapa":"Causa","descricao":"..."}, {"etapa":"Estrutura Afetada","descricao":"..."}, {"etapa":"Disfunção","descricao":"..."}, {"etapa":"Sintoma","descricao":"..."}, {"etapa":"Consequência","descricao":"..."} ], "diagnostico_revelado": "...", "tratamento_resumido": "...", "conexao_com_bloco": "...", "disciplinas_relacionadas": ["..."] }
  ],
  "conexoes": {
    "prerequisitos": [ {"bloco_id":"<título do pré-requisito>","titulo":"...","disciplina":"...","semestre":1,"relevancia":"base_necessaria","explicacao":"..."} ],
    "futuras": [ {"tipo":"CASCATA_CAUSAL|ALVO_TERAPEUTICO|RECONHECIMENTO_CLINICO|MECANISMO_COMPARTILHADO","topico":"...","disciplina":"...","semestre_futuro":4,"mecanismo_conexao":"...","confianca":"consenso_didatico|hipotese_pedagogica"} ],
    "laterais": [ {"tipo_relacao":"ANALOGIA|CONTRASTE|EXEMPLO_PARALELO","topico":"...","explicacao":"..."} ]
  }
}
\`\`\`

**Nota crítica:** \`flashcards.tipo\`, \`laterais.tipo_relacao\` e \`futuras.tipo\` só aceitam os valores listados acima — nenhum outro valor, nem variações (ex.: não use "por_que_estrategia", use "por_que").

## 7. OS BLOCOS A PRODUZIR (nesta ordem exata)
`

for (let li = 0; li < lotes.length; li++) {
  const numeroLote = INICIO + li
  const nomeArq = `LOTE-ANTIGRAVITY-hist2-${String(numeroLote).padStart(2, '0')}.md`
  const bloco = lotes[li]
  const ehUltimo = li === lotes.length - 1
  const proximoNome = ehUltimo ? null : `LOTE-ANTIGRAVITY-hist2-${String(numeroLote + 1).padStart(2, '0')}.md`

  let corpo = CABECALHO(numeroLote)
  bloco.forEach((id, i) => {
    const b = byId[id]
    const pai = byId[b.no_pai_id]
    const paiTxt = pai ? `\`${b.no_pai_id}\` ("${pai.metadata?.titulo}")` : `\`${b.no_pai_id}\``
    const filhosTxt = (b.nos_filhos_ids && b.nos_filhos_ids.length)
      ? `\n**Filhos:** \`${JSON.stringify(b.nos_filhos_ids)}\``
      : ''
    const tags = (b.metadata?.tags || []).filter(t => t !== 'hist2' && t !== 'esqueleto')
    const tagsTxt = tags.length ? ` (temas: ${tags.join(', ')})` : ''
    corpo += `\n### BLOCO ${i + 1}/${bloco.length} — \`${id}\`\n`
    corpo += `**Título:** "${b.metadata?.titulo}"\n`
    corpo += `**Pai:** ${paiTxt}${filhosTxt}\n`
    corpo += `**Contexto:** ${b.resumo_conciso || '(sem dica de escopo — use o título e o tema geral do módulo para construir o bloco)'}${tagsTxt}\n`
  })

  corpo += `\n## ▶ COMANDO DE PARTIDA\n\nProduza os ${bloco.length} blocos acima, cada um em sua própria cerca de código, na ordem exata. Ao final, escreva:\n\n> ✅ LOTE CONCLUÍDO — ${bloco.length}/${bloco.length} blocos emitidos.\n\n`

  if (ehUltimo) {
    corpo += `Este é o ÚLTIMO lote de Histologia II. Ao concluir, avise: "Histologia II está completa — qual a próxima disciplina?"\n`
  } else {
    corpo += `Depois de concluir este lote, pergunte: "Posso ler o próximo lote (${proximoNome}) e iniciar a produção?" — não inicie o próximo lote sem confirmação explícita.\n`
  }

  const destino = join(AGENTES_DIR, nomeArq)
  writeFileSync(destino, corpo, 'utf8')
  console.log(`✓ ${nomeArq} (${bloco.length} blocos)`)

  if (existsSync(DRIVE_DIR)) {
    writeFileSync(join(DRIVE_DIR, nomeArq), corpo, 'utf8')
  }
}

console.log(`\nFEITO: ${lotes.length} lotes gerados (hist2-${String(INICIO).padStart(2, '0')} a hist2-${String(INICIO + lotes.length - 1).padStart(2, '0')}).`)
console.log(`Local: ${AGENTES_DIR}`)
console.log(`Drive: ${DRIVE_DIR}`)
