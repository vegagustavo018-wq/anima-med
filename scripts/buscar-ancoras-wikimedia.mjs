// ANIMA — Busca candidatas do Wikimedia Commons para os CONCEITOS-ÂNCORA.
// Baixa a melhor candidata (licença aberta + título relevante) de cada conceito
// para public/img/_ancoras/, para verificação VISUAL humana/Claude antes de curar.
//
// Uso: node scripts/buscar-ancoras-wikimedia.mjs

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')
const OUT = join(RAIZ, 'public', 'img', '_ancoras')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const LIC_OK = /^(cc0|cc-by(-sa)?|public domain|pd|no restrictions)/i
const sleep = ms => new Promise(r => setTimeout(r, ms))

// conceitos-âncora: chave PT, query, palavras que o título DEVE conter (qualquer idioma)
const ANCORAS = [
  { k: 'celula-animal', q: 'animal cell structure diagram', kw: ['animal', 'cell', 'celula', 'célula'] },
  { k: 'celula-vegetal', q: 'plant cell structure diagram', kw: ['plant', 'cell', 'vegetal', 'celula'] },
  { k: 'celula-procarionte', q: 'prokaryote cell diagram', kw: ['prokary', 'procari'] },
  { k: 'mitocondria', q: 'mitochondrion diagram', kw: ['mitochond', 'mitocond'] },
  { k: 'membrana-plasmatica', q: 'cell membrane detailed diagram', kw: ['cell membrane', 'plasma membrane', 'membrana'] },
  { k: 'bicamada-fosfolipidica', q: 'lipid bilayer', kw: ['bilayer', 'bicamada'] },
  { k: 'nucleo-celular', q: 'cell nucleus diagram', kw: ['nucleus', 'nucleo', 'núcleo'] },
  { k: 'dna', q: 'DNA structure double helix diagram', kw: ['dna', 'adn'] },
  { k: 'ribossomo', q: 'ribosome structure subunits diagram', kw: ['ribosom', 'ribossom'] },
  { k: 'reticulo-endoplasmatico', q: 'endoplasmic reticulum', kw: ['endoplasmic reticulum', 'reticulo', 'retículo'] },
  { k: 'complexo-golgi', q: 'Golgi apparatus diagram', kw: ['golgi'] },
  { k: 'lisossomo', q: 'lysosome cell', kw: ['lysosom', 'lisossom', 'lisosom'] },
  { k: 'cromossomo', q: 'chromosome diagram', kw: ['chromosom', 'cromossom', 'cromosom'] },
  { k: 'neuronio', q: 'neuron diagram', kw: ['neuron', 'neuronio', 'neurônio'] },
  { k: 'mitose', q: 'mitosis stages', kw: ['mitosis', 'mitose'] },
]

// pontua a candidata: prefere PT > em branco (nós rotulamos) > EN; penaliza outros idiomas
const OUTRAS_LINGUAS = /(?:^|[ _\-])(tr|fr|de|es|ru|ja|zh|ar|it|nl|pl|ca|cs|fi|hu|ko|uk|vi|id|fa|he|sv|da|no|ro|el|th|hi|bn)(?:[ _\-.]|\.svg)/i
function pontuar(titulo) {
  const t = titulo.toLowerCase()
  let s = 0
  if (/(?:^|[ _\-])(pt|pt-br|português|portugues)(?:[ _\-.]|\.svg)/i.test(t)) s += 5      // PT pronto
  if (/(blank|unlabelled|unlabeled|no[ _\-]?text|sem[ _\-]?texto|sin[ _\-]?texto|numbered)/i.test(t)) s += 4 // em branco → nós rotulamos
  if (/(?:^|[ _\-])(en|english)(?:[ _\-.]|\.svg)/i.test(t)) s += 2                          // EN aceitável
  if (OUTRAS_LINGUAS.test(t)) s -= 4                                                        // idioma errado
  if (/\.svg/i.test(t)) s += 1                                                              // vetorial escala melhor
  return s
}

async function buscar(q, tentativa = 0) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=25&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1000&origin=*`
  const r = await fetch(url, { headers: { 'User-Agent': 'ANIMA-Med-Study/1.0 (educational)' } })
  if (!r.ok) return []
  const d = await r.json()
  const pages = d?.query?.pages ? Object.values(d.query.pages) : []
  // throttle do Commons devolve vazio -> espera e tenta de novo
  if (pages.length === 0 && tentativa < 3) { await sleep(5000 * (tentativa + 1)); return buscar(q, tentativa + 1) }
  return pages.map(p => {
    const ii = p.imageinfo?.[0]; if (!ii) return null
    const em = ii.extmetadata || {}
    return {
      titulo: p.title, mime: ii.mime,
      licenca: (em.LicenseShortName?.value || '').replace(/<[^>]+>/g, ''),
      autor: (em.Artist?.value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 70),
      url: ii.url, thumb: ii.thumburl, w: ii.width, h: ii.height,
    }
  }).filter(Boolean)
}

async function baixar(url, dest) {
  const r = await fetch(url, { headers: { 'User-Agent': 'ANIMA-Med-Study/1.0 (educational)' } })
  if (!r.ok) return false
  const buf = Buffer.from(await r.arrayBuffer())
  writeFileSync(dest, buf); return true
}

const curadoria = []
for (const a of ANCORAS) {
  process.stdout.write(`${a.k} ... `)
  let cands = []
  try { cands = await buscar(a.q) } catch (e) { console.log('erro: ' + e.message.slice(0, 30)); continue }
  const boas = cands.filter(c => LIC_OK.test(c.licenca) && c.w >= 400 &&
    a.kw.some(k => c.titulo.toLowerCase().includes(k)) &&
    /image\/(png|jpeg|svg)/.test(c.mime))
    .map(c => ({ ...c, score: pontuar(c.titulo) }))
    .sort((x, y) => y.score - x.score)
  const esc = boas[0]
  if (!esc) { console.log(`0 relevantes (de ${cands.length})`); curadoria.push({ ...a, ok: false }); continue }
  const ext = esc.thumb.split('.').pop().split('?')[0].slice(0, 4)
  const dest = join(OUT, `${a.k}.${ext}`)
  const baixou = await baixar(esc.thumb, dest)
  console.log(`OK (score ${esc.score}): ${esc.titulo} [${esc.licenca}] ${esc.w}x${esc.h} ${baixou ? '(baixada)' : '(falha)'}`)
  curadoria.push({ conceito: a.k, arquivo_local: `public/img/_ancoras/${a.k}.${ext}`, titulo: esc.titulo, licenca: esc.licenca, autor: esc.autor, url_original: esc.url, w: esc.w, h: esc.h, score: esc.score, verificado: false,
    alternativas: boas.slice(1, 4).map(c => ({ titulo: c.titulo, licenca: c.licenca, score: c.score })) })
  await sleep(2500)
}
writeFileSync(join(RAIZ, 'producao', 'curadoria-ancoras.json'), JSON.stringify(curadoria, null, 2), 'utf8')
console.log(`\n${curadoria.filter(c => c.titulo).length}/${ANCORAS.length} âncoras com candidata baixada em public/img/_ancoras/`)
console.log('Próximo: Claude VÊ cada imagem e marca verificado=true/false.')
