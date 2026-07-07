// One-off: conserta a árvore do tecido epitelial (ponteiros pai/filho) e limpa
// o campo morto metricas_estudo. Deixa o fluxograma como uma árvore única e limpa.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'public/blocos/histologia'

function paiDe(id) {
  if (id === 's1-hist-02-001') return null // raiz do tema
  if (id === 's1-hist-02-002' || id === 's1-hist-02-003') return 's1-hist-02-001'
  if (/^s1-hist-02-002-\d+$/.test(id)) return 's1-hist-02-002'
  if (/^s1-hist-02-003-\d+$/.test(id)) return 's1-hist-02-003'
  return null
}

const arquivos = readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'manifesto.json')
const blocos = arquivos.map((f) => ({ f, json: JSON.parse(readFileSync(join(DIR, f), 'utf8')) }))

// 1. corrige pais
for (const { json } of blocos) {
  json.no_pai_id = paiDe(json.resumo_id)
  delete json.metricas_estudo // campo morto do schema antigo
}

// 2. recalcula filhos a partir dos pais
const filhosDe = {}
for (const { json } of blocos) {
  const p = json.no_pai_id
  if (p) (filhosDe[p] ??= []).push(json.resumo_id)
}
for (const { json } of blocos) {
  json.nos_filhos_ids = (filhosDe[json.resumo_id] ?? []).sort()
}

// 3. grava
for (const { f, json } of blocos) {
  writeFileSync(join(DIR, f), JSON.stringify(json, null, 2) + '\n')
}
console.log(`[consertar-arvore] ${blocos.length} blocos corrigidos`)
