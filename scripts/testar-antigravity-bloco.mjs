// Teste: gerar UM bloco completo via Antigravity Interactions API, medir custo real.

import { readFileSync, writeFileSync } from 'node:fs'
import { setDefaultResultOrder } from 'node:dns'
setDefaultResultOrder('ipv4first')

const envPath = 'C:/Users/vegag/.claude/anima/med/.env'
const linha = readFileSync(envPath, 'utf8').split(/\r?\n/).find(l => l.startsWith('GEMINI_API_KEY='))
const CHAVE = linha.slice('GEMINI_API_KEY='.length).trim()
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const prompt = `Você é um especialista em fisiologia médica e educação. Escreva o bloco de conteúdo ANIMA Med completo abaixo, seguindo rigorosamente o schema v3.1 e o padrão pedagógico ANIMA (narrativa gradual e socrática, com etimologias, analogias vívidas, pausas para o leitor deduzir, contrafactuais e casos clínicos em cascata de 5 etapas quando fizer sentido).

TÓPICO: "Pressões Respiratórias — Alveolar, Pleural e Transpulmonar"
DISCIPLINA: Fisiologia II — Respiratória
resumo_id: s3-fisio2-01-011
no_pai_id: s3-fisio2-01-010 (bloco pai: "Mecânica Ventilatória — Visão Geral")
RESUMO SUGERIDO: As três pressões e por que a pleural negativa mantém o pulmão aberto

Cobrir: pressão alveolar (Palv), pressão pleural (Ppl, subatmosférica em repouso), pressão transpulmonar (Ptp = Palv - Ppl), por que Ppl negativa impede o colabamento pulmonar, o que acontece no pneumotórax quando essa pressão negativa se perde.

Retorne APENAS um objeto JSON válido (sem markdown, sem texto antes/depois) com esta estrutura exata:
{
  "resumo_id": "s3-fisio2-01-011",
  "no_pai_id": "s3-fisio2-01-010",
  "nos_filhos_ids": [],
  "conexoes_laterais_ids": [],
  "metadata": { "titulo": "...", "subtitulo": "...", "disciplina": "Fisiologia II — Respiratória, Renal, Digestiva, Endócrina, Reprodutora, Neuro", "semestre": 3, "tipo": "conceito", "tags": ["..."], "tempo_leitura_minutos": 10, "nivel": "CORE" },
  "resumo_conciso": "...",
  "narrativa": [ /* mínimo 8-10 elementos variados: secao, texto, pausa, etimologia, highlight, analogia, contrafactual, imagem */ ],
  "flashcards": [ /* mínimo 3, tipos variados: por_que|mecanismo|contrafactual|clinico|comparacao|armadilha|etimologia */ ],
  "casos_clinicos": [ /* cascata de 5 etapas se fizer sentido (ex: pneumotórax) */ ],
  "conexoes": {
    "prerequisitos": [ { "bloco_id": "Mecânica Ventilatória — Visão Geral", "titulo": "Mecânica Ventilatória — Visão Geral", "disciplina": "Fisiologia II — Respiratória, Renal, Digestiva, Endócrina, Reprodutora, Neuro", "semestre": 3, "relevancia": "base_necessaria", "explicacao": "..." } ],
    "futuras": [ /* ... */ ],
    "laterais": [ /* ... */ ]
  }
}

REGRA CRÍTICA: em conexoes.prerequisitos[].bloco_id, use o TÍTULO exato do bloco pré-requisito, NUNCA o ID técnico.`

async function main() {
  console.log('Disparando geração de bloco em background...')
  const criarResp = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE },
    body: JSON.stringify({ agent: 'antigravity-preview-05-2026', input: prompt, environment: 'remote', background: true }),
  })
  console.log('status criação:', criarResp.status)
  const criado = await criarResp.json()
  if (criarResp.status !== 200) { console.log('ERRO:', JSON.stringify(criado, null, 2)); return }
  const id = criado.id
  console.log('id:', id, '| status inicial:', criado.status)

  let tentativa = 0
  let atual = criado
  while (atual.status === 'in_progress' && tentativa < 40) {
    tentativa++
    await sleep(15000)
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions/${id}`, { headers: { 'x-goog-api-key': CHAVE } })
    atual = await resp.json()
    console.log(`[poll ${tentativa}] status: ${atual.status}`)
  }

  writeFileSync('C:/Users/vegag/.claude/anima/med/producao/teste-antigravity-api-fisio2-01-011.json', JSON.stringify(atual, null, 2), 'utf8')
  console.log('\n=== STATUS FINAL:', atual.status, '===')
  console.log('USO DE TOKENS:', JSON.stringify(atual.usage, null, 2))

  if (atual.steps) {
    for (const step of atual.steps) {
      if (step.type === 'model_output' && step.content) {
        for (const c of step.content) {
          if (c.type === 'text') {
            console.log('\n--- TEXTO DA RESPOSTA (primeiros 500 chars) ---')
            console.log(c.text.slice(0, 500))
            try {
              const parsed = JSON.parse(c.text)
              console.log('\nJSON VÁLIDO. narrativa:', parsed.narrativa?.length, '| flashcards:', parsed.flashcards?.length, '| casos_clinicos:', parsed.casos_clinicos?.length)
            } catch (e) {
              console.log('\nJSON INVÁLIDO no texto direto:', e.message)
            }
          }
        }
      }
    }
  }
}

main()
