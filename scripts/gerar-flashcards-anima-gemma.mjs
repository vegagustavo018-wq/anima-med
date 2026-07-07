// ANIMA — Gerador de flashcards rápidos (uma pergunta, uma resposta, pra decorar)
// via Gemma (Google AI Studio API). Schema mínimo de propósito: memorização
// rápida, não o flashcard pedagógico completo do bloco (esse continua vindo do
// Antigravity/Gemini). Guarda em public/questoes/flashcards-anima.json,
// carregado à parte do banco Revalida (fonte diferente).
//
// Lição aprendida em duas rodadas anteriores: o Gemma sempre "pensa alto" e às
// vezes ECOA o próprio placeholder da instrução como se fosse a resposta real
// ("...", "(a pergunta aqui)"). Por isso: pedimos só 1 par pergunta/resposta
// (tarefa mínima), pegamos a ÚLTIMA ocorrência de cada marcador, e validamos o
// CONTEÚDO (não só a presença do campo) rejeitando qualquer coisa que cheire a
// placeholder.
//
// Uso:
//   node scripts/gerar-flashcards-anima-gemma.mjs --limite 10             (piloto)
//   node scripts/gerar-flashcards-anima-gemma.mjs --disciplina hist2
//   node scripts/gerar-flashcards-anima-gemma.mjs                        (até a cota esgotar)

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
const DELAY = parseInt(arg('delay', '3000'), 10)
// Round-robin entre os dois modelos Gemma disponíveis: cada um tem cota diária
// própria (RPD separado), então alternar por bloco dobra o teto diário
// combinado em vez de só usar o segundo como fallback do primeiro esgotado.
let MODELOS_ATIVOS = ['gemma-4-31b-it', 'gemma-4-26b-a4b-it']
let RR_IDX = 0
const modeloAtual = () => MODELOS_ATIVOS[RR_IDX % MODELOS_ATIVOS.length]

const SAIDA = join(RAIZ, 'public', 'questoes', 'flashcards-anima.json')

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
        if (obj.resumo_id && Array.isArray(obj.narrativa) && obj.narrativa.length > 0) blocos.push({ id: obj.resumo_id, pasta, obj })
      } catch {}
    }
  }
  return blocos
}

function carregarSaidaExistente() {
  if (!existsSync(SAIDA)) return { versao: 'anima-gemma-flash-v1', gerado_em: new Date().toISOString(), questoes: [] }
  try { return JSON.parse(readFileSync(SAIDA, 'utf8')) } catch { return { versao: 'anima-gemma-flash-v1', gerado_em: new Date().toISOString(), questoes: [] } }
}

function pegarUltimo(texto, rotulo) {
  const re = new RegExp('^[\\s*_-]*' + rotulo + '[\\s*_-]*:\\s*([^\\n]*)', 'gim')
  const matches = [...texto.matchAll(re)]
  if (!matches.length) return null
  return matches[matches.length - 1][1].replace(/^\*+|\*+$/g, '').trim()
}

// Heurísticas anti-placeholder: rejeita qualquer coisa que cheire a eco do
// template em vez de conteúdo real.
const PADROES_PLACEHOLDER = [
  /\.\.\./, // reticências
  /^\(.*\)$/, // inteiramente entre parênteses, tipo "(a pergunta aqui)"
  /^\[.*\]$/, // inteiramente entre colchetes, tipo "[question]"/"[pergunta aqui]"
  /\b(the question|sua pergunta|sua resposta|aqui vai|insert|placeholder|texto da)\b/i,
  /^(pergunta|resposta|question|answer)$/i, // só repetiu o próprio rótulo
]
function pareceConteudoReal(texto, minLen = 8, maxLen = 400) {
  if (!texto) return false
  const t = texto.trim()
  if (t.length < minLen || t.length > maxLen) return false
  return !PADROES_PLACEHOLDER.some(re => re.test(t))
}

function extrairFlashcardTexto(texto) {
  const pergunta = pegarUltimo(texto, 'PERGUNTA')
  const resposta = pegarUltimo(texto, 'RESPOSTA')
  if (!pareceConteudoReal(pergunta, 10, 250)) throw new Error('pergunta inválida ou placeholder: ' + JSON.stringify(pergunta))
  if (!pareceConteudoReal(resposta, 5, 400)) throw new Error('resposta inválida ou placeholder: ' + JSON.stringify(resposta))
  return { pergunta, resposta }
}

function montarPrompt(bloco) {
  const m = bloco.obj.metadata || {}
  const textos = (bloco.obj.narrativa || [])
    .filter(n => n.tipo === 'texto' || n.tipo === 'highlight')
    .map(n => n.conteudo).join(' ').slice(0, 1200)
  return `Baseado no conteúdo abaixo, gere UM flashcard rápido de memorização: uma pergunta curta (uma linha) e uma resposta curta e direta (uma linha), sobre o fato mais importante e mais fácil de esquecer desse conteúdo. Não é para testar raciocínio complexo — é só para decorar rápido, tipo cartão de memorização.

TÓPICO: ${m.titulo || ''}
CONTEÚDO: ${textos}

Você pode pensar como quiser antes. Mas a ÚLTIMA parte da sua resposta DEVE conter exatamente estas duas linhas, cada uma com conteúdo real e específico (nunca copie estas instruções, nunca use reticências ou parênteses de exemplo):
PERGUNTA: [pergunta curta e específica sobre o tópico, uma frase]
RESPOSTA: [resposta curta e direta, uma frase]`
}

async function chamarGemma(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modeloAtual()}:generateContent`
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2048 } }
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
      if (resp.status === 429 && (msg.includes('quota') || msg.includes('daily') || msg.includes('diário'))) throw new QuotaError(modeloAtual())
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

async function gerarParaBloco(bloco, sufixo) {
  const prompt = montarPrompt(bloco)
  const texto = await chamarGemma(prompt)
  const { pergunta, resposta } = extrairFlashcardTexto(texto)
  return {
    id: `fc-anima-${bloco.id}-${sufixo}`,
    tipo: 'flashcard',
    subtipo: 'flip',
    frente: pergunta,
    verso: resposta,
    dica: null,
    fraseParaPaciente: null,
    especialidade: bloco.obj.metadata?.disciplina || bloco.pasta,
    categoria: bloco.obj.metadata?.titulo || bloco.id,
    dificuldade: 'medio',
    tags: bloco.obj.metadata?.tags || [],
    fonte: 'ANIMA — Gerado por IA (Gemma)',
    bloco_id: bloco.id,
  }
}

// Grava mesclando com o que estiver no disco NESTE instante (não com o
// snapshot carregado no início do processo). Evita perder entradas escritas
// por uma execução concorrente deste mesmo script (lost-update).
function gravarMesclando(novaEntrada) {
  const atual = carregarSaidaExistente()
  const vistos = new Set(atual.questoes.map(q => q.id))
  if (!vistos.has(novaEntrada.id)) atual.questoes.push(novaEntrada)
  atual.gerado_em = new Date().toISOString()
  writeFileSync(SAIDA, JSON.stringify(atual, null, 2), 'utf8')
  return atual.questoes.length
}

function proximoSufixo(blocoId) {
  const atual = carregarSaidaExistente()
  const existentes = atual.questoes.filter(q => q.bloco_id === blocoId).length
  return existentes + 1
}

async function main() {
  const blocos = listarBlocosProduzidos(DISCIPLINA_FILTRO)
  const saidaInicial = carregarSaidaExistente()
  const jaFeitos = new Set(saidaInicial.questoes.map(q => q.bloco_id))
  const pendentes = blocos.filter(b => !jaFeitos.has(b.id)).slice(0, LIMITE)
  console.log(`${blocos.length} blocos produzidos encontrados, ${jaFeitos.size} já com flashcard, ${pendentes.length} pendentes nesta rodada.`)

  let geradas = 0, falhas = 0
  for (let i = 0; i < pendentes.length; i++) {
    const bloco = pendentes[i]
    process.stdout.write(`[${i + 1}/${pendentes.length}] ${bloco.id} (${modeloAtual()}) ... `)
    try {
      // Recheca no disco (não só no snapshot inicial) para não duplicar se
      // outra execução já cobriu este bloco enquanto esperávamos na fila.
      const aindaPendente = !carregarSaidaExistente().questoes.some(q => q.bloco_id === bloco.id)
      if (!aindaPendente) { console.log('já coberto por outra execução, pulando.'); continue }
      const sufixo = proximoSufixo(bloco.id)
      const nova = await gerarParaBloco(bloco, sufixo)
      const total = gravarMesclando(nova)
      geradas++
      RR_IDX++
      console.log(`OK — "${nova.frente.slice(0, 60)}..." (total: ${total})`)
    } catch (e) {
      if (e instanceof QuotaError) {
        console.log(`cota diária esgotada em ${e.message}`)
        MODELOS_ATIVOS = MODELOS_ATIVOS.filter(m => m !== e.message)
        if (MODELOS_ATIVOS.length > 0) { console.log(`  -> removido da rotação, seguindo com: ${MODELOS_ATIVOS.join(', ')}`); i--; continue }
        console.log('\n>>> Todos os modelos Gemma esgotaram a cota diária. Parando.')
        break
      }
      falhas++
      console.log(`REJEITADO: ${e.message}`)
    }
    if (i < pendentes.length - 1) await sleep(DELAY)
  }

  console.log('\n' + '='.repeat(50))
  console.log(`FIM: ${geradas} flashcards aceitos, ${falhas} rejeitados.`)
  console.log(`Total acumulado em ${SAIDA}: ${carregarSaidaExistente().questoes.length} flashcards.`)
}

main()
