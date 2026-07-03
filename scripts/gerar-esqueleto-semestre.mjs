// Gera blocos-esqueleto de UM semestre a partir do mapa-mestre + deriva a
// estrutura de currículo navegável. NÃO sobrescreve conteúdo real existente.
// Deriva TUDO do próprio blueprint (zero config manual por semestre).
// Uso: node scripts/gerar-esqueleto-semestre.mjs <numeroSemestre>
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const N = process.argv[2]
if (!N) {
  console.error('uso: node scripts/gerar-esqueleto-semestre.mjs <numeroSemestre>')
  process.exit(1)
}

const RAIZ = 'C:\\Users\\vegag\\.claude\\anima\\med'
const BLOCOS_DIR = join(RAIZ, 'public', 'blocos')
const MESTRE = join(RAIZ, 'blueprint', `_MESTRE-s${N}.json`)

function corDe(id, nome) {
  const s = `${id} ${nome}`.toLowerCase()
  if (s.includes('anato')) return 'var(--color-disc-anatomia)'
  if (s.includes('histo')) return 'var(--color-disc-histologia)'
  if (s.includes('bioq') || s.includes('celular') || s.includes('molecular') || s.includes('bioquim')) return 'var(--color-disc-bioquimica)'
  if (s.includes('fisio')) return 'var(--color-disc-fisiologia)'
  if (s.includes('imuno') || s.includes('pato')) return 'var(--color-disc-patologia)'
  if (s.includes('farmaco') || s.includes('farmaco')) return 'var(--color-disc-farmaco)'
  if (s.includes('clinic') || s.includes('medicina') || s.includes('biofis')) return 'var(--color-disc-clinica)'
  return 'var(--color-disc-histologia)'
}
function mapNivel(bp) {
  const n = String(bp.nivel || '').toUpperCase()
  if (n.includes('APROF')) return 'APROFUNDAMENTO'
  if (n.includes('EXPAN') || n === 'EXPAND') return 'EXPANSAO'
  return 'CORE'
}

// resumo_ids já existentes (conteúdo real — nunca sobrescrever)
function listarJson(dir) {
  const out = []
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) out.push(...listarJson(caminho))
    else if (nome.endsWith('.json') && nome !== 'manifesto.json') out.push(caminho)
  }
  return out
}
const existentes = new Set()
for (const c of listarJson(BLOCOS_DIR)) {
  try {
    const j = JSON.parse(readFileSync(c, 'utf8'))
    if (j.resumo_id) existentes.add(j.resumo_id)
  } catch {}
}

const mestre = JSON.parse(readFileSync(MESTRE, 'utf8'))
const blocos = mestre.blocos
const nomePorDisc = new Map(mestre.disciplinas.map((d) => [d.id, d.nome]))

// filhos por pai
const filhosDe = new Map()
for (const b of blocos) {
  if (b.no_pai_id) {
    if (!filhosDe.has(b.no_pai_id)) filhosDe.set(b.no_pai_id, [])
    filhosDe.get(b.no_pai_id).push(b.id)
  }
}

// abrev por disciplina (do id dos blocos: s{N}-{abrev}-...)
const abrevPorDisc = new Map()
for (const b of blocos) {
  if (!abrevPorDisc.has(b.disciplina_id)) abrevPorDisc.set(b.disciplina_id, b.id.split('-')[1])
}

let gerados = 0
let pulados = 0
const porDisc = {}
for (const b of blocos) {
  const nome = nomePorDisc.get(b.disciplina_id) || b.disciplina_id
  const abrev = b.id.split('-')[1]
  porDisc[b.disciplina_id] = porDisc[b.disciplina_id] || { gerados: 0, pulados: 0 }
  if (existentes.has(b.id)) {
    pulados++
    porDisc[b.disciplina_id].pulados++
    continue
  }
  const esqueleto = {
    resumo_id: b.id,
    no_pai_id: b.no_pai_id ?? null,
    nos_filhos_ids: filhosDe.get(b.id) ?? [],
    conexoes_laterais_ids: [],
    metadata: {
      titulo: b.titulo,
      semestre: Number(N),
      disciplina: nome,
      profundidade_arvore: b.profundidade ?? 1,
      importancia: 3,
      dificuldade: 2,
      tempo_leitura_minutos: 0,
      status: 'esqueleto',
      data_criacao: '2026-07-01',
      data_ultima_revisao: '2026-07-01',
      versao: '0.0',
      tags: [abrev, 'esqueleto'],
      nivel: mapNivel(b),
      tipo: 'conceito',
      // Internato: carrega a "pele"/formato e campos de EPA quando presentes no blueprint
      ...(b.tipo_bloco ? { formato_internato: b.tipo_bloco } : {}),
      ...(b.epa_codigo ? { epa_codigo: b.epa_codigo } : {}),
      ...(b.epa_nivel_alvo != null && b.epa_nivel_alvo !== '' ? { epa_nivel_alvo: Number(b.epa_nivel_alvo) } : {}),
    },
    resumo_conciso: b.escopo || '',
    narrativa: [],
    conexoes: { prerequisitos: [], futuras: [], laterais: [] },
    flashcards: [],
    casos_clinicos: [],
    midia: { imagens: [], videos: [], audios: [] },
    horizonte_validade: 'estavel',
    estado_ciclo_vida: 'rascunho',
    nivel_aceitacao: 'minimo_viavel',
    procedencia: {
      gerado_por: `mapa-blueprint-s${N}`,
      data_geracao: '2026-07-01',
      revisado_por: null,
      data_revisao: null,
      nivel_confianca: 'rascunho',
    },
    fontes: [],
    _lentes: b.lentes ?? [],
  }
  const destino = join(BLOCOS_DIR, abrev)
  mkdirSync(destino, { recursive: true })
  writeFileSync(join(destino, `${b.id}.json`), JSON.stringify(esqueleto, null, 2))
  gerados++
  porDisc[b.disciplina_id].gerados++
}

// deriva a estrutura de currículo (módulos → temas)
const ordemDisc = mestre.disciplinas.map((d) => d.id)
const disciplinasS = []
for (const did of ordemDisc) {
  const nome = nomePorDisc.get(did) || did
  const abrev = abrevPorDisc.get(did)
  const daDisc = blocos.filter((b) => b.disciplina_id === did)
  const modulos = new Map()
  for (const b of daDisc) {
    const mm = b.id.split('-')[2] || '00'
    if (!modulos.has(mm)) modulos.set(mm, [])
    modulos.get(mm).push(b)
  }
  const temas = []
  for (const mm of [...modulos.keys()].sort()) {
    const grupo = modulos.get(mm)
    const topo = grupo.slice().sort((a, b) => a.id.split('-').length - b.id.split('-').length || a.id.localeCompare(b.id))[0]
    temas.push({ id: `m${mm}`, titulo: topo.titulo, prefixo: `s${N}-${abrev}-${mm}`, descricao: topo.escopo || undefined })
  }
  disciplinasS.push({ id: did, titulo: nome, cor: corDe(did, nome), temas })
}

const tsOut = `// GERADO por scripts/gerar-esqueleto-semestre.mjs — não editar à mão.\n// Estrutura navegável do Semestre ${N} derivada do blueprint mestre.\nexport const DISCIPLINAS_S${N} = ${JSON.stringify(disciplinasS, null, 2)} as const\n`
writeFileSync(join(RAIZ, 'src', 'med', 'data', `curriculo-s${N}.ts`), tsOut)

console.log(`=== GERACAO DE ESQUELETOS S${N} ===`)
for (const did of ordemDisc) {
  const p = porDisc[did] || { gerados: 0, pulados: 0 }
  console.log(`  ${did}: ${p.gerados} gerados, ${p.pulados} pulados (conteudo real)`)
}
console.log(`\nTOTAL: ${gerados} esqueletos gerados, ${pulados} pulados`)
console.log(`Curriculo S${N}: ${disciplinasS.length} disciplinas, ${disciplinasS.reduce((s, d) => s + d.temas.length, 0)} temas`)
console.log(`curriculo-s${N}.ts escrito. Falta ligar em curriculo.ts (importar DISCIPLINAS_S${N} no semestre ${N}).`)
