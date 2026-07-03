// Análise de qualidade de conteúdo (data-driven) de todo o currículo — sem agentes.
// Redundância (títulos repetidos entre disciplinas), escopos longos, granularidade.
// Uso: node scripts/analisar-qualidade.mjs
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'C:\\Users\\vegag\\.claude\\anima\\med\\blueprint'
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const GENERICOS = new Set(['visao geral', 'introducao', 'fundamentos', 'principios gerais', 'como voce sera avaliado neste estagio', 'reflexao guiada', 'casos integradores', 'analise de erro', 'competencias epas', 'procedimentos', 'casos paradigmaticos'])

const todos = []
for (let n = 1; n <= 12; n++) {
  const f = join(DIR, `_MESTRE-s${n}.json`)
  if (!existsSync(f)) continue
  const m = JSON.parse(readFileSync(f, 'utf8'))
  for (const b of m.blocos || []) todos.push({ ...b, semestre: n })
}

// 1. Redundância: títulos idênticos (normalizados) em disciplinas diferentes, não-genéricos
const porTitulo = new Map()
for (const b of todos) {
  const t = norm(b.titulo)
  if (!t || GENERICOS.has(t) || t.startsWith('visao geral')) continue
  if (!porTitulo.has(t)) porTitulo.set(t, [])
  porTitulo.get(t).push(b)
}
const redundantes = [...porTitulo.entries()]
  .filter(([, arr]) => new Set(arr.map((b) => b.disciplina_id)).size > 1)
  .sort((a, b) => b[1].length - a[1].length)

// 2. Escopos longos (> 15 palavras = regra; > 25 = grave)
const contarPalavras = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length
let esc15 = 0
let esc25 = 0
const piores = []
for (const b of todos) {
  const p = contarPalavras(b.escopo)
  if (p > 15) esc15++
  if (p > 25) {
    esc25++
    piores.push({ id: b.id, p, escopo: b.escopo })
  }
}
piores.sort((a, b) => b.p - a.p)

// 3. Granularidade por disciplina
const porDisc = new Map()
for (const b of todos) {
  const k = `s${b.semestre}/${b.disciplina_id}`
  porDisc.set(k, (porDisc.get(k) || 0) + 1)
}
const disc = [...porDisc.entries()].sort((a, b) => a[1] - b[1])

console.log('=== ANALISE DE QUALIDADE DE CONTEUDO ===')
console.log(`\nTotal de blocos: ${todos.length}`)

console.log(`\n[1] REDUNDANCIA — titulos identicos entre disciplinas diferentes (nao-genericos): ${redundantes.length} grupos`)
for (const [t, arr] of redundantes.slice(0, 20)) {
  const discs = [...new Set(arr.map((b) => `s${b.semestre}/${b.disciplina_id}`))]
  console.log(`  "${arr[0].titulo}" (${arr.length}x): ${discs.join(', ')}`)
}
if (redundantes.length > 20) console.log(`  ... +${redundantes.length - 20} grupos`)

console.log(`\n[2] ESCOPOS LONGOS — > 15 palavras: ${esc15} (${(esc15 / todos.length * 100).toFixed(1)}%) | > 25 palavras (grave): ${esc25}`)
for (const w of piores.slice(0, 8)) console.log(`  ${w.id} (${w.p}p): ${w.escopo.slice(0, 90)}...`)

console.log(`\n[3] GRANULARIDADE — 5 menores e 5 maiores disciplinas:`)
for (const [k, c] of disc.slice(0, 5)) console.log(`  menor: ${k} = ${c} blocos`)
for (const [k, c] of disc.slice(-5)) console.log(`  maior: ${k} = ${c} blocos`)
