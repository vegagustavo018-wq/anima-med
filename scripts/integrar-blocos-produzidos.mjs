// Integra blocos produzidos por um workflow de conteúdo no acervo, com segurança.
//
// Uso: node scripts/integrar-blocos-produzidos.mjs <caminho-do-output-do-workflow.json>
//
// O arquivo de output do workflow tem a forma { result: { blocos: [{ id, arquivo,
// bloco_json, aprovado, problemas }] } } (bloco_json é uma STRING JSON do bloco).
//
// Garantias (por que este script existe):
//  - FORÇA os campos estruturais a partir do ESQUELETO em disco (resumo_id,
//    no_pai_id, nos_filhos_ids, conexoes_laterais_ids, metadata.disciplina/semestre)
//    → a árvore do currículo nunca é corrompida, aconteça o que acontecer no agente.
//  - VALIDA forma mínima antes de gravar (narrativa não-vazia, flashcards, etc.);
//    bloco malformado é PULADO e reportado, nunca grava lixo.
//  - NUNCA toca progresso/progressoQuestao (só escreve public/blocos/**). Conteúdo
//    é regenerável; progresso é sagrado.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(__dirname, '..')

const outputPath = process.argv[2]
if (!outputPath) {
  console.error('Uso: node scripts/integrar-blocos-produzidos.mjs <output-do-workflow.json>')
  process.exit(1)
}

const CAMPOS_ESTRUTURAIS = ['resumo_id', 'no_pai_id', 'nos_filhos_ids', 'conexoes_laterais_ids']

function parseBloco(raw) {
  if (raw == null) return null
  if (typeof raw === 'object') return raw
  let s = String(raw).trim()
  // tolera cercas de código eventuais
  if (s.startsWith('```')) s = s.replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

function validarForma(b) {
  const erros = []
  if (!b || typeof b !== 'object') return ['não é objeto']
  if (!Array.isArray(b.narrativa) || b.narrativa.length === 0) erros.push('narrativa vazia')
  if (!Array.isArray(b.flashcards) || b.flashcards.length < 3) erros.push('flashcards < 3')
  if (!b.metadata || typeof b.metadata !== 'object') erros.push('sem metadata')
  if (!b.resumo_conciso) erros.push('sem resumo_conciso')
  if (!b.conexoes || typeof b.conexoes !== 'object') erros.push('sem conexoes')
  return erros
}

function acharArquivoEsqueleto(entrada, produzido) {
  if (entrada.arquivo && existsSync(entrada.arquivo)) return entrada.arquivo
  // tenta por id/resumo_id em public/blocos/histologia (extensível a outras discs)
  const id = entrada.id || produzido?.resumo_id
  if (!id) return null
  const disc = (produzido?.metadata?.disciplina) || 'histologia'
  const candidato = join(RAIZ, 'public', 'blocos', disc, `${id}.json`)
  return existsSync(candidato) ? candidato : null
}

const doc = JSON.parse(readFileSync(resolve(outputPath), 'utf8'))
const blocos = doc?.result?.blocos ?? doc?.blocos ?? []
if (!Array.isArray(blocos) || blocos.length === 0) {
  console.error('Nenhum bloco encontrado no output (esperado result.blocos[]).')
  process.exit(1)
}

let gravados = 0
const pulados = []

for (const entrada of blocos) {
  const produzido = parseBloco(entrada.bloco_json)
  if (!produzido) {
    pulados.push({ id: entrada.id, motivo: 'bloco_json inválido/não-parseável' })
    continue
  }
  const erros = validarForma(produzido)
  if (erros.length) {
    pulados.push({ id: entrada.id, motivo: erros.join(', ') })
    continue
  }
  const arqEsq = acharArquivoEsqueleto(entrada, produzido)
  if (!arqEsq) {
    pulados.push({ id: entrada.id, motivo: 'esqueleto não encontrado em disco' })
    continue
  }
  const esqueleto = JSON.parse(readFileSync(arqEsq, 'utf8'))

  // FORÇA campos estruturais do esqueleto (fonte da verdade da árvore)
  for (const c of CAMPOS_ESTRUTURAIS) produzido[c] = esqueleto[c]
  produzido.metadata = produzido.metadata || {}
  produzido.metadata.disciplina = esqueleto.metadata?.disciplina ?? produzido.metadata.disciplina
  produzido.metadata.semestre = esqueleto.metadata?.semestre ?? produzido.metadata.semestre
  produzido.metadata.status = 'completo'
  produzido.metadata.data_ultima_revisao = produzido.metadata.data_ultima_revisao || '2026-07-02'

  writeFileSync(arqEsq, JSON.stringify(produzido, null, 2))
  gravados++
  const aprov = entrada.aprovado === false ? ' [⚠ corretor NÃO aprovou — revisar]' : ''
  console.log(`✓ ${produzido.resumo_id} → ${arqEsq}${aprov}`)
}

console.log(`\n${gravados} bloco(s) gravado(s).`)
if (pulados.length) {
  console.log(`${pulados.length} pulado(s):`)
  for (const p of pulados) console.log(`  ✗ ${p.id}: ${p.motivo}`)
}
console.log('\nPróximo: npm run manifesto → node scripts/verificar-curriculo.mjs → node scripts/analisar-qualidade.mjs')
