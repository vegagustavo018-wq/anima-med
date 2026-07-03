// Recupera blocos ESCRITOS por agentes de um workflow cujo passo de correção
// falhou (ex.: limite de sessão). Varre os transcripts (agent-*.jsonl), acha os
// campos `bloco_json` produzidos, e monta um staging { blocos:[{id, bloco_json}] }
// consumível por integrar-blocos-produzidos.mjs.
//
// Uso: node scripts/recuperar-blocos-transcript.mjs <dir-transcripts> <id1,id2,...>

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
const alvos = new Set((process.argv[3] || '').split(',').filter(Boolean))
if (!dir || alvos.size === 0) {
  console.error('Uso: node scripts/recuperar-blocos-transcript.mjs <dir> <id1,id2,...>')
  process.exit(1)
}

// procura recursivamente por qualquer string chamada "bloco_json" num objeto
function acharBlocoJson(node, saida) {
  if (node == null) return
  if (Array.isArray(node)) {
    for (const x of node) acharBlocoJson(x, saida)
    return
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'bloco_json' && typeof v === 'string' && v.length > 500) saida.push(v)
      else acharBlocoJson(v, saida)
    }
  }
}

const candidatos = new Map() // resumo_id -> melhor bloco_json (o maior)

for (const f of readdirSync(dir).filter((x) => x.endsWith('.jsonl'))) {
  let linhas
  try {
    linhas = readFileSync(join(dir, f), 'utf8').split('\n').filter(Boolean)
  } catch {
    continue
  }
  for (const linha of linhas) {
    let ev
    try {
      ev = JSON.parse(linha)
    } catch {
      continue
    }
    const achados = []
    acharBlocoJson(ev, achados)
    for (const raw of achados) {
      let s = raw.trim()
      if (s.startsWith('```')) s = s.replace(/^```(json)?/i, '').replace(/```$/, '').trim()
      let obj
      try {
        obj = JSON.parse(s)
      } catch {
        continue
      }
      const id = obj?.resumo_id
      if (!id || !alvos.has(id)) continue
      const anterior = candidatos.get(id)
      if (!anterior || s.length > anterior.length) candidatos.set(id, s)
    }
  }
}

const blocos = [...candidatos.entries()].map(([id, bloco_json]) => ({ id, bloco_json }))
const faltando = [...alvos].filter((id) => !candidatos.has(id))

const out = join(dir, '_recuperados.json')
writeFileSync(out, JSON.stringify({ blocos }, null, 1))
console.log(`Recuperados ${blocos.length}/${alvos.size}: ${blocos.map((b) => b.id).join(', ')}`)
if (faltando.length) console.log(`FALTANDO: ${faltando.join(', ')}`)
console.log(`Staging: ${out}`)
