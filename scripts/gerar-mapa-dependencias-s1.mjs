// Banco de suporte #3 — Mapa de dependências/pré-requisitos do Semestre 1.
// Determinístico: deriva de no_pai_id (linhagem de ancestrais = pré-requisitos
// diretos) + ordem de leitura por disciplina (o que já foi visto antes).
// Objetivo: dar ao agente que escreve o bloco X a resposta para "o que o aluno
// já sabe e eu NÃO preciso reexplicar" — preservando a progressão em espiral.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')
const OUT = join(RAIZ, '..', 'bancos')

const mestre = JSON.parse(readFileSync(join(RAIZ, 'blueprint', '_MESTRE-s1.json'), 'utf8'))
const blocos = mestre.blocos
const porId = new Map(blocos.map((b) => [b.id, b]))

function ancestrais(b) {
  const cadeia = []
  let atual = b.no_pai_id ? porId.get(b.no_pai_id) : null
  const visto = new Set()
  while (atual && !visto.has(atual.id)) {
    visto.add(atual.id)
    cadeia.unshift({ id: atual.id, titulo: atual.titulo })
    atual = atual.no_pai_id ? porId.get(atual.no_pai_id) : null
  }
  return cadeia
}

// ordem de leitura por disciplina = ordenação natural do id (que já embute a
// numeração hierárquica do blueprint)
const porDisciplina = new Map()
for (const b of blocos) {
  const arr = porDisciplina.get(b.disciplina_id) ?? []
  arr.push(b)
  porDisciplina.set(b.disciplina_id, arr)
}
for (const arr of porDisciplina.values()) arr.sort((a, b) => a.id.localeCompare(b.id))

const mapa = {}
for (const b of blocos) {
  const anc = ancestrais(b)
  const ordemDisc = porDisciplina.get(b.disciplina_id)
  const idxNaDisc = ordemDisc.findIndex((x) => x.id === b.id)
  // "pode assumir": ancestrais diretos + blocos CORE anteriores da mesma disciplina
  const anterioresCore = ordemDisc
    .slice(0, idxNaDisc)
    .filter((x) => x.nivel === 'CORE')
    .map((x) => ({ id: x.id, titulo: x.titulo }))
  mapa[b.id] = {
    titulo: b.titulo,
    disciplina: b.disciplina_id,
    nivel: b.nivel,
    ancestrais: anc, // pré-requisitos diretos (linhagem) — SEMPRE assumíveis
    pode_assumir_core_anteriores: anterioresCore.length, // contagem (a lista completa fica no .json)
    core_anteriores_ids: anterioresCore.map((x) => x.id),
  }
}

// resumo legível: espinha CORE por disciplina (a ordem canônica de leitura)
let md = '# Mapa de Dependências — Semestre 1\n\n'
md += 'Gerado deterministicamente de `_MESTRE-s1.json` (linhagem `no_pai_id` + ordem por disciplina).\n\n'
md += 'Para o agente: ao escrever um bloco, você **pode assumir** que o aluno já viu todos os **ancestrais** (linhagem direta) e os blocos **CORE anteriores** da mesma disciplina. NÃO reexplique esses conceitos — referencie-os. Isso preserva a progressão em espiral (Princípio P4 da Filosofia).\n\n'
for (const [disc, arr] of [...porDisciplina.entries()].sort()) {
  const nome = (mestre.disciplinas.find((d) => d.id === disc) || {}).nome || disc
  md += `## ${nome} (${arr.length} blocos)\n\nEspinha CORE (ordem de leitura):\n\n`
  const core = arr.filter((b) => b.nivel === 'CORE')
  for (const b of core) md += `- \`${b.id}\` ${b.titulo}\n`
  md += '\n'
}

writeFileSync(join(OUT, 'dependencias-s1.json'), JSON.stringify(mapa, null, 1))
writeFileSync(join(OUT, 'dependencias-s1.md'), md)

const totalCore = blocos.filter((b) => b.nivel === 'CORE').length
console.log(`Mapa gerado: ${blocos.length} blocos (${totalCore} CORE).`)
console.log('Arquivos: bancos/dependencias-s1.json + .md')
