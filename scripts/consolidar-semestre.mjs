// Consolida os blueprints de UM semestre num mapa-mestre + valida integridade.
// Uso: node scripts/consolidar-semestre.mjs <numeroSemestre>
// Ex:  node scripts/consolidar-semestre.mjs 2
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const N = process.argv[2]
if (!N) {
  console.error('uso: node scripts/consolidar-semestre.mjs <numeroSemestre>')
  process.exit(1)
}

const DIR = 'C:\\Users\\vegag\\.claude\\anima\\med\\blueprint'
const pref = `s${N}-`
// prefere .v2 quando existe (blueprint corrigido pela auditoria adversarial)
const todosArquivos = readdirSync(DIR)
const abrevs = new Set()
for (const f of todosArquivos) {
  const m = f.match(new RegExp(`^s${N}-(.+?)-blueprint(\\.v2)?\\.json$`))
  if (m) abrevs.add(m[1])
}
const arquivos = []
for (const a of [...abrevs].sort()) {
  const v2 = `s${N}-${a}-blueprint.v2.json`
  const v1 = `s${N}-${a}-blueprint.json`
  arquivos.push(todosArquivos.includes(v2) ? v2 : v1)
}
if (!arquivos.length) {
  console.error(`nenhum blueprint encontrado para o semestre ${N} (${pref}*-blueprint.json)`)
  process.exit(1)
}

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
  gerado_em: 'consolidado',
  semestre: Number(N),
  total: todos.length,
  disciplinas: porDisc.map((d) => ({ id: d.disciplina_id, nome: d.nome, total: d.total })),
  blocos: todos,
}
writeFileSync(join(DIR, `_MESTRE-s${N}.json`), JSON.stringify(mestre, null, 2))

console.log(`=== CONSOLIDACAO SEMESTRE ${N} ===`)
for (const d of porDisc) {
  console.log(`\n${d.nome} (${d.disciplina_id}) [${d.arquivo}] -- ${d.total} blocos  [orfaos:${d.orfaos} dupLocal:${d.dupLocal}]`)
  console.log('  niveis:', JSON.stringify(d.niveis))
}
console.log(`\nTOTAL: ${todos.length} blocos | IDs duplicados entre disciplinas: ${dupGlobais}`)
console.log(`Mestre -> blueprint/_MESTRE-s${N}.json`)
