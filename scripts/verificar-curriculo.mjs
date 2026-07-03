// Verificação de qualidade de TODO o currículo (S1-12) a partir dos mapas-mestre.
// Integridade global, cobertura, flags de qualidade e checagens do internato.
// Uso: node scripts/verificar-curriculo.mjs
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'C:\\Users\\vegag\\.claude\\anima\\med\\blueprint'
const OBRIG_INTERNATO = ['avaliacao', 'integrador', 'reflexao', 'analise_erro']

const idsGlobais = new Map() // id -> semestre (para detectar duplicado global)
let dupGlobal = 0
let totalGeral = 0
const problemas = []
const porSemestre = []

for (let n = 1; n <= 12; n++) {
  const f = join(DIR, `_MESTRE-s${n}.json`)
  if (!existsSync(f)) continue
  const m = JSON.parse(readFileSync(f, 'utf8'))
  const blocos = m.blocos || []
  const ids = new Set(blocos.map((b) => b.id))
  let orfaos = 0
  let semTitulo = 0
  let semEscopo = 0

  for (const b of blocos) {
    if (idsGlobais.has(b.id)) {
      dupGlobal++
      problemas.push(`[DUP GLOBAL] ${b.id} em s${n} já existe em s${idsGlobais.get(b.id)}`)
    } else idsGlobais.set(b.id, n)
    if (b.no_pai_id && !ids.has(b.no_pai_id)) {
      orfaos++
      problemas.push(`[ORFAO] s${n} ${b.id} -> pai inexistente ${b.no_pai_id}`)
    }
    if (!b.titulo || !b.titulo.trim()) semTitulo++
    if (!b.escopo || !b.escopo.trim()) semEscopo++
  }

  const internato = n >= 10
  const checagensInternato = []
  if (internato) {
    // por disciplina (estágio): presença dos formatos obrigatórios
    const porDisc = {}
    for (const b of blocos) {
      const d = b.disciplina_id
      porDisc[d] = porDisc[d] || new Set()
      if (b.tipo_bloco) porDisc[d].add(b.tipo_bloco)
    }
    for (const [d, formatos] of Object.entries(porDisc)) {
      const faltando = OBRIG_INTERNATO.filter((x) => !formatos.has(x))
      if (faltando.length) {
        // int3-eletiva é atípico (sem casos/EPAs/procedimentos) — só alerta leve
        const leve = d === 'int3-eletiva'
        checagensInternato.push(`${d}: falta ${faltando.join(',')}${leve ? ' (atípico, ok)' : ''}`)
        if (!leve) problemas.push(`[INTERNATO] ${d} sem formato obrigatório: ${faltando.join(', ')}`)
      }
    }
    // casos sem decisao_sob_incerteza
    const casosSemDecisao = blocos.filter((b) => b.tipo_bloco === 'caso_paradigmatico' && (!b.decisao_sob_incerteza || !String(b.decisao_sob_incerteza).trim()))
    if (casosSemDecisao.length) problemas.push(`[INTERNATO] s${n}: ${casosSemDecisao.length} casos sem decisao_sob_incerteza`)
  }

  totalGeral += blocos.length
  porSemestre.push({ n, total: blocos.length, disciplinas: (m.disciplinas || []).length, orfaos, semTitulo, semEscopo, checagensInternato })
}

console.log('=== VERIFICACAO DE QUALIDADE — CURRICULO COMPLETO ===')
for (const s of porSemestre) {
  const extra = s.checagensInternato.length ? ` | internato: ${s.checagensInternato.join(' ; ')}` : ''
  console.log(`S${s.n}: ${s.total} blocos, ${s.disciplinas} disc [orfaos:${s.orfaos} semTitulo:${s.semTitulo} semEscopo:${s.semEscopo}]${extra}`)
}
console.log(`\nTOTAL GERAL: ${totalGeral} blocos | IDs duplicados globais: ${dupGlobal}`)
console.log(`Problemas encontrados: ${problemas.length}`)
for (const p of problemas.slice(0, 40)) console.log('  - ' + p)
if (problemas.length > 40) console.log(`  ... +${problemas.length - 40} outros`)
if (problemas.length === 0) console.log('  (nenhum — currículo íntegro)')
