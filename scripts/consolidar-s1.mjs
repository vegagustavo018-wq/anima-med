// Consolida os 6 blueprints do Semestre 1 num mapa-mestre + valida integridade.
// Não escreve conteúdo — só o esquema. Rode: node scripts/consolidar-s1.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'C:\\Users\\vegag\\.claude\\anima\\med\\blueprint'
const arquivos = readdirSync(DIR)
  .filter((f) => f.endsWith('-blueprint.json'))
  .sort()

const todos = []
const porDisc = []
const idsGlobais = new Set()
let dupGlobais = 0

for (const f of arquivos) {
  const j = JSON.parse(readFileSync(join(DIR, f), 'utf8'))
  const blocos = j.blocos || []
  const ids = new Set(blocos.map((b) => b.id))
  const vistos = new Set()
  let orfaos = 0
  let dupLocal = 0
  const niveis = {}
  for (const b of blocos) {
    if (vistos.has(b.id)) dupLocal++
    vistos.add(b.id)
    if (b.no_pai_id && !ids.has(b.no_pai_id)) orfaos++
    if (idsGlobais.has(b.id)) dupGlobais++
    idsGlobais.add(b.id)
    niveis[b.nivel] = (niveis[b.nivel] || 0) + 1
  }
  porDisc.push({ arquivo: f, disciplina_id: j.disciplina_id, nome: j.disciplina_nome, total: blocos.length, orfaos, dupLocal, niveis })
  todos.push(...blocos.map((b) => ({ ...b, disciplina_id: j.disciplina_id })))
}

const mestre = {
  gerado_em: 'consolidado-v1',
  semestre: 1,
  total: todos.length,
  disciplinas: porDisc.map((d) => ({ id: d.disciplina_id, nome: d.nome, total: d.total })),
  blocos: todos,
}
writeFileSync(join(DIR, '_MESTRE-s1.json'), JSON.stringify(mestre, null, 2))

console.log('=== CONSOLIDACAO SEMESTRE 1 ===')
for (const d of porDisc) {
  console.log(`\n${d.nome} (${d.disciplina_id}) -- ${d.total} blocos  [orfaos:${d.orfaos} dupLocal:${d.dupLocal}]`)
  console.log('  niveis:', JSON.stringify(d.niveis))
}
console.log(`\nTOTAL: ${todos.length} blocos | IDs duplicados entre disciplinas: ${dupGlobais}`)
console.log('Mestre -> blueprint/_MESTRE-s1.json')
