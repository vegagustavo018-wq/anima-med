// Teste: disparar uma tarefa real no agente Antigravity via Interactions API
// (background=true, com polling), usando o prompt de busca de imagens reais.

import { readFileSync, writeFileSync } from 'node:fs'
import { setDefaultResultOrder } from 'node:dns'
setDefaultResultOrder('ipv4first')

const envPath = 'C:/Users/vegag/.claude/anima/med/.env'
const linha = readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY='))
const CHAVE = linha.slice('GEMINI_API_KEY='.length).trim()

const prompt = readFileSync('C:/Users/vegag/.claude/anima/AGENTES/PROMPTS-PRODUCAO/LOTE-ANTIGRAVITY-imagens-reais-01.md', 'utf8')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function main() {
  console.log('Disparando interação em background...')
  const criarResp = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE },
    body: JSON.stringify({ agent: 'antigravity-preview-05-2026', input: prompt, environment: 'remote', background: true }),
  })
  console.log('status criação:', criarResp.status)
  const criado = await criarResp.json()
  if (criarResp.status !== 200) {
    console.log('ERRO:', JSON.stringify(criado, null, 2))
    return
  }
  const id = criado.id
  console.log('id da interação:', id, '| status inicial:', criado.status)

  let tentativa = 0
  let atual = criado
  while (atual.status === 'in_progress' && tentativa < 40) {
    tentativa++
    await sleep(15000)
    const url = `https://generativelanguage.googleapis.com/v1beta/interactions/${id}`
    const resp = await fetch(url, { headers: { 'x-goog-api-key': CHAVE } })
    atual = await resp.json()
    console.log(`[poll ${tentativa}] status: ${atual.status}`)
  }

  writeFileSync('C:/Users/vegag/.claude/anima/med/producao/resultado-antigravity-imagens-01.json', JSON.stringify(atual, null, 2), 'utf8')
  console.log('\n=== RESULTADO FINAL (status: ' + atual.status + ') ===')
  if (atual.steps) {
    for (const step of atual.steps) {
      if (step.type === 'model_output' && step.content) {
        for (const c of step.content) if (c.type === 'text') console.log(c.text)
      }
    }
  }
  console.log('\nSalvo integralmente em producao/resultado-antigravity-imagens-01.json')
  console.log('uso de tokens:', JSON.stringify(atual.usage))
}

main()
