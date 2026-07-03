// Gera blocos-esqueleto do Semestre 1 a partir do blueprint mestre + deriva a
// estrutura de currículo navegável. NÃO sobrescreve blocos de conteúdo já
// existentes (checa resumo_id). Rode: node scripts/gerar-esqueleto-s1.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = 'C:\\Users\\vegag\\.claude\\anima\\med'
const BLOCOS_DIR = join(RAIZ, 'public', 'blocos')
const MESTRE = join(RAIZ, 'blueprint', '_MESTRE-s1.json')

const DISC_META = {
  biocel: { pasta: 'biologia-celular', id: 'biologia-celular', titulo: 'Biologia Celular e Molecular', cor: 'var(--color-disc-bioquimica)', disc: 'biologia celular' },
  hist1: { pasta: 'histologia', id: 'histologia', titulo: 'Histologia Básica I', cor: 'var(--color-disc-histologia)', disc: 'histologia' },
  embr: { pasta: 'embriologia', id: 'embriologia', titulo: 'Embriologia', cor: 'var(--color-disc-histologia)', disc: 'embriologia' },
  ana1: { pasta: 'anatomia', id: 'anatomia', titulo: 'Anatomia I — Locomotor, Cabeça e Pescoço', cor: 'var(--color-disc-anatomia)', disc: 'anatomia' },
  biol: { pasta: 'biologia', id: 'biologia', titulo: 'Biologia (bases gerais)', cor: 'var(--color-disc-fisiologia)', disc: 'biologia' },
  'hist-med': { pasta: 'historia-medicina', id: 'historia-medicina', titulo: 'História da Medicina', cor: 'var(--color-disc-clinica)', disc: 'história da medicina' },
}
const ORDEM_DISC = ['biocel', 'hist1', 'embr', 'ana1', 'biol', 'hist-med']

// ── 1. resumo_ids já existentes (conteúdo real — não sobrescrever) ──
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

// ── 2. carrega o mestre ──
const mestre = JSON.parse(readFileSync(MESTRE, 'utf8'))
const blocos = mestre.blocos

// filhos por pai
const filhosDe = new Map()
for (const b of blocos) {
  if (b.no_pai_id) {
    if (!filhosDe.has(b.no_pai_id)) filhosDe.set(b.no_pai_id, [])
    filhosDe.get(b.no_pai_id).push(b.id)
  }
}

function mapNivel(bp) {
  const n = String(bp.nivel || '').toUpperCase()
  if (n.includes('APROF')) return 'APROFUNDAMENTO'
  if (n.includes('EXPAN') || n === 'EXPAND') return 'EXPANSAO'
  return 'CORE'
}

// ── 3. gera esqueletos ──
let gerados = 0
let pulados = 0
const porDisc = {}
for (const b of blocos) {
  const meta = DISC_META[b.disciplina_id]
  if (!meta) continue
  porDisc[b.disciplina_id] = porDisc[b.disciplina_id] || { gerados: 0, pulados: 0 }
  if (existentes.has(b.id)) {
    pulados++
    porDisc[b.disciplina_id].pulados++
    continue
  }
  const abrev = b.id.split('-')[1]
  const esqueleto = {
    resumo_id: b.id,
    no_pai_id: b.no_pai_id ?? null,
    nos_filhos_ids: filhosDe.get(b.id) ?? [],
    conexoes_laterais_ids: [],
    metadata: {
      titulo: b.titulo,
      semestre: 1,
      disciplina: meta.disc,
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
      gerado_por: 'mapa-blueprint-s1',
      data_geracao: '2026-07-01',
      revisado_por: null,
      data_revisao: null,
      nivel_confianca: 'rascunho',
    },
    fontes: [],
    _lentes: b.lentes ?? [],
  }
  const destino = join(BLOCOS_DIR, meta.pasta)
  mkdirSync(destino, { recursive: true })
  writeFileSync(join(destino, `${b.id}.json`), JSON.stringify(esqueleto, null, 2))
  gerados++
  porDisc[b.disciplina_id].gerados++
}

// ── 4. deriva a estrutura de currículo (módulos → temas) ──
const disciplinasS1 = []
for (const did of ORDEM_DISC) {
  const meta = DISC_META[did]
  const daDisc = blocos.filter((b) => b.disciplina_id === did)
  // agrupa por código de módulo (segmento MM do id)
  const modulos = new Map()
  for (const b of daDisc) {
    const parts = b.id.split('-')
    const mm = parts[2] || '00'
    if (!modulos.has(mm)) modulos.set(mm, [])
    modulos.get(mm).push(b)
  }
  const temas = []
  for (const mm of [...modulos.keys()].sort()) {
    const grupo = modulos.get(mm)
    // título do módulo: bloco com id mais curto (topo do módulo)
    const topo = grupo.slice().sort((a, b) => a.id.split('-').length - b.id.split('-').length || a.id.localeCompare(b.id))[0]
    const abrev = topo.id.split('-')[1]
    temas.push({
      id: `m${mm}`,
      titulo: topo.titulo,
      prefixo: `s1-${abrev}-${mm}`,
      descricao: topo.escopo || undefined,
    })
  }
  disciplinasS1.push({ id: meta.id, titulo: meta.titulo, cor: meta.cor, temas })
}

const tsOut = `// GERADO por scripts/gerar-esqueleto-s1.mjs — não editar à mão.\n// Estrutura navegável do Semestre 1 derivada do blueprint mestre.\nexport const DISCIPLINAS_S1 = ${JSON.stringify(disciplinasS1, null, 2)} as const\n`
writeFileSync(join(RAIZ, 'src', 'med', 'data', 'curriculo-s1.ts'), tsOut)

console.log('=== GERACAO DE ESQUELETOS S1 ===')
for (const did of ORDEM_DISC) {
  const p = porDisc[did] || { gerados: 0, pulados: 0 }
  console.log(`  ${did}: ${p.gerados} gerados, ${p.pulados} pulados (conteudo real)`)
}
console.log(`\nTOTAL: ${gerados} esqueletos gerados, ${pulados} pulados`)
console.log(`Curriculo S1: ${disciplinasS1.length} disciplinas, ${disciplinasS1.reduce((s, d) => s + d.temas.length, 0)} temas`)
console.log('curriculo-s1.ts escrito.')
