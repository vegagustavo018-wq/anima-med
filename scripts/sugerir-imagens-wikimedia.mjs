// ANIMA — Sugere imagens REAIS do Wikimedia Commons para blocos produzidos.
// REVISÃO-PRIMEIRO: não modifica blocos; gera um relatório de candidatas (com licença + link)
// para conferência humana. Depois, um segundo script commita as aprovadas.
//
// Uso: node scripts/sugerir-imagens-wikimedia.mjs --disciplina biologia-celular --limite 8

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const args = process.argv.slice(2)
const A = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d }
const DISC = A('disciplina', 'biologia-celular')
const LIM = parseInt(A('limite', '10'), 10)

// licenças aceitáveis para app distribuível (evita NC e ND)
const LIC_OK = /^(cc0|cc-by(-sa)?( \d)?|public domain|pd|no restrictions)/i
const sleep = ms => new Promise(r => setTimeout(r, ms))

function lerJSON(p) { return JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, '')) }

// termo de busca em INGLÊS extraído do prompt_ia (que já é em inglês)
function termoBusca(d) {
  const narr = d.narrativa || []
  const img = narr.find(x => x && x.tipo === 'imagem')
  const pi = (img?.prompt_ia || '').toString()
  // extrai o sujeito em inglês após "of a/an/the", "showing", "depicting", "diagram of"
  const m = pi.match(/\b(?:diagram of|illustration of|of an?|of the|showing|depicting)\s+(?:a |an |the )?([a-z][a-z\s\-]{3,40}?)(?:[.,;:]|\bwith\b|\bshould\b|\bin a\b|\bviewed\b|$)/i)
  let termo = m ? m[1] : ''
  if (!termo) termo = (d.metadata?.titulo || '').replace(/[^\p{L}\s]/gu, ' ')
  // remove palavras de estilo genéricas
  const stop = /^(generalized|generic|simple|clear|clean|detailed|typical|single|basic|central|aesthetically|pleasing)$/i
  return termo.trim().split(/\s+/).filter(w => w.length > 2 && !stop.test(w)).slice(0, 4).join(' ')
}

// palavras-chave para checar relevância do resultado
function relevante(tituloArquivo, termo) {
  const kws = termo.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const t = tituloArquivo.toLowerCase()
  return kws.some(k => t.includes(k))
}

async function buscarCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent(query)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800&origin=*`
  const r = await fetch(url, { headers: { 'User-Agent': 'ANIMA-Med-Study/1.0 (educational)' } })
  if (!r.ok) return []
  const d = await r.json()
  const pages = d?.query?.pages ? Object.values(d.query.pages) : []
  return pages.map(p => {
    const ii = p.imageinfo?.[0]; if (!ii) return null
    const em = ii.extmetadata || {}
    return {
      titulo: p.title,
      licenca: (em.LicenseShortName?.value || em.License?.value || '').replace(/<[^>]+>/g, ''),
      autor: (em.Artist?.value || '').replace(/<[^>]+>/g, '').slice(0, 80),
      url: ii.url,
      thumb: ii.thumburl,
      w: ii.width, h: ii.height,
      descr: (em.ImageDescription?.value || '').replace(/<[^>]+>/g, '').slice(0, 100),
    }
  }).filter(Boolean)
}

const dir = join(RAIZ, 'public', 'blocos', DISC)
const blocos = readdirSync(dir).filter(f => f.endsWith('.json'))
  .map(f => join(dir, f))
  .filter(p => { try { const d = lerJSON(p); return Array.isArray(d.narrativa) && d.narrativa.length > 0 } catch { return false } })
  .slice(0, LIM)

const relatorio = []
for (const p of blocos) {
  const d = lerJSON(p)
  const q = termoBusca(d)
  process.stdout.write(`Buscando: ${d.resumo_id} ("${q}") ... `)
  let cands = []
  try { cands = await buscarCommons(q) } catch (e) { console.log('erro: ' + e.message.slice(0, 40)) }
  const boas = cands.filter(c => LIC_OK.test(c.licenca) && c.w >= 400 && relevante(c.titulo, q))
  const escolha = boas[0]
  console.log(escolha ? `${boas.length} candidatas OK (melhor: ${escolha.licenca})` : `${cands.length} achadas, 0 com licença aberta`)
  relatorio.push({
    id: d.resumo_id, titulo: d.metadata?.titulo, query: q,
    sugestao: escolha ? { titulo: escolha.titulo, licenca: escolha.licenca, autor: escolha.autor, w: escolha.w, h: escolha.h, thumb: escolha.thumb, url: escolha.url } : null,
    alternativas: boas.slice(1, 3).map(c => ({ titulo: c.titulo, licenca: c.licenca })),
  })
  await sleep(600)
}

const out = join(RAIZ, 'producao', `sugestoes-imagens-${DISC}.json`)
writeFileSync(out, JSON.stringify(relatorio, null, 2), 'utf8')
const comSugestao = relatorio.filter(r => r.sugestao).length
console.log(`\n=== ${comSugestao}/${relatorio.length} blocos com sugestão de imagem aberta ===`)
console.log(`Relatório salvo em: producao/sugestoes-imagens-${DISC}.json`)
for (const r of relatorio) {
  console.log(`\n${r.id} — ${r.titulo}`)
  if (r.sugestao) console.log(`  -> ${r.sugestao.titulo} [${r.sugestao.licenca}] ${r.sugestao.w}x${r.sugestao.h}\n     ${r.sugestao.thumb}`)
  else console.log(`  -> (nenhuma imagem aberta encontrada)`)
}
