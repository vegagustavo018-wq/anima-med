// ANIMA — Gerador de questões MCQ nativas (ligadas aos nossos próprios blocos)
// via Gemma (Google AI Studio API). Usa a mesma chave de med/.env (GEMINI_API_KEY).
//
// Diferente do banco Revalida (public/questoes/mcq.json), aqui cada questão nasce
// do conteúdo real de um bloco ANIMA já produzido (resumo_conciso + narrativa +
// casos_clinicos) e carrega um campo `bloco_id` de rastreabilidade.
//
// O Gemma ignora response_mime_type=application/json e sempre "pensa alto" antes
// de responder — por isso extraímos o bloco ```json de dentro do texto em vez de
// depender do modo JSON forçado.
//
// Uso:
//   node scripts/gerar-questoes-anima-gemma.mjs --limite 6                 (piloto)
//   node scripts/gerar-questoes-anima-gemma.mjs                            (roda até a cota esgotar)
//   node scripts/gerar-questoes-anima-gemma.mjs --disciplina biologia-celular

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { setDefaultResultOrder } from 'node:dns'
setDefaultResultOrder('ipv4first')

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const args = process.argv.slice(2)
function arg(nome, def) { const i = args.indexOf('--' + nome); return i >= 0 ? args[i + 1] : def }
const LIMITE = parseInt(arg('limite', '100000'), 10)
const DISCIPLINA_FILTRO = arg('disciplina', null)
const DELAY = parseInt(arg('delay', '4000'), 10)
const MODELOS = ['gemma-4-31b-it', 'gemma-4-26b-a4b-it']
let MODELO_IDX = 0
const modeloAtual = () => MODELOS[MODELO_IDX]

const SAIDA = join(RAIZ, 'public', 'questoes', 'mcq-anima.json')

function carregarChave() {
  const envPath = join(RAIZ, '.env')
  const linha = readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY='))
  return linha.slice('GEMINI_API_KEY='.length).trim()
}
const CHAVE = carregarChave()
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

class QuotaError extends Error {}

function listarBlocosProduzidos(filtroDisciplina) {
  const raizBlocos = join(RAIZ, 'public', 'blocos')
  const pastas = readdirSync(raizBlocos).filter(d => statSync(join(raizBlocos, d)).isDirectory())
  const blocos = []
  for (const pasta of pastas) {
    if (filtroDisciplina && pasta !== filtroDisciplina) continue
    const arquivos = readdirSync(join(raizBlocos, pasta)).filter(f => f.endsWith('.json'))
    for (const f of arquivos) {
      const caminho = join(raizBlocos, pasta, f)
      try {
        const obj = JSON.parse(readFileSync(caminho, 'utf8').replace(/^﻿/, ''))
        if (Array.isArray(obj.narrativa) && obj.narrativa.length > 0) {
          blocos.push({ id: obj.resumo_id, pasta, obj })
        }
      } catch {}
    }
  }
  return blocos
}

function carregarSaidaExistente() {
  if (!existsSync(SAIDA)) return { versao: 'anima-gemma-v1', gerado_em: new Date().toISOString(), questoes: [] }
  try {
    return JSON.parse(readFileSync(SAIDA, 'utf8'))
  } catch {
    return { versao: 'anima-gemma-v1', gerado_em: new Date().toISOString(), questoes: [] }
  }
}

// O Gemma costuma ECOAR o template de instrução (com os placeholders literais)
// antes de responder de verdade — por isso pegamos a ÚLTIMA ocorrência de cada
// marcador, nunca a primeira, e toleramos markdown (*negrito*) e minúsculas.
function pegarUltimo(texto, rotulo) {
  const re = new RegExp('^[\\s*_-]*' + rotulo + '[\\s*_-]*:\\s*([^\\n]*)', 'gim')
  const matches = [...texto.matchAll(re)]
  if (!matches.length) return null
  return matches[matches.length - 1][1].replace(/^\*+|\*+$/g, '').trim()
}

function extrairQuestaoTexto(texto) {
  const enunciado = pegarUltimo(texto, 'ENUNCIADO')
  const a = pegarUltimo(texto, 'A')
  const b = pegarUltimo(texto, 'B')
  const c = pegarUltimo(texto, 'C')
  const d = pegarUltimo(texto, 'D')
  const correta = pegarUltimo(texto, 'CORRETA')
  const comentario = pegarUltimo(texto, 'COMENTARIO') || pegarUltimo(texto, 'COMENTÁRIO')
  const dificuldade = pegarUltimo(texto, 'DIFICULDADE')
  if (!enunciado || !a || !b || !c || !d || !correta || !comentario) {
    throw new Error('campos faltando: ' + JSON.stringify({ enunciado: !!enunciado, a: !!a, b: !!b, c: !!c, d: !!d, correta, comentario: !!comentario }))
  }
  const letraCorreta = correta.trim()[0]?.toUpperCase()
  if (!['A', 'B', 'C', 'D'].includes(letraCorreta)) throw new Error('letra correta inválida: ' + correta)
  return {
    enunciado,
    alternativas: [
      { id: 'a', texto: a }, { id: 'b', texto: b }, { id: 'c', texto: c }, { id: 'd', texto: d },
    ],
    correta: letraCorreta.toLowerCase(),
    comentario,
    dificuldade: (dificuldade || 'medio').toLowerCase().replace(/[^a-z]/g, '') || 'medio',
  }
}

function montarPrompt(bloco) {
  const m = bloco.obj.metadata || {}
  const textos = (bloco.obj.narrativa || [])
    .filter(n => n.tipo === 'texto' || n.tipo === 'highlight')
    .map(n => n.conteudo).join(' ').slice(0, 2000)
  const casos = (bloco.obj.casos_clinicos || []).map(c => `Caso: ${c.titulo}. ${c.apresentacao} Diagnóstico: ${c.diagnostico_revelado}.`).join('\n').slice(0, 1000)
  const temCaso = casos.length > 0
  return `Com base no conteúdo abaixo, gere UMA questão de múltipla escolha (MCQ) de residência médica brasileira (estilo Revalida/USP).

TÓPICO: ${m.titulo || ''}
DISCIPLINA: ${m.disciplina || ''}
RESUMO: ${bloco.obj.resumo_conciso || ''}
CONTEÚDO: ${textos}
${temCaso ? 'CASO CLÍNICO DISPONÍVEL:\n' + casos : ''}

Você pode pensar/planejar como quiser antes. Mas a ÚLTIMA parte da sua resposta DEVE conter exatamente estas linhas, nesta ordem, cada uma começando com a etiqueta seguida de dois-pontos (sem markdown, sem asteriscos, sem repetir o template):
ENUNCIADO: (o enunciado da questão, ${temCaso ? 'pode incluir a vinheta clínica' : 'testando o conceito do conteúdo acima'})
A: (alternativa a)
B: (alternativa b)
C: (alternativa c)
D: (alternativa d)
CORRETA: (apenas a letra, ex: B)
COMENTARIO: (explicação de 2-3 frases: por que a correta está certa e por que as outras erram)
DIFICULDADE: (facil, medio ou dificil)

Regras: exatamente 4 alternativas plausíveis (distratores realistas, não óbvios), apenas uma correta.`
}

async function chamarGemma(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modeloAtual()}:generateContent`
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 4096 } }
  let tentativas = 0
  while (tentativas < 6) {
    tentativas++
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE }, body: JSON.stringify(body) })
    if (resp.status === 200) {
      const data = await resp.json()
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!texto) throw new Error('resposta sem texto')
      return texto
    }
    if (resp.status === 429 || resp.status === 503) {
      const data = await resp.json().catch(() => ({}))
      const msg = JSON.stringify(data).toLowerCase()
      if (resp.status === 429 && (msg.includes('quota') || msg.includes('daily') || msg.includes('diário'))) {
        throw new QuotaError(modeloAtual())
      }
      const espera = 15 * tentativas
      console.log(`  [${resp.status}] aguardando ${espera}s...`)
      await sleep(espera * 1000)
      continue
    }
    const errBody = await resp.text()
    throw new Error(`HTTP ${resp.status}: ${errBody.slice(0, 300)}`)
  }
  throw new QuotaError(modeloAtual())
}

async function gerarParaBloco(bloco) {
  const prompt = montarPrompt(bloco)
  const texto = await chamarGemma(prompt)
  const q = extrairQuestaoTexto(texto)
  const temCaso = (bloco.obj.casos_clinicos || []).length > 0
  return [{
    id: `q-anima-${bloco.id}-1`,
    tipo: 'mcq',
    subtipo: temCaso ? 'diagnostico' : 'conceitual',
    enunciado: q.enunciado,
    alternativas: q.alternativas,
    correta: q.correta,
    comentario: q.comentario,
    especialidade: bloco.obj.metadata?.disciplina || bloco.pasta,
    sistema: bloco.obj.metadata?.disciplina || bloco.pasta,
    tema: bloco.obj.metadata?.titulo || bloco.id,
    cid: null,
    dificuldade: q.dificuldade,
    tags: bloco.obj.metadata?.tags || [],
    fonte: 'ANIMA — Gerado por IA (Gemma)',
    bloco_id: bloco.id,
  }]
}

async function main() {
  const blocos = listarBlocosProduzidos(DISCIPLINA_FILTRO)
  const saida = carregarSaidaExistente()
  const jaFeitos = new Set(saida.questoes.map(q => q.bloco_id))
  const pendentes = blocos.filter(b => !jaFeitos.has(b.id)).slice(0, LIMITE)
  console.log(`${blocos.length} blocos produzidos encontrados, ${jaFeitos.size} já com questões, ${pendentes.length} pendentes nesta rodada.`)

  let geradas = 0, falhas = 0, blocosOk = 0
  for (let i = 0; i < pendentes.length; i++) {
    const bloco = pendentes[i]
    process.stdout.write(`[${i + 1}/${pendentes.length}] ${bloco.id} (${modeloAtual()}) ... `)
    try {
      const novas = await gerarParaBloco(bloco)
      saida.questoes.push(...novas)
      geradas += novas.length
      blocosOk++
      saida.gerado_em = new Date().toISOString()
      writeFileSync(SAIDA, JSON.stringify(saida, null, 2), 'utf8')
      console.log(`OK (${novas.length} questões)`)
    } catch (e) {
      if (e instanceof QuotaError) {
        console.log(`cota diária esgotada em ${e.message}`)
        if (MODELO_IDX < MODELOS.length - 1) {
          MODELO_IDX++
          console.log(`  -> trocando para ${modeloAtual()}`)
          i--
          continue
        }
        console.log('\n>>> Todos os modelos Gemma esgotaram a cota diária. Parando.')
        break
      }
      falhas++
      console.log(`ERRO: ${e.message}`)
    }
    if (i < pendentes.length - 1) await sleep(DELAY)
  }

  console.log('\n' + '='.repeat(50))
  console.log(`FIM: ${geradas} questões geradas em ${blocosOk} blocos, ${falhas} falhas.`)
  console.log(`Total acumulado em ${SAIDA}: ${saida.questoes.length} questões.`)
}

main()
