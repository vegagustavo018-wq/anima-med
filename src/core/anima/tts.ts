import type { NarrativaItem } from '@core/types/schema'

export interface TrechoFala {
  indice: number // índice do item na narrativa (-1 = resumo_conciso)
  texto: string
}

const REGEX_MD = /[*_`#>[\]()]/g

function limpar(texto: string): string {
  return texto.replace(REGEX_MD, '').trim()
}

/** Extrai trechos falantes da narrativa — só o que tem prosa real. */
export function extrairFala(resumo_conciso: string, narrativa: NarrativaItem[]): TrechoFala[] {
  const trechos: TrechoFala[] = [{ indice: -1, texto: limpar(resumo_conciso) }]
  narrativa.forEach((item, i) => {
    if (item.tipo === 'texto' || item.tipo === 'highlight' || item.tipo === 'pausa' || item.tipo === 'analogia') {
      const t = limpar(item.conteudo)
      if (t) trechos.push({ indice: i, texto: t })
    }
  })
  return trechos.filter((t) => t.texto.length > 0)
}

export type EstadoVoz = 'parado' | 'falando' | 'pausado'

/**
 * Voz do Organismo (bloco 2) — TTS offline via Web Speech API, sem dependência
 * externa. Fala em português, avança item a item, permite pausar/retomar.
 */
export class VozDoOrganismo {
  private fila: TrechoFala[] = []
  private posicao = 0
  private estado: EstadoVoz = 'parado'
  private velocidade = 1

  onMudancaItem?: (indice: number | null) => void
  onMudancaEstado?: (estado: EstadoVoz) => void

  get suportado(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  iniciar(trechos: TrechoFala[], velocidade = 1) {
    if (!this.suportado) return
    this.parar()
    this.fila = trechos
    this.posicao = 0
    this.velocidade = velocidade
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
    window.speechSynthesis.cancel()
    this.estado = 'parado'
    this.onMudancaEstado?.(this.estado)
    this.onMudancaItem?.(null)
  }

  get estadoAtual(): EstadoVoz {
    return this.estado
  }
}
