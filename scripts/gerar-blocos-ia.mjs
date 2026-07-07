// ANIMA — Gerador de blocos via Google AI Studio API (gemini-2.5-flash).
// A chave vem de med/.env (GEMINI_API_KEY) — NUNCA é impressa nem commitada.
//
// Uso (uma disciplina):
//   node scripts/gerar-blocos-ia.mjs --disciplina biologia-celular --limite 4 [--modo piloto|producao] [--delay 5000]
// Uso (semestre inteiro, até a cota diária esgotar):
//   node scripts/gerar-blocos-ia.mjs --semestre s1 --modo producao [--delay 5000]
//
// piloto: grava em producao/piloto-s1/<disc>/ (não toca esqueletos). producao: grava direto no esqueleto.
// Ao esgotar a cota diária (429 persistente), o script PARA sozinho e relata o total.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { setDefaultResultOrder } from 'node:dns'
setDefaultResultOrder('ipv4first')  // rede do Gustavo tem IPv6 quebrado → forçar IPv4

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const args = process.argv.slice(2)
function arg(nome, def) { const i = args.indexOf('--' + nome); return i >= 0 ? args[i + 1] : def }
const DISCIPLINA = arg('disciplina')
const SEMESTRE = arg('semestre')            // ex: s1
const LIMITE = parseInt(arg('limite', '100000'), 10)
const MODO = arg('modo', 'piloto')
const DELAY = parseInt(arg('delay', '5000'), 10)
const MODELOS = (arg('modelos') || arg('modelo') || 'gemini-3.5-flash,gemini-3-flash-preview,gemini-2.5-flash,gemini-3.1-flash-lite,gemini-2.5-flash-lite').split(',').map(s => s.trim()).filter(Boolean)
let MODELO_IDX = 0
const modeloAtual = () => MODELOS[MODELO_IDX]
if (!DISCIPLINA && !SEMESTRE) { console.error('Falta --disciplina <pasta> ou --semestre <s1..s12>'); process.exit(1) }

function carregarChave() {
  const envPath = join(RAIZ, '.env')
  if (!existsSync(envPath)) { console.error('ERRO: med/.env não existe.'); process.exit(1) }
  const linha = readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY='))
  if (!linha) { console.error('ERRO: GEMINI_API_KEY não está no .env'); process.exit(1) }
  const chave = linha.slice('GEMINI_API_KEY='.length).trim()
  if (!chave || chave === 'COLE_SUA_CHAVE_AQUI') { console.error('ERRO: coloque sua chave real no med/.env'); process.exit(1) }
  return chave
}
const CHAVE = carregarChave()
const SISTEMA = readFileSync(join(__dirname, '_sistema-s1.md'), 'utf8')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

class QuotaError extends Error {}
class RateError extends Error {}

function ehProduzido(d) { return Array.isArray(d.narrativa) && d.narrativa.length > 0 }
function lerJSON(p) { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')) }

function acharEsqueletos(disc, prefixo) {
  const dir = join(RAIZ, 'public', 'blocos', disc)
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(f => f.startsWith(prefixo + '-') && f.endsWith('.json'))
    .map(f => join(dir, f))
    .filter(p => { try { return !ehProduzido(lerJSON(p)) } catch { return false } })
    .sort()
}

// disciplinas do semestre, ordenadas por prioridade e depois por volume
function acharDisciplinasDoSemestre(prefixo) {
  const base = join(RAIZ, 'public', 'blocos')
  const ordemPref = ['biologia-celular', 'histologia', 'anatomia', 'embriologia', 'historia-medicina', 'biologia', 'bioq1', 'biof']
  const achadas = []
  for (const ent of readdirSync(base, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
    const n = acharEsqueletos(ent.name, prefixo).length
    if (n > 0) achadas.push({ disc: ent.name, n })
  }
  achadas.sort((a, b) => {
    const ia = ordemPref.indexOf(a.disc), ib = ordemPref.indexOf(b.disc)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return b.n - a.n
  })
  return achadas
}

function montarPrompt(esq) {
  const m = esq.metadata || {}
  return [
    `Produza o bloco de conteúdo ANIMA abaixo, seguindo TODAS as regras do sistema.`, ``,
    `ID do bloco: ${esq.resumo_id}`,
    `Título: ${m.titulo || '(defina um título fiel ao tema)'}`,
    m.subtitulo ? `Subtítulo sugerido (pode refinar): ${m.subtitulo}` : ``,
    `Disciplina: ${m.disciplina || DISCIPLINA}  |  Semestre: 1`,
    m.sistema_corporal ? `Sistema: ${m.sistema_corporal}` : ``,
    esq.resumo_conciso ? `Dica de escopo (resumo do esqueleto): ${esq.resumo_conciso}` : ``, ``,
    `Escreva o bloco COMPLETO e RICO em JSON. Requisitos mínimos OBRIGATÓRIOS: narrativa com 12-18 elementos cobrindo as 8 etapas (texto, secao, analogia com mapeamento, highlight, pausa, etimologia, contrafactual, imagem); EXATAMENTE 5 flashcards de raciocínio (nunca menos que 4); pelo menos 1 contrafactual; 1 imagem com prompt_ia detalhado. NÃO seja econômico — profundidade e completude são essenciais. Emita SOMENTE o objeto JSON.`,
  ].filter(Boolean).join('\n')
}

async function gerar(promptUsuario, tentativa = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modeloAtual()}:generateContent`
  const body = {
    system_instruction: { parts: [{ text: SISTEMA }] },
    contents: [{ role: 'user', parts: [{ text: promptUsuario }] }],
    generationConfig: { response_mime_type: 'application/json', temperature: 0.75, maxOutputTokens: 16384 },
  }
  let resp
  try {
    resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE }, body: JSON.stringify(body) })
  } catch (net) {
    if (tentativa <= 6) { await sleep(6000 * tentativa); return gerar(promptUsuario, tentativa + 1) }
    throw new Error('rede: ' + String(net.message).slice(0, 50))
  }
  if (resp.status === 429 || resp.status >= 500) {
    const txt = await resp.text().catch(() => '')
    const m = txt.match(/retry in ([\d.]+)s/i)
    let espera = m ? Math.ceil(parseFloat(m[1]) * 1000) + 2000 : tentativa * 20000
    if (espera > 90000) espera = 90000
    if (tentativa <= 8) { console.log(`  [${resp.status}] aguardando ${Math.round(espera / 1000)}s...`); await sleep(espera); return gerar(promptUsuario, tentativa + 1) }
    throw new RateError(`${resp.status} persistente`)
  }
  if (!resp.ok) throw new Error(`API ${resp.status}: ${(await resp.text()).slice(0, 160)}`)
  const data = await resp.json()
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!texto) throw new Error('resposta sem texto')
  return texto
}

function validar(b) {
  const e = []
  if (!Array.isArray(b.narrativa) || b.narrativa.length < 5) e.push('narrativa < 5')
  if (!Array.isArray(b.flashcards) || b.flashcards.length < 3) e.push('flashcards < 3')
  if (!b.resumo_conciso) e.push('sem resumo_conciso')
  if (!b.metadata?.titulo) e.push('sem titulo')
  if (!b.conexoes) e.push('sem conexoes')
  return e
}
function fundir(p, esq) {
  for (const c of ['resumo_id', 'no_pai_id', 'nos_filhos_ids', 'conexoes_laterais_ids']) p[c] = esq[c]
  p.metadata = p.metadata || {}
  p.metadata.disciplina = esq.metadata?.disciplina ?? p.metadata.disciplina
  p.metadata.semestre = esq.metadata?.semestre ?? p.metadata.semestre
  p.metadata.status = 'completo'
  p.metadata.data_ultima_revisao = '2026-07-05'
  p.procedencia = { gerado_por: modeloAtual(), data_geracao: '2026-07-05', revisado_por: 'pendente', nivel_confianca: 'rascunho' }
  // normaliza card_id dos flashcards (evita colisão entre blocos)
  if (Array.isArray(p.flashcards)) p.flashcards.forEach((fc, i) => { if (fc && typeof fc === 'object') fc.card_id = `${esq.resumo_id}-fc${String(i + 1).padStart(2, '0')}` })
  // normaliza caso_id tambem
  if (Array.isArray(p.casos_clinicos)) p.casos_clinicos.forEach((c, i) => { if (c && typeof c === 'object') c.caso_id = `${esq.resumo_id}-caso${String(i + 1).padStart(2, '0')}` })
  return p
}

// ---------- processa uma disciplina; retorna {ok, falhas} ; lança QuotaError se cota esgotar ----------
async function processarDisciplina(disc, prefixo, restante) {
  const esqueletos = acharEsqueletos(disc, prefixo).slice(0, restante)
  if (!esqueletos.length) return { ok: 0, falhas: [] }
  console.log(`\n===== ${disc}: ${esqueletos.length} esqueletos =====`)
  const outDir = MODO === 'piloto' ? join(RAIZ, 'producao', 'piloto-s1', disc) : null
  if (outDir && !existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  let ok = 0; const falhas = []
  for (let i = 0; i < esqueletos.length; i++) {
    const path = esqueletos[i]; const esq = lerJSON(path); const id = esq.resumo_id
    process.stdout.write(`[${disc} ${i + 1}/${esqueletos.length}] ${id} (${modeloAtual()}) ... `)
    try {
      const texto = await gerar(montarPrompt(esq))
      let bloco
      try { bloco = JSON.parse(texto) } catch { bloco = JSON.parse(texto.replace(/^```json?/i, '').replace(/```$/, '').trim()) }
      const erros = validar(bloco)
      if (erros.length) { falhas.push({ id, motivo: erros.join(', ') }); console.log('REPROVADO (' + erros.join(', ') + ')') }
      else {
        fundir(bloco, esq)
        writeFileSync(MODO === 'piloto' ? join(outDir, id + '.json') : path, JSON.stringify(bloco, null, 2), 'utf8')
        ok++; console.log('OK (' + bloco.narrativa.length + ' narr, ' + bloco.flashcards.length + ' fc)')
      }
    } catch (e) {
      if (e instanceof QuotaError) { throw e }
      if (e instanceof RateError) {
        if (MODELO_IDX + 1 < MODELOS.length) {
          console.log(`limite diário de ${modeloAtual()} atingido -> trocando para ${MODELOS[MODELO_IDX + 1]}`)
          MODELO_IDX++; i--; continue
        }
        console.log('\n>>> Todos os modelos esgotaram a cota diária. Parando.')
        throw new QuotaError('todos esgotados')
      }
      falhas.push({ id, motivo: String(e.message).slice(0, 120) }); console.log('ERRO: ' + String(e.message).slice(0, 120))
    }
    if (i < esqueletos.length - 1) await sleep(DELAY)
  }
  return { ok, falhas }
}

// ---------- main ----------
const prefixo = SEMESTRE || 's1'
const alvos = DISCIPLINA ? [{ disc: DISCIPLINA, n: 0 }] : acharDisciplinasDoSemestre(prefixo)
console.log(`Modo: ${MODO} | modelos (em ordem): ${MODELOS.join(' > ')} | delay: ${DELAY}ms`)
console.log(`Disciplinas na fila: ${alvos.map(a => a.disc).join(', ')}`)

let totalOk = 0; let totalFalhas = []; let restante = LIMITE; let esgotou = false
for (const { disc } of alvos) {
  if (restante <= 0 || esgotou) break
  try {
    const r = await processarDisciplina(disc, prefixo, restante)
    totalOk += r.ok; totalFalhas.push(...r.falhas); restante -= r.ok
  } catch (e) {
    if (e instanceof QuotaError) { esgotou = true; break }
    console.log(`Erro fatal em ${disc}: ${e.message}`)
  }
}

console.log(`\n${'='.repeat(50)}`)
console.log(`FIM: ${totalOk} blocos gerados${esgotou ? ' (parou por cota diária)' : ''}, ${totalFalhas.length} falhas`)
if (MODO === 'piloto') console.log(`Revisar em producao/piloto-${prefixo}/`)
for (const f of totalFalhas.slice(0, 30)) console.log(`  ✗ ${f.id}: ${f.motivo}`)
