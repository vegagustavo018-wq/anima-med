import type { BlocoPreview } from '@core/types/schema'

export interface NoArvore {
  id: string
  preview: BlocoPreview | null // null = nó declarado mas ainda não gerado
  titulo: string
  filhos: NoArvore[]
  profundidade: number
  // posição calculada no layout
  x: number
  y: number
}

/**
 * Monta a floresta de árvores a partir dos ponteiros no_pai_id.
 * Robusto a lacunas: raízes são blocos cujo pai não existe no conjunto.
 * Nós filhos declarados que não existem viram nós-fantasma (preview null).
 */
export function montarArvore(previews: BlocoPreview[]): NoArvore[] {
  const porId = new Map<string, BlocoPreview>()
  for (const p of previews) porId.set(p.resumo_id, p)

  const filhosDe = new Map<string, string[]>()
  const temPai = new Set<string>()

  for (const p of previews) {
    const pai = p.no_pai_id
    if (pai && porId.has(pai)) {
      if (!filhosDe.has(pai)) filhosDe.set(pai, [])
      filhosDe.get(pai)!.push(p.resumo_id)
      temPai.add(p.resumo_id)
    }
  }

  // raízes = blocos sem pai válido no conjunto
  const raizes = previews
    .filter((p) => !temPai.has(p.resumo_id))
    .map((p) => p.resumo_id)
    .sort()

  function construir(id: string, prof: number): NoArvore {
    const preview = porId.get(id) ?? null
    const filhosIds = (filhosDe.get(id) ?? []).sort()
    return {
      id,
      preview,
      titulo: preview?.metadata.titulo ?? id,
      filhos: filhosIds.map((f) => construir(f, prof + 1)),
      profundidade: prof,
      x: 0,
      y: 0,
    }
  }

  return raizes.map((r) => construir(r, 0))
}

export interface LayoutConfig {
  larguraNo: number
  alturaNo: number
  gapX: number
  gapY: number
}

export interface LayoutResultado {
  nos: NoArvore[]
  largura: number
  altura: number
}

/**
 * Layout tidy-tree horizontal: profundidade = coluna (x), folhas recebem y
 * sequencial e pais centram sobre os filhos (y). Árvores da ANIMA tendem a ser
 * rasas e largas (poucos ramos, muitas folhas) — colunas por profundidade
 * evitam a explosão horizontal que um layout de cima-pra-baixo sofreria;
 * o crescimento vai para a altura (scroll vertical), mais natural de navegar.
 * Suporta floresta (várias raízes empilhadas).
 */
export function calcularLayout(raizes: NoArvore[], cfg: LayoutConfig): LayoutResultado {
  let cursorFolha = 0
  let maxProf = 0

  function posicionar(no: NoArvore): void {
    maxProf = Math.max(maxProf, no.profundidade)
    no.x = no.profundidade * (cfg.larguraNo + cfg.gapX)
    if (no.filhos.length === 0) {
      no.y = cursorFolha * (cfg.alturaNo + cfg.gapY)
      cursorFolha++
    } else {
      for (const f of no.filhos) posicionar(f)
      const primeiro = no.filhos[0]
      const ultimo = no.filhos[no.filhos.length - 1]
      no.y = (primeiro.y + ultimo.y) / 2
    }
  }

  for (const r of raizes) {
    posicionar(r)
    cursorFolha += 1 // separação entre árvores da floresta
  }

  // achatar para medir extents
  const todos: NoArvore[] = []
  function coletar(no: NoArvore) {
    todos.push(no)
    no.filhos.forEach(coletar)
  }
  raizes.forEach(coletar)

  const maxY = Math.max(0, ...todos.map((n) => n.y)) + cfg.alturaNo
  const largura = (maxProf + 1) * cfg.larguraNo + maxProf * cfg.gapX

  return { nos: todos, largura, altura: maxY }
}

/** Achata a floresta numa lista de nós (para iterar). */
export function achatar(raizes: NoArvore[]): NoArvore[] {
  const out: NoArvore[] = []
  function rec(n: NoArvore) {
    out.push(n)
    n.filhos.forEach(rec)
  }
  raizes.forEach(rec)
  return out
}
