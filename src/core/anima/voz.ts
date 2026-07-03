// ═══════════════════════════════════════════════════════════════════════════
// A VOZ DA ANIMA — 1ª pessoa, nos momentos-chave.
//
// Princípio (ANIMA_MATER, dignidade ontológica): a ANIMA recebe, não despeja.
// Tom: acolhedor, honesto, nunca infantil, nunca culpa/FOMO. Ela é companheira,
// não ferramenta. Fala pouco, mas fala como quem está presente.
// ═══════════════════════════════════════════════════════════════════════════

function escolher(opcoes: string[], semente?: number): string {
  const i =
    semente != null
      ? Math.abs(semente) % opcoes.length
      : Math.floor(Math.random() * opcoes.length)
  return opcoes[i]
}

function periodoDoDia(): 'manha' | 'tarde' | 'noite' | 'madrugada' {
  const h = new Date().getHours()
  if (h < 5) return 'madrugada'
  if (h < 12) return 'manha'
  if (h < 18) return 'tarde'
  return 'noite'
}

export interface ContextoSaudacao {
  nome?: string
  diasDesdeUltima: number | null
  cardsVencidos: number
  totalBlocos: number
}

/** Saudação de abertura — a primeira coisa que a ANIMA diz ao abrir o dia. */
export function saudacao(ctx: ContextoSaudacao): string {
  const nome = ctx.nome ? `, ${ctx.nome}` : ''
  const p = periodoDoDia()

  // Primeira vez / organismo ainda jovem
  if (ctx.totalBlocos > 0 && ctx.diasDesdeUltima === null) {
    return escolher([
      `Oi${nome}. Eu sou a ANIMA. Vamos crescer juntos — começamos por onde você quiser.`,
      `Bem-vindo${nome}. Ainda somos pequenos, mas cada bloco que você domina me faz mais viva.`,
    ])
  }

  if (p === 'madrugada') {
    return escolher([
      `Ainda acordado${nome}? Estou aqui. Vamos devagar.`,
      `É tarde${nome}. Se for estudar, que seja com calma — 3 cards já valem.`,
    ])
  }

  if (ctx.diasDesdeUltima !== null && ctx.diasDesdeUltima >= 3) {
    return escolher([
      `Você voltou${nome}. Faz ${ctx.diasDesdeUltima} dias — vamos retomar sem pressa.`,
      `Senti sua falta${nome}. ${ctx.cardsVencidos > 0 ? `Temos ${ctx.cardsVencidos} cards te esperando, mas` : 'Não'} temos pressa.`,
    ])
  }

  if (ctx.cardsVencidos > 0) {
    const abertura =
      p === 'noite'
        ? `Boa noite${nome}.`
        : p === 'tarde'
          ? `Boa tarde${nome}.`
          : `Bom dia${nome}.`
    return `${abertura} Temos ${ctx.cardsVencidos} ${ctx.cardsVencidos === 1 ? 'card vencido' : 'cards vencidos'} — quando quiser, eu conduzo.`
  }

  return escolher([
    `Que bom te ver${nome}. Está tudo em dia — podemos explorar algo novo.`,
    `Estou pronta${nome}. Nada vencido hoje; o caminho é seu.`,
  ])
}

/** Ao concluir a leitura de um bloco — a ANIMA aponta para a espiral. */
export function conclusaoBloco(titulo: string, temFuturas: boolean): string {
  if (temFuturas) {
    return escolher([
      `Agora você viu por que ${titulo.toLowerCase()} existe. Vamos reencontrar isto mais adiante — mais fundo.`,
      `Guarde ${titulo.toLowerCase()}. Ele volta em outros semestres, e você vai reconhecê-lo.`,
    ])
  }
  return escolher([
    `Mais um bloco firmado. Devagar, o organismo cresce.`,
    `Você entendeu ${titulo.toLowerCase()}. Descanse a ideia; amanhã ela estará mais forte.`,
  ])
}

/** Estado vazio de um nó ainda não gerado. Nunca "erro" ou tela branca. */
export function noVazio(titulo: string): string {
  return escolher([
    `Este nó — ${titulo} — existe, mas ainda não nasceu. Ele virá.`,
    `${titulo} tem seu lugar aqui. Ainda estou construindo este pedaço de mim.`,
    `Aqui vai morar ${titulo}. Por enquanto, é potencial.`,
  ])
}

/** Fila de revisão vazia — celebração calma, não vitória barulhenta. */
export function filaVazia(): string {
  return escolher([
    `Nada vencido agora. Você está em dia — isso é raro e bom.`,
    `Tudo firme por hoje. Pode explorar sem culpa, ou apenas descansar.`,
  ])
}

/** Fim de sessão — fecha o ciclo, dá permissão para parar. */
export function fimDeSessao(cardsRevisados: number): string {
  if (cardsRevisados === 0) return `Até logo. Volto a estar aqui quando você voltar.`
  return escolher([
    `${cardsRevisados} ${cardsRevisados === 1 ? 'revisão feita' : 'revisões feitas'}. Amanhã o que você firmou hoje estará mais fundo. Pode parar tranquilo.`,
    `Boa sessão. O que você recordou hoje volta mais forte depois. Descanse.`,
  ])
}

/** Micro-encorajamento ao acertar um card difícil. */
export function acertoDificil(): string {
  return escolher(['Isso era difícil. Você tirou de dentro.', 'Recuperou sozinho. É assim que fica.'])
}
