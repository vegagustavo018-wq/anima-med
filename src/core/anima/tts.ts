import type { NarrativaItem } from '@core/types/schema'

export interface TrechoFala {
  indice: number // índice do item na narrativa (-1 = resumo_conciso)
  texto: string
}

// Link markdown [texto](url) -> só "texto" (nunca soletrar a url)
const REGEX_LINK_MD = /\[([^\]]+)\]\([^)]*\)/g
// Símbolos de marcação que sobram — viram espaço (nunca colam duas palavras)
const REGEX_MD = /[*_`#>[\]()]/g
// Marcadores de lista no início da linha ("- item", "* item")
const REGEX_BULLET = /^[-*]\s+/gm
const REGEX_ESPACOS = /\s+/g
// Quebra em frases: mantém o separador para dar respiro natural entre utterances
const REGEX_FRASES = /(?<=[.!?…])\s+(?=[A-ZÀ-Ú"“(])/

function limpar(texto: string): string {
  return texto
    .replace(REGEX_LINK_MD, '$1')
    .replace(REGEX_BULLET, '')
    .replace(REGEX_MD, ' ')
    .replace(REGEX_ESPACOS, ' ')
    .trim()
}

/** Quebra um trecho longo em frases — utterances menores soam com cadência mais humana
 *  (respiro/entonação a cada ponto final) em vez de um bloco monótono e corrido. */
function emFrases(texto: string): string[] {
  return texto
    .split(REGEX_FRASES)
    .map((f) => f.trim())
    .filter(Boolean)
}

/** Extrai trechos falantes da narrativa — só o que tem prosa real. */
export function extrairFala(resumo_conciso: string, narrativa: NarrativaItem[]): TrechoFala[] {
  const trechos: TrechoFala[] = []
  const adicionar = (indice: number, textoBruto: string) => {
    const t = limpar(textoBruto)
    if (!t) return
    for (const frase of emFrases(t)) trechos.push({ indice, texto: frase })
  }
  adicionar(-1, resumo_conciso)
  narrativa.forEach((item, i) => {
    if (item.tipo === 'texto' || item.tipo === 'highlight' || item.tipo === 'pausa' || item.tipo === 'analogia') {
      adicionar(i, item.conteudo)
    }
  })
  return trechos
}

export type EstadoVoz = 'parado' | 'falando' | 'pausado'

// Vozes "Online"/"Natural"/"Neural" (Edge) e as vozes de rede do Google (Chrome) são
// sintetizadas em nuvem com prosódia real — soam muito menos robóticas que as vozes
// locais antigas tipo "Microsoft ... Desktop", que são concatenativas.
const PALAVRAS_VOZ_BOA = ['natural', 'online', 'neural', 'wavenet']
const PALAVRAS_VOZ_ANTIGA = ['desktop', 'compact']

function pontuarVoz(v: SpeechSynthesisVoice): number {
  const nome = v.name.toLowerCase()
  if (v.lang !== 'pt-BR' && !v.lang.startsWith('pt')) return -1
  let pontos = v.lang === 'pt-BR' ? 10 : 5
  if (PALAVRAS_VOZ_BOA.some((p) => nome.includes(p))) pontos += 5
  if (PALAVRAS_VOZ_ANTIGA.some((p) => nome.includes(p))) pontos -= 3
  if (!v.localService) pontos += 1 // voz de rede — geralmente motor mais novo/melhor
  return pontos
}

let vozesCarregadas: Promise<SpeechSynthesisVoice[]> | null = null

/** Chrome/Edge carregam a lista de vozes de forma assíncrona no início — espera o
 *  evento `voiceschanged` (com um teto de segurança) em vez de pegar a lista vazia. */
function carregarVozes(): Promise<SpeechSynthesisVoice[]> {
  if (vozesCarregadas) return vozesCarregadas
  vozesCarregadas = new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([])
      return
    }
    const existentes = window.speechSynthesis.getVoices()
    if (existentes.length > 0) {
      resolve(existentes)
      return
    }
    const aoMudar = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', aoMudar)
      resolve(window.speechSynthesis.getVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', aoMudar)
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
  })
  return vozesCarregadas
}

let melhorVozCache: SpeechSynthesisVoice | null | undefined

/** Escolhe a melhor voz pt-BR disponível no navegador/SO — resultado fica em cache
 *  (a lista de vozes não muda durante a sessão). */
async function escolherMelhorVoz(): Promise<SpeechSynthesisVoice | null> {
  if (melhorVozCache !== undefined) return melhorVozCache
  const vozes = await carregarVozes()
  const melhor = vozes
    .map((v) => ({ v, pontos: pontuarVoz(v) }))
    .filter((c) => c.pontos >= 0)
    .sort((a, b) => b.pontos - a.pontos)[0]?.v
  melhorVozCache = melhor ?? null
  return melhorVozCache
}

/**
 * Voz do Organismo (bloco 2) — TTS offline via Web Speech API, sem dependência
 * externa. Fala em português, avança item a item, permite pausar/retomar.
 */
export class VozDoOrganismo {
  private fila: TrechoFala[] = []
  private posicao = 0
  private estado: EstadoVoz = 'parado'
  private velocidade = 1
  private voz: SpeechSynthesisVoice | null = null
  private geracao = 0 // descarta iniciar() antigo se um novo chegar antes da voz resolver

  onMudancaItem?: (indice: number | null) => void
  onMudancaEstado?: (estado: EstadoVoz) => void

  get suportado(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  async iniciar(trechos: TrechoFala[], velocidade = 1) {
    if (!this.suportado) return
    this.parar()
    this.fila = trechos
    this.posicao = 0
    this.velocidade = velocidade
    const minhaGeracao = ++this.geracao
    this.voz = await escolherMelhorVoz()
    if (minhaGeracao !== this.geracao) return // um iniciar()/parar() mais novo já rodou
    this.falarProximo()
  }

  private falarProximo() {
    if (this.posicao >= this.fila.length) {
      this.parar()
      return
    }
    const trecho = this.fila[this.posicao]
    const u = new SpeechSynthesisUtterance(trecho.texto)
    u.lang = 'pt-BR'
    u.rate = this.velocidade
    if (this.voz) u.voice = this.voz
    u.onstart = () => {
      this.estado = 'falando'
      this.onMudancaEstado?.(this.estado)
      this.onMudancaItem?.(trecho.indice)
    }
    u.onend = () => {
      this.posicao += 1
      this.falarProximo()
    }
    window.speechSynthesis.speak(u)
  }

  pausar() {
    if (!this.suportado) return
    window.speechSynthesis.pause()
    this.estado = 'pausado'
    this.onMudancaEstado?.(this.estado)
  }

  retomar() {
    if (!this.suportado) return
    window.speechSynthesis.resume()
    this.estado = 'falando'
    this.onMudancaEstado?.(this.estado)
  }

  parar() {
    if (!this.suportado) return
    this.geracao++ // invalida qualquer iniciar() ainda esperando a voz resolver
    window.speechSynthesis.cancel()
    this.estado = 'parado'
    this.onMudancaEstado?.(this.estado)
    this.onMudancaItem?.(null)
  }

  get estadoAtual(): EstadoVoz {
    return this.estado
  }
}
