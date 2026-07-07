// ANIMA — Vincula blocos às IMAGENS-ÂNCORA curadas (Wikimedia, verificadas visualmente).
// Casa o TÍTULO do bloco com o conceito-âncora. Só injeta quando há UMA âncora clara.
// Padrão: DRY-RUN (só relatório). Use --commit para gravar de fato.
//
// Uso: node scripts/vincular-ancoras.mjs --disciplina biologia-celular [--commit]

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const args = process.argv.slice(2)
const A = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d }
const DISC = A('disciplina', 'biologia-celular')
const COMMIT = args.includes('--commit')

const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
function lerJSON(p) { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')) }

// ALLOWLIST — só âncoras VERIFICADAS VISUALMENTE por Claude entram aqui.
// regex casa no título normalizado (sem acento); anti evita falso-positivo.
const ANCORAS_OK = [
  { conceito: 'celula-animal', arquivo: 'celula-animal.png', regex: /\b(celula animal|celula eucariotica|celula eucarionte|eucarioto)\b/, titulo: 'Animal cell structure pt.svg', licenca: 'Public domain', autor: 'LadyofHats (Mariana Ruiz)', url: 'https://commons.wikimedia.org/wiki/File:Animal_cell_structure_pt.svg' },
  { conceito: 'celula-vegetal', arquivo: 'celula-vegetal.png', regex: /\b(celula vegetal|parede celular|cloroplasto)\b/, titulo: 'Plant cell structure pt.svg', licenca: 'CC0', autor: 'LadyofHats (Mariana Ruiz)', url: 'https://commons.wikimedia.org/wiki/File:Plant_cell_structure_pt.svg' },
  { conceito: 'celula-procarionte', arquivo: 'celula-procarionte.png', regex: /\b(procarion|procariot|celula bacteriana|bacteria)\b/, titulo: 'Prokaryote cell diagram pt.svg', licenca: 'Public domain', autor: 'LadyofHats (Mariana Ruiz)', url: 'https://commons.wikimedia.org/wiki/File:Prokaryote_cell_diagram_pt.svg' },
  { conceito: 'membrana-plasmatica', arquivo: 'membrana-plasmatica.png', regex: /\b(membrana plasmatica|membrana celular|bicamada|fosfolipid)\b/, titulo: 'Cell membrane detailed diagram pt.svg', licenca: 'Public domain', autor: 'LadyofHats (Mariana Ruiz)', url: 'https://commons.wikimedia.org/wiki/File:Cell_membrane_detailed_diagram_pt.svg' },
]

function acharAncora(titulo) {
  const t = norm(titulo)
  const hits = ANCORAS_OK.filter(a => a.regex.test(t))
  return hits.length === 1 ? hits[0] : null   // só injeta se UMA âncora casa (sem ambiguidade)
}

const dir = join(RAIZ, 'public', 'blocos', DISC)
const files = readdirSync(dir).filter(f => f.endsWith('.json'))
const rel = { casados: [], ambiguos: [], sem_match: [], sem_imagem: [] }

for (const f of files) {
  const p = join(dir, f)
  let d; try { d = lerJSON(p) } catch { continue }
  const idxImg = (d.narrativa || []).findIndex(x => x && x.tipo === 'imagem')
  const titulo = d.metadata?.titulo || d.titulo || ''
  if (idxImg < 0) { rel.sem_imagem.push(d.resumo_id); continue }
  const img = d.narrativa[idxImg]
  if (img.origem === 'real' && img.arquivo) continue   // já tem imagem real
  const t = norm(titulo)
  const hits = ANCORAS_OK.filter(a => a.regex.test(t))
  if (hits.length > 1) { rel.ambiguos.push({ id: d.resumo_id, titulo, conceitos: hits.map(h => h.conceito) }); continue }
  if (hits.length === 0) { rel.sem_match.push({ id: d.resumo_id, titulo }); continue }
  const a = hits[0]
  rel.casados.push({ id: d.resumo_id, titulo, conceito: a.conceito, arquivo: a.arquivo })
  if (COMMIT) {
    d.narrativa[idxImg] = {
      ...img, origem: 'real',
      arquivo: `/img/_ancoras/${a.arquivo}`,
      fonte: 'Wikimedia Commons', licenca: a.licenca, autor: a.autor, url_fonte: a.url,
      prompt_ia: img.prompt_ia,   // mantém como fallback p/ geração por IA
    }
    writeFileSync(p, JSON.stringify(d, null, 2), 'utf8')
  }
}

writeFileSync(join(RAIZ, 'producao', `vinculo-ancoras-${DISC}.json`), JSON.stringify(rel, null, 2), 'utf8')
console.log(`\n=== ${DISC} ${COMMIT ? '(COMMIT)' : '(DRY-RUN — nada gravado)'} ===`)
console.log(`Casados (1 âncora clara): ${rel.casados.length}`)
for (const c of rel.casados) console.log(`  ✓ ${c.id} — ${c.titulo}  ->  ${c.conceito}`)
console.log(`Ambíguos (>1 âncora, pulados): ${rel.ambiguos.length}`)
for (const c of rel.ambiguos) console.log(`  ? ${c.id} — ${c.titulo}  [${c.conceitos.join(', ')}]`)
console.log(`Sem match de âncora: ${rel.sem_match.length} | Sem elemento imagem: ${rel.sem_imagem.length}`)
console.log(`\nRelatório: producao/vinculo-ancoras-${DISC}.json`)
if (!COMMIT) console.log('Para gravar: adicione --commit')
