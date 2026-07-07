// ANIMA — Gerador de blocos completos via Antigravity (Interactions API).
// Diferente do Gemma (schema simples), este modelo já provou capacidade de gerar
// o schema COMPLETO do bloco com boa profundidade (mesmo motor usado no app
// Antigravity manual a sessão toda). Custo por bloco: ~60-70k tokens (bem mais
// barato que tarefas com busca na web, já que aqui não navega).
//
// Lição do piloto: sem um exemplo REAL do schema de casos_clinicos embutido no
// prompt, o modelo improvisa uma estrutura própria (campos errados, cascata
// quebrada em objetos separados). Por isso o prompt aqui inclui um exemplo
// completo e real de caso clínico.
//
// Escreve em uma pasta de STAGING (não direto no esqueleto) — o
// integrar-blocos-produzidos.mjs continua sendo o portão de validação, igual
// para os outros produtores.
//
// Uso:
//   node scripts/gerar-blocos-antigravity-api.mjs --disciplina fisio2 --limite 3   (piloto)
//   node scripts/gerar-blocos-antigravity-api.mjs --disciplina fisio2              (até a cota esgotar)

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { setDefaultResultOrder } from 'node:dns'
setDefaultResultOrder('ipv4first')

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const args = process.argv.slice(2)
function arg(nome, def) { const i = args.indexOf('--' + nome); return i >= 0 ? args[i + 1] : def }
const DISCIPLINA = arg('disciplina')
const LIMITE = parseInt(arg('limite', '100000'), 10)
const DELAY = parseInt(arg('delay', '5000'), 10)

if (!DISCIPLINA) { console.error('Falta --disciplina <pasta>'); process.exit(1) }

const STAGING = join(RAIZ, 'producao', `lote-antigravity-api-${DISCIPLINA}`)
mkdirSync(STAGING, { recursive: true })

function carregarChave() {
  const envPath = join(RAIZ, '.env')
  const linha = readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY='))
  return linha.slice('GEMINI_API_KEY='.length).trim()
}
const CHAVE = carregarChave()
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

class QuotaError extends Error {}

function ehProduzido(d) { return Array.isArray(d.narrativa) && d.narrativa.length > 0 }

function listarPendentes(disc) {
  const dir = join(RAIZ, 'public', 'blocos', disc)
  return readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => join(dir, f))
    .map(p => { try { return { path: p, obj: JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')) } } catch { return null } })
    .filter(Boolean)
    .filter(({ obj }) => !ehProduzido(obj))
    .sort((a, b) => a.obj.resumo_id.localeCompare(b.obj.resumo_id))
}

function tituloDoNoPai(disc, noPaiId) {
  if (!noPaiId) return null
  const p = join(RAIZ, 'public', 'blocos', disc, noPaiId + '.json')
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf8')).metadata.titulo } catch { return null }
}

// Tabela id->titulo de TODOS os blocos da disciplina (produzidos ou não), para o
// modelo escolher o bloco_id correto de um prerequisito em vez de inventar/usar
// o título por engano — ele não tem acesso a disco para conferir, só ao que
// mandamos no prompt.
function mapaIdTitulo(disc) {
  const dir = join(RAIZ, 'public', 'blocos', disc)
  const mapa = []
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    try {
      const o = JSON.parse(readFileSync(join(dir, f), 'utf8').replace(/^﻿/, ''))
      if (o.resumo_id && o.metadata?.titulo) mapa.push(`${o.resumo_id} :: ${o.metadata.titulo}`)
    } catch {}
  }
  return mapa.sort()
}

const EXEMPLO_CASO_CLINICO = {
  caso_id: "ID_DO_BLOCO-caso01",
  titulo: "Título curto e concreto do caso (não genérico)",
  apresentacao: "Vinheta clínica realista: idade, profissão/contexto, queixa, história, achados de exame físico ou exames complementares relevantes.",
  cascata: [
    { etapa: "Causa", descricao: "O que desencadeou o processo, no nível mais fundamental." },
    { etapa: "Estrutura Afetada", descricao: "Qual estrutura/tecido/célula é afetada e como, ligando ao conteúdo do bloco." },
    { etapa: "Disfunção", descricao: "O que para de funcionar corretamente como consequência." },
    { etapa: "Sintoma", descricao: "Como essa disfunção se manifesta clinicamente." },
    { etapa: "Consequência", descricao: "O desfecho previsível se não houver intervenção, ou o mecanismo do tratamento." }
  ],
  conexao_com_bloco: "Explique explicitamente como o caso ilustra o conceito central do bloco.",
  disciplinas_relacionadas: ["disciplina1", "disciplina2"],
  diagnostico_revelado: "Nome do diagnóstico.",
  tratamento_resumido: "Tratamento em 1-2 frases."
}

function montarPrompt(item, disc, tabelaIds) {
  const obj = item.obj
  const m = obj.metadata
  const tituloPai = tituloDoNoPai(disc, obj.no_pai_id)
  return `Você é um especialista em educação médica escrevendo para a plataforma ANIMA Med. Escreva o bloco de conteúdo COMPLETO abaixo, seguindo rigorosamente o schema v3.1 e o padrão pedagógico ANIMA: narrativa gradual e socrática (o leitor deduz antes de ser informado), etimologias reais, analogias vívidas e concretas, pausas para reflexão, contrafactuais que testem compreensão mecanística, e pelo menos um caso clínico em cascata de 5 etapas quando o tema permitir.

TÓPICO: "${m.titulo}"
DISCIPLINA: ${m.disciplina}
SEMESTRE: ${m.semestre}
resumo_id (preservar EXATAMENTE): ${obj.resumo_id}
no_pai_id (preservar EXATAMENTE): ${obj.no_pai_id || 'null'}
nos_filhos_ids (preservar EXATAMENTE): ${JSON.stringify(obj.nos_filhos_ids || [])}
RESUMO SUGERIDO PELO ESQUELETO: ${obj.resumo_conciso || '(nenhum, crie um)'}
${tituloPai ? `BLOCO PAI (para contexto e possível pré-requisito): "${tituloPai}", cujo ID é ${obj.no_pai_id}` : ''}

TABELA DE IDS DA DISCIPLINA (use para preencher conexoes.prerequisitos[].bloco_id — cada linha é "id :: título"):
${tabelaIds.join('\n')}

Retorne APENAS um objeto JSON válido, sem markdown, sem texto antes ou depois, com esta estrutura exata:
{
  "resumo_id": "${obj.resumo_id}",
  "no_pai_id": ${JSON.stringify(obj.no_pai_id || null)},
  "nos_filhos_ids": ${JSON.stringify(obj.nos_filhos_ids || [])},
  "conexoes_laterais_ids": [],
  "metadata": { "titulo": "${m.titulo}", "subtitulo": "...", "disciplina": "${m.disciplina}", "semestre": ${m.semestre}, "tipo": "conceito", "tags": ["..."], "tempo_leitura_minutos": 10, "nivel": "CORE" },
  "resumo_conciso": "...",
  "narrativa": [
    { "tipo": "secao", "titulo": "..." },
    { "tipo": "texto", "conteudo": "..." },
    { "tipo": "pausa", "conteudo": "pergunta que convida o leitor a deduzir antes de continuar" },
    { "tipo": "texto", "conteudo": "resposta/explicação" },
    { "tipo": "etimologia", "termo": "...", "origem": "...", "significado": "...", "explicacao": "..." },
    { "tipo": "analogia", "icone": "🔑", "conteudo": "..." },
    { "tipo": "highlight", "conteudo": "..." },
    { "tipo": "contrafactual", "pergunta": "...", "resposta": "..." },
    { "tipo": "imagem", "titulo": "...", "descricao": "...", "prompt_ia": "prompt em inglês para gerar a imagem", "origem": "ia" }
    /* mínimo 8-10 elementos no total, misture os tipos livremente, secao pode aparecer mais de uma vez para dividir o bloco em partes */
  ],
  "flashcards": [
    { "card_id": "${obj.resumo_id}-fc01", "tipo": "mecanismo", "pergunta": "...", "dificuldade": 2, "nivel_alvo": 4, "tags": ["..."], "resposta": "..." }
    /* mínimo 3, tipos variados do enum: por_que | mecanismo | contrafactual | clinico | comparacao | armadilha | etimologia */
  ],
  "casos_clinicos": [
    /* ZERO ou UM caso clínico (não mais que isso), EXATAMENTE neste formato (isto é um exemplo real de outro bloco, siga a mesma estrutura de campos): */
    ${JSON.stringify(EXEMPLO_CASO_CLINICO, null, 2).split('\n').join('\n    ')}
    /* se o tema não permitir um caso clínico natural, deixe casos_clinicos como [] — não force */
  ],
  "conexoes": {
    "prerequisitos": [ { "bloco_id": "ID TÉCNICO exato do bloco pré-requisito, ex: ${obj.no_pai_id || 's-disc-00-000'} (busque na TABELA DE IDS acima, nunca invente e nunca use o título aqui)", "titulo": "título humano do mesmo bloco (esse sim é o título)", "disciplina": "...", "semestre": ${m.semestre}, "relevancia": "base_necessaria", "explicacao": "..." } ],
    "futuras": [ { "tipo": "CASCATA_CAUSAL | ALVO_TERAPEUTICO | RECONHECIMENTO_CLINICO | MECANISMO_COMPARTILHADO", "topico": "...", "disciplina": "...", "semestre_futuro": N, "mecanismo_conexao": "...", "confianca": "consenso_didatico" } ],
    "laterais": [ { "tipo_relacao": "ANALOGIA | CONTRASTE | EXEMPLO_PARALELO", "topico": "...", "explicacao": "..." } ]
  }
}

REGRA CRÍTICA E OBRIGATÓRIA (CORRIGIDA em 06/07/2026 — a versão anterior deste prompt estava invertida e gerou ~250 links quebrados no currículo): em conexoes.prerequisitos[].bloco_id, o valor DEVE ser o ID TÉCNICO exato do bloco pré-requisito (ex: "${obj.no_pai_id || 's-disc-00-000'}"), procurado na TABELA DE IDS acima — NUNCA o título "${tituloPai || 'Nome do Bloco Pai'}" nesse campo. O título vai no campo "titulo" ao lado. O código do app resolve as arestas do grafo comparando bloco_id contra o resumo_id de cada bloco; se for um título, a conexão é descartada silenciosamente. Confira isso antes de responder.

REGRA CRÍTICA: casos_clinicos deve seguir EXATAMENTE os nomes de campo do exemplo acima (caso_id, titulo, apresentacao, cascata com etapa/descricao, conexao_com_bloco, disciplinas_relacionadas, diagnostico_revelado, tratamento_resumido) — não invente campos como etapa_id, pergunta_socratica ou gabarito_resumido.`
}

async function chamarAntigravity(prompt) {
  const criarResp = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE },
    body: JSON.stringify({ agent: 'antigravity-preview-05-2026', input: prompt, environment: 'remote', background: true }),
  })
  if (criarResp.status === 429) throw new QuotaError('rate/quota')
  if (criarResp.status !== 200) {
    const data = await criarResp.json().catch(() => ({}))
    throw new Error(`HTTP ${criarResp.status} na criação: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const criado = await criarResp.json()
  const id = criado.id
  let atual = criado
  let tentativa = 0
  while (atual.status === 'in_progress' && tentativa < 60) {
    tentativa++
    await sleep(15000)
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions/${id}`, { headers: { 'x-goog-api-key': CHAVE } })
    if (resp.status === 429) throw new QuotaError('rate/quota (polling)')
    atual = await resp.json()
  }
  if (atual.status !== 'completed') throw new Error('status final inesperado: ' + atual.status)
  const textStep = (atual.steps || []).find(s => s.type === 'model_output')
  const texto = textStep?.content?.find(c => c.type === 'text')?.text
  if (!texto) throw new Error('resposta sem texto')
  return { texto, usage: atual.usage }
}

async function main() {
  const pendentes = listarPendentes(DISCIPLINA).slice(0, LIMITE)
  const tabelaIds = mapaIdTitulo(DISCIPLINA)
  console.log(`${pendentes.length} blocos pendentes em ${DISCIPLINA} (limitado a ${LIMITE}).`)
  let geradas = 0, falhas = 0, tokensTotal = 0

  for (let i = 0; i < pendentes.length; i++) {
    const item = pendentes[i]
    const id = item.obj.resumo_id
    process.stdout.write(`[${i + 1}/${pendentes.length}] ${id} ... `)
    try {
      const prompt = montarPrompt(item, DISCIPLINA, tabelaIds)
      const { texto, usage } = await chamarAntigravity(prompt)
      const bloco = JSON.parse(texto)
      if (!Array.isArray(bloco.narrativa) || bloco.narrativa.length < 5) throw new Error('narrativa insuficiente')
      if (!Array.isArray(bloco.flashcards) || bloco.flashcards.length < 3) throw new Error('flashcards insuficientes')
      // rede de segurança: se o modelo ainda assim colocar um título em bloco_id
      // (em vez do ID técnico), tenta corrigir via a própria tabela; se não achar,
      // remove o prerequisito ao invés de deixar uma aresta quebrada no grafo.
      const idsValidos = new Set(tabelaIds.map(l => l.split(' :: ')[0]))
      const tituloParaId = new Map(tabelaIds.map(l => { const [i, ...t] = l.split(' :: '); return [t.join(' :: '), i] }))
      let prereqsCorrigidos = 0, prereqsRemovidos = 0
      if (Array.isArray(bloco.conexoes?.prerequisitos)) {
        bloco.conexoes.prerequisitos = bloco.conexoes.prerequisitos.filter(p => {
          if (idsValidos.has(p.bloco_id)) return true
          const idCorreto = tituloParaId.get(p.bloco_id)
          if (idCorreto) { p.bloco_id = idCorreto; prereqsCorrigidos++; return true }
          prereqsRemovidos++
          return false
        })
      }
      writeFileSync(join(STAGING, id + '.json'), JSON.stringify(bloco, null, 2), 'utf8')
      geradas++
      tokensTotal += usage?.total_tokens || 0
      const nota = (prereqsCorrigidos || prereqsRemovidos) ? ` [prereqs: ${prereqsCorrigidos} corrigidos, ${prereqsRemovidos} removidos]` : ''
      console.log(`OK (${bloco.narrativa.length} narr, ${bloco.flashcards.length} fc, ${bloco.casos_clinicos?.length || 0} casos, ${usage?.total_tokens} tokens)${nota}`)
    } catch (e) {
      if (e instanceof QuotaError) {
        console.log(`cota/rate limit atingido: ${e.message}`)
        console.log('\n>>> Parando por limite de taxa/cota.')
        break
      }
      falhas++
      console.log(`ERRO: ${e.message}`)
    }
    if (i < pendentes.length - 1) await sleep(DELAY)
  }

  console.log('\n' + '='.repeat(50))
  console.log(`FIM: ${geradas} blocos gerados em ${STAGING}, ${falhas} falhas, ${tokensTotal} tokens totais.`)
  console.log(`Próximo passo: montar input-integrador.json a partir de ${STAGING} e rodar scripts/integrar-blocos-produzidos.mjs`)
}

main()
