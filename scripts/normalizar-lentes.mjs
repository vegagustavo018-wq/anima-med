// Normaliza a taxonomia de 'lentes' em todos os blueprints e mapas-mestre.
// Colapsa variantes de FORMA (acento / hífen / espaço / maiúscula) num vocabulário único.
// NÃO funde palavras distintas (isso exigiria julgamento). Uso: node scripts/normalizar-lentes.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'C:\\Users\\vegag\\.claude\\anima\\med\\blueprint'
const normLente = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s/\-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

const arquivos = readdirSync(DIR).filter((f) => f.endsWith('.json') && (f.startsWith('s') || f.startsWith('_MESTRE')))
let blocosTocados = 0
const vocab = new Map()

for (const f of arquivos) {
  const caminho = join(DIR, f)
  const j = JSON.parse(readFileSync(caminho, 'utf8'))
  if (!Array.isArray(j.blocos)) continue
  let mudou = false
  for (const b of j.blocos) {
    if (!Array.isArray(b.lentes)) continue
    const antes = JSON.stringify(b.lentes)
    const norm = [...new Set(b.lentes.map(normLente).filter(Boolean))]
    for (const l of norm) vocab.set(l, (vocab.get(l) || 0) + 1)
    if (JSON.stringify(norm) !== antes) {
      b.lentes = norm
      mudou = true
      blocosTocados++
    }
  }
  if (mudou) writeFileSync(caminho, JSON.stringify(j, null, 2))
}

console.log('=== NORMALIZACAO DE LENTES ===')
console.log(`Arquivos varridos: ${arquivos.length} | blocos com lentes normalizadas: ${blocosTocados}`)
console.log(`\nVocabulario controlado resultante (${vocab.size} lentes distintas):`)
for (const [l, c] of [...vocab.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${l}: ${c}`)
