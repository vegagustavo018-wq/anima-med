// Gera o banco de Questões da ANIMA a partir dos dados do app Revalida Clinical.
// Fonte (só lida uma vez, aqui): C:/Users/vegag/Documents/revalida-clinical-v4
//   - diseases.js  → 407 doenças estruturadas (sistema→sintoma→doenças)
//   - premadeFlashcards.js → 521 flashcards (frente/verso/dica/tags)
// Saída (artefato durável, versionado no ANIMA): public/questoes/*.json
//
// MCQ de diagnóstico usam o campo `diferenciais` da doença como distratores —
// clinicamente plausíveis, não aleatórios. Determinístico (RNG semeado) para
// que o hash de ingestão seja estável entre execuções.

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'questoes')
const REVALIDA = 'C:/Users/vegag/Documents/revalida-clinical-v4/src/data'

// ── RNG determinístico (mulberry32) ─────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260701)
function embaralhar(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
function slug(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}
// hash determinístico curto (djb2) — para desambiguar ids e versionar por conteúdo
function hashCurto(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
const LETRAS = ['a', 'b', 'c', 'd', 'e']

async function carregar(nome) {
  const url = pathToFileURL(`${REVALIDA}/${nome}`).href
  return import(url)
}

// ── MCQ a partir das doenças ─────────────────────────────────────────────────
function gerarMCQ(DISEASES) {
  const todas = []
  for (const bloco of DISEASES) {
    const sistema = bloco.sistema
    for (const grupo of bloco.sintomas ?? []) {
      for (const d of grupo.doencas ?? []) {
        todas.push({ ...d, sistema, sintoma: grupo.sintoma })
      }
    }
  }
  const nomes = todas.map((d) => d.nome)
  const nomesSet = new Set(nomes)
  const questoes = []
  const usados = new Set()

  for (const d of todas) {
    if (!d.apresentacao) continue
    // pool de distratores: diferenciais listados + irmãos do mesmo sintoma/sistema
    const irmaosSintoma = todas.filter((x) => x.sintoma === d.sintoma && x.nome !== d.nome).map((x) => x.nome)
    const irmaosSistema = todas.filter((x) => x.sistema === d.sistema && x.nome !== d.nome).map((x) => x.nome)
    const pool = [
      ...(d.diferenciais ?? []).filter((n) => n && n !== d.nome),
      ...irmaosSintoma,
      ...irmaosSistema,
    ]
    // dedup preservando ordem (diferenciais primeiro = mais plausíveis)
    const vistos = new Set([d.nome])
    const distratores = []
    for (const n of pool) {
      const chave = n.trim()
      if (vistos.has(chave)) continue
      vistos.add(chave)
      distratores.push(chave)
      if (distratores.length >= 3) break
    }
    if (distratores.length < 2) continue // precisa de ao menos 3 alternativas

    const opcoes = embaralhar([d.nome, ...distratores])
    const alternativas = opcoes.map((texto, i) => ({ id: LETRAS[i], texto }))
    const correta = alternativas.find((a) => a.texto === d.nome).id

    const partesComentario = []
    if (d.perola) partesComentario.push(`Pérola: ${d.perola}`)
    if (Array.isArray(d.criterios) && d.criterios.length)
      partesComentario.push(`Critérios: ${d.criterios.join('; ')}.`)
    if (d.tratamento) partesComentario.push(`Conduta: ${d.tratamento}`)

    // id determinístico e independente de ordem: em colisão, desambigua por
    // hash do conteúdo (não por posição), para o hash de ingestão ser estável.
    let id = `q-diag-${slug(d.id || d.nome)}`
    if (usados.has(id)) id = `${id}-${hashCurto(d.cid || d.apresentacao || d.nome)}`
    while (usados.has(id)) id = `${id}-x`
    usados.add(id)

    questoes.push({
      id,
      tipo: 'mcq',
      subtipo: 'diagnostico',
      enunciado: `Paciente apresenta: ${d.apresentacao}\n\nQual o diagnóstico mais provável?`,
      alternativas,
      correta,
      comentario: partesComentario.join(' ') || d.descricao || '',
      especialidade: d.especialidade || d.sistema,
      sistema: d.sistema,
      tema: d.nome,
      cid: d.cid ?? null,
      dificuldade: 'medio',
      tags: [d.sistema, d.especialidade, d.nome, d.cid].filter(Boolean),
      fonte: 'Revalida Clinical — Explorador de Doenças',
    })
  }
  return questoes
}

// ── Flashcards portados ──────────────────────────────────────────────────────
function gerarFlashcards(FLASHCARDS) {
  return FLASHCARDS.map((f) => {
    const versoLimpo = String(f.verso || '').trim()
    const curto = versoLimpo.length <= 60 && !/[.;]/.test(versoLimpo.slice(0, -1))
    return {
      id: `q-fc-${slug(f.id || f.frente)}`,
      tipo: 'flashcard',
      subtipo: curto ? 'digitar' : 'flip',
      frente: f.frente,
      verso: f.verso,
      dica: f.dica ?? null,
      fraseParaPaciente: f.fraseParaPaciente ?? null,
      especialidade: f.especialidade || f.categoria || 'Geral',
      categoria: f.categoria ?? null,
      dificuldade: (f.dificuldade || 'medio').toLowerCase(),
      tags: Array.isArray(f.tags) ? f.tags : [],
      fonte: 'Revalida Clinical — Flashcards',
    }
  })
}

async function main() {
  const { DISEASES } = await carregar('diseases.js')
  const { FLASHCARDS } = await carregar('flashcards/premadeFlashcards.js')

  const mcq = gerarMCQ(DISEASES)
  const flashcards = gerarFlashcards(FLASHCARDS)

  mkdirSync(OUT, { recursive: true })
  // versão = hash do conteúdo → correções de conteúdo propagam sozinhas (o loader
  // recarrega quando a versão muda), sem depender de bump manual.
  const base = { gerado_em: '2026-07-01', fonte: 'revalida-clinical-v4' }
  writeFileSync(join(OUT, 'mcq.json'), JSON.stringify({ ...base, versao: hashCurto(JSON.stringify(mcq)), questoes: mcq }))
  writeFileSync(join(OUT, 'flashcards.json'), JSON.stringify({ ...base, versao: hashCurto(JSON.stringify(flashcards)), questoes: flashcards }))

  // amostra de auditoria
  const porEsp = {}
  for (const q of mcq) porEsp[q.especialidade] = (porEsp[q.especialidade] ?? 0) + 1
  console.log(`MCQ geradas: ${mcq.length}`)
  console.log(`Flashcards: ${flashcards.length} (digitar: ${flashcards.filter((f) => f.subtipo === 'digitar').length})`)
  console.log('Top especialidades (MCQ):')
  Object.entries(porEsp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([e, n]) => console.log(`  ${n.toString().padStart(3)}  ${e}`))
  console.log('\nExemplo MCQ:')
  console.log(JSON.stringify(mcq[0], null, 2))
}

main().catch((e) => {
  console.error('FALHA:', e)
  process.exit(1)
})
