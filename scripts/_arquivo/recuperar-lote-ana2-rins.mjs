// Recupera os 4 blocos de histologia funcional do néfron (Néfron, Corpúsculo Renal,
// Podócitos, Membrana Basal Glomerular) que estavam presos em arquivos-lote antigos,
// com IDs (s2-ana2-04-001..004) que não correspondem à árvore atual.
//
// Remapeia para novos slots sob "Rins" (s2-ana2-04-100), normaliza enums fora do
// padrão ANIMA e remove markdown ** literal do conteúdo.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')
const DIR = join(RAIZ, 'public', 'blocos', 'ana2')

const MAPA_ID = {
  's2-ana2-04-001': 's2-ana2-04-103',
  's2-ana2-04-002': 's2-ana2-04-104',
  's2-ana2-04-003': 's2-ana2-04-105',
  's2-ana2-04-004': 's2-ana2-04-106',
}
const NOVO_PAI = 's2-ana2-04-100' // "Rins — Visão Geral"
const DISCIPLINA_CANONICA = 'Anatomia II — Vísceras, Pelve e Neuroanatomia'

const MAPA_FLASHCARD_TIPO = {
  por_que_estrategia: 'por_que', por_que: 'por_que',
  mecanismo_clinico: 'clinico', clinico_mecanismo: 'clinico', clinico: 'clinico',
  conceitual: 'mecanismo', 'conceitual-nuance': 'comparacao',
  trajeto_anatomico: 'mecanismo', anatomia_funcional: 'mecanismo', anatomia: 'mecanismo',
  histoquimica: 'mecanismo', biologia_desenvolvimento: 'mecanismo', genetico: 'mecanismo',
  'sintese_niveis-organizacao': 'sintese_transdisciplinar', 'sintese_genetica-estrutura': 'sintese_transdisciplinar',
  genetica_transdisciplinar: 'sintese_transdisciplinar', sintese_transdisciplinar: 'sintese_transdisciplinar',
  armadilha_conceitual: 'armadilha', armadilha: 'armadilha',
  contrafactual: 'contrafactual', comparacao: 'comparacao', mecanismo: 'mecanismo', etimologia: 'etimologia',
}
const MAPA_FUTURA_TIPO = {
  MECANISMO_FISIOLOGIA: 'MECANISMO_COMPARTILHADO', MECANISMO_COMPARTILHADO: 'MECANISMO_COMPARTILHADO',
  CASCATA_PATOLOGIA: 'CASCATA_CAUSAL', CASCATA_CAUSAL: 'CASCATA_CAUSAL',
  ALVO_FARMACO: 'ALVO_TERAPEUTICO', ALVO_GENETICA: 'ALVO_TERAPEUTICO', ALVO_TERAPEUTICO: 'ALVO_TERAPEUTICO',
  MARCADOR_DIAGNOSTICO: 'RECONHECIMENTO_CLINICO', RECONHECIMENTO_CLINICO: 'RECONHECIMENTO_CLINICO',
}
const MAPA_LATERAL_TIPO = {
  CONTRASTE_E_REPLICACAO: 'CONTRASTE', CONTRASTE: 'CONTRASTE', ANALOGIA: 'ANALOGIA', EXEMPLO_PARALELO: 'EXEMPLO_PARALELO',
}

// remove markdown bold literal (**texto** -> texto) recursivamente em qualquer string do objeto
function limparMarkdown(v) {
  if (typeof v === 'string') return v.replace(/\*\*(.+?)\*\*/g, '$1')
  if (Array.isArray(v)) return v.map(limparMarkdown)
  if (v && typeof v === 'object') {
    const o = {}
    for (const k of Object.keys(v)) o[k] = limparMarkdown(v[k])
    return o
  }
  return v
}

function remapearReferenciasInternas(v) {
  if (typeof v === 'string') return MAPA_ID[v] || v
  if (Array.isArray(v)) return v.map(remapearReferenciasInternas)
  if (v && typeof v === 'object') {
    const o = {}
    for (const k of Object.keys(v)) o[k] = remapearReferenciasInternas(v[k])
    return o
  }
  return v
}

function normalizarBloco(bruto) {
  let b = JSON.parse(JSON.stringify(bruto))
  const idAntigo = b.resumo_id
  b = limparMarkdown(b)
  b = remapearReferenciasInternas(b) // troca qualquer "s2-ana2-04-00X" citado dentro do bloco pelo novo ID
  b.resumo_id = MAPA_ID[idAntigo]
  b.no_pai_id = NOVO_PAI
  b.nos_filhos_ids = b.nos_filhos_ids || []
  b.conexoes_laterais_ids = b.conexoes_laterais_ids || []
  b.metadata = b.metadata || {}
  b.metadata.disciplina = DISCIPLINA_CANONICA
  b.metadata.status = 'completo'
  b.casos_clinicos = b.casos_clinicos || []

  for (const fc of b.flashcards || []) {
    if (fc.tipo && MAPA_FLASHCARD_TIPO[fc.tipo]) fc.tipo = MAPA_FLASHCARD_TIPO[fc.tipo]
    else if (fc.tipo) fc.tipo = 'mecanismo' // fallback seguro para qualquer valor não mapeado
  }
  for (const f of b.conexoes?.futuras || []) {
    if (f.tipo && MAPA_FUTURA_TIPO[f.tipo]) f.tipo = MAPA_FUTURA_TIPO[f.tipo]
    else if (f.tipo) f.tipo = 'MECANISMO_COMPARTILHADO'
  }
  for (const l of b.conexoes?.laterais || []) {
    if (l.tipo_relacao && MAPA_LATERAL_TIPO[l.tipo_relacao]) l.tipo_relacao = MAPA_LATERAL_TIPO[l.tipo_relacao]
    else if (l.tipo_relacao) l.tipo_relacao = 'EXEMPLO_PARALELO'
  }
  return b
}

const lote1 = JSON.parse(readFileSync(join(DIR, 's2-ana2-04-lote2-blocos.json'), 'utf8'))
const lote2 = JSON.parse(readFileSync(join(DIR, 's2-ana2-04-004-035-lote2.json'), 'utf8'))
const todos = [...lote1, ...lote2]

const gravados = []
for (const bruto of todos) {
  if (!MAPA_ID[bruto.resumo_id]) { console.log('pulado (sem mapeamento):', bruto.resumo_id); continue }
  const norm = normalizarBloco(bruto)
  const destino = join(DIR, `${norm.resumo_id}.json`)
  writeFileSync(destino, JSON.stringify(norm, null, 2), 'utf8')
  gravados.push(norm.resumo_id)
  console.log(`✓ ${bruto.resumo_id} -> ${norm.resumo_id} (${destino})`)
}

// atualiza o pai "Rins" para incluir os 4 novos filhos
const paiPath = join(DIR, `${NOVO_PAI}.json`)
const pai = JSON.parse(readFileSync(paiPath, 'utf8').replace(/^﻿/, ''))
const novosFilhos = Object.values(MAPA_ID)
pai.nos_filhos_ids = [...new Set([...(pai.nos_filhos_ids || []), ...novosFilhos])]
writeFileSync(paiPath, JSON.stringify(pai, null, 2), 'utf8')
console.log(`\nPai ${NOVO_PAI} atualizado. nos_filhos_ids:`, JSON.stringify(pai.nos_filhos_ids))

console.log(`\n${gravados.length} blocos gravados: ${gravados.join(', ')}`)
console.log('\nPróximo: apagar os 2 arquivos-lote originais, rodar manifesto + verificar-curriculo.')
