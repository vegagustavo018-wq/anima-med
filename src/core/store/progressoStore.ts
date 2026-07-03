import { create } from 'zustand'
import { db, registrarEvento } from '@core/db/database'
import { snapshotAutomatico } from '@core/db/backup'
import { anunciar } from '@core/store/anuncioStore'
import { tocar } from '@core/anima/som'
import { revisar, type Qualidade } from '@core/srs/sm2'
import { progressoInicial, type ProgressoBloco, type CorDestaque } from '@core/types/schema'

async function registrarDescobertaSeDominouAgora(
  antes: ProgressoBloco['srs']['status'],
  depois: ProgressoBloco['srs']['status'],
  resumo_id: string
): Promise<void> {
  if (antes === 'dominado' || depois !== 'dominado') return
  try {
    const bloco = await db.blocos.get(resumo_id)
    await db.descobertas.add({
      resumo_id,
      titulo: 'Novo domínio firmado',
      narrativa: bloco
        ? `Você dominou "${bloco.metadata.titulo}". Isso não vai embora fácil — o organismo guardou.`
        : 'Um bloco novo se firmou em você.',
      tipo: 'dominio_firmado',
      criado_em: new Date().toISOString(),
    })
  } catch {
    // não deve quebrar o fluxo de revisão
  }
}

interface ProgressoState {
  cache: Record<string, ProgressoBloco>

  carregar: (resumo_id: string) => Promise<ProgressoBloco>
  carregarTodos: () => Promise<ProgressoBloco[]>
  carregarVarios: (ids: string[]) => Promise<Record<string, ProgressoBloco>>

  registrarLeitura: (resumo_id: string) => Promise<void>
  registrarPalpite: (resumo_id: string, resposta: string) => Promise<void>
  revisarBloco: (resumo_id: string, q: Qualidade, confianca?: number) => Promise<void>
  revisarCard: (resumo_id: string, card_id: string, q: Qualidade) => Promise<void>
  desfazerUltimaRevisao: (resumo_id: string) => Promise<void>
  toggleMarcado: (resumo_id: string) => Promise<void>
  salvarNota: (resumo_id: string, nota: string) => Promise<void>
  salvarDiario: (resumo_id: string, texto: string) => Promise<void>
  setAutoAvaliacao: (resumo_id: string, eixo: string, valor: number) => Promise<void>
  adicionarDestaque: (resumo_id: string, trecho: string, cor: CorDestaque) => Promise<void>
  reformularParaLeech: (resumo_id: string) => Promise<void>
}

async function obter(
  cache: Record<string, ProgressoBloco>,
  resumo_id: string
): Promise<ProgressoBloco> {
  if (cache[resumo_id]) return cache[resumo_id]
  const existente = await db.progresso.get(resumo_id)
  return existente ?? progressoInicial(resumo_id, new Date().toISOString())
}

async function persistir(p: ProgressoBloco): Promise<void> {
  p.atualizado_em = new Date().toISOString()
  await db.progresso.put(p)
}

const MAX_HISTORICO = 200

export const useProgressoStore = create<ProgressoState>((set, get) => ({
  cache: {},

  carregar: async (resumo_id) => {
    const p = await obter(get().cache, resumo_id)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
    return p
  },

  carregarTodos: async () => {
    const todos = await db.progresso.toArray()
    const map: Record<string, ProgressoBloco> = {}
    for (const p of todos) map[p.resumo_id] = p
    set({ cache: map })
    return todos
  },

  // Carrega só o progresso de ids específicos (ex.: os blocos de um tema) —
  // evita puxar a tabela inteira para colorir algumas dezenas de nós. Mescla
  // no cache existente em vez de substituí-lo.
  carregarVarios: async (ids) => {
    if (!ids.length) return {}
    const linhas = await db.progresso.bulkGet(ids)
    const encontrados: Record<string, ProgressoBloco> = {}
    for (const p of linhas) if (p) encontrados[p.resumo_id] = p
    set((s) => ({ cache: { ...s.cache, ...encontrados } }))
    return encontrados
  },

  registrarLeitura: async (resumo_id) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.vezes_lido += 1
    p.ultima_leitura = new Date().toISOString()
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  registrarPalpite: async (resumo_id, resposta) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.palpites = [...p.palpites, { data: new Date().toISOString(), resposta }]
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
    await registrarEvento('palpite', { resumo_id })
  },

  revisarBloco: async (resumo_id, q, confianca) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    const antes = p.srs.facilidade
    const statusAntes = p.srs.status
    p.srs = revisar(p.srs, q)
    await registrarDescobertaSeDominouAgora(statusAntes, p.srs.status, resumo_id)
    // celebra o instante em que um bloco se firma (som + toast, uma vez só);
    // caso contrário, um retorno sonoro discreto conforme a qualidade da revisão
    if (statusAntes !== 'dominado' && p.srs.status === 'dominado') {
      anunciar('Domínio firmado — o organismo guardou.', { tipo: 'sucesso', icone: '✦' })
      // pode ter fechado um marco (disciplina/semestre) → checa rituais de passagem
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('anima:rituais'))
    } else {
      tocar(q >= 3 ? 'acerto' : 'erro')
    }
    p.historico_revisoes = [
      ...p.historico_revisoes,
      {
        data: p.srs.ultima_revisao!,
        alvo: 'bloco',
        qualidade: q,
        facilidade_antes: antes,
        facilidade_depois: p.srs.facilidade,
        intervalo_depois: p.srs.intervalo_dias,
      },
    ].slice(-MAX_HISTORICO)
    if (confianca != null) {
      p.calibracao = [
        ...p.calibracao,
        { data: new Date().toISOString(), confianca, acertou: q >= 3 },
      ]
    }
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
    await snapshotAutomatico()
  },

  revisarCard: async (resumo_id, card_id, q) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    const anterior = p.srs_cards[card_id] ?? progressoInicial(resumo_id, '').srs
    const novo = revisar(anterior, q)
    p.srs_cards = { ...p.srs_cards, [card_id]: novo }
    p.historico_revisoes = [
      ...p.historico_revisoes,
      {
        data: novo.ultima_revisao!,
        alvo: card_id,
        qualidade: q,
        facilidade_antes: anterior.facilidade,
        facilidade_depois: novo.facilidade,
        intervalo_depois: novo.intervalo_dias,
      },
    ].slice(-MAX_HISTORICO)
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  desfazerUltimaRevisao: async (resumo_id) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    const ultimo = p.historico_revisoes[p.historico_revisoes.length - 1]
    if (!ultimo) return
    p.historico_revisoes = p.historico_revisoes.slice(0, -1)
    // reconstrói o estado a partir do penúltimo evento do mesmo alvo (ou reseta se não houver)
    const doMesmoAlvo = p.historico_revisoes.filter((h) => h.alvo === ultimo.alvo)
    const penultimo = doMesmoAlvo[doMesmoAlvo.length - 1]
    const estadoRestaurado = {
      facilidade: penultimo?.facilidade_depois ?? 2.5,
      intervalo_dias: penultimo?.intervalo_depois ?? 0,
      repeticoes: Math.max(0, (penultimo ? doMesmoAlvo.length : 0)),
      proxima_revisao: null,
      ultima_revisao: penultimo?.data ?? null,
      status: 'aprendendo' as const,
      lapsos: p.srs.lapsos,
    }
    if (ultimo.alvo === 'bloco') p.srs = estadoRestaurado
    else p.srs_cards = { ...p.srs_cards, [ultimo.alvo]: estadoRestaurado }
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  toggleMarcado: async (resumo_id) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.marcado_para_revisao = !p.marcado_para_revisao
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  salvarNota: async (resumo_id, nota) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.notas_do_usuario = nota
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  salvarDiario: async (resumo_id, texto) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.diario_aprendizagem = texto
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  setAutoAvaliacao: async (resumo_id, eixo, valor) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.auto_avaliacao = { ...p.auto_avaliacao, [eixo]: valor }
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  adicionarDestaque: async (resumo_id, trecho, cor) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.destaques = [...p.destaques, { trecho, cor, criado_em: new Date().toISOString() }]
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },

  reformularParaLeech: async (resumo_id) => {
    const p = { ...(await obter(get().cache, resumo_id)) }
    p.marcado_para_revisao = true
    p.srs = { ...p.srs, lapsos: 0, repeticoes: 0, intervalo_dias: 1 }
    await persistir(p)
    set((s) => ({ cache: { ...s.cache, [resumo_id]: p } }))
  },
}))
