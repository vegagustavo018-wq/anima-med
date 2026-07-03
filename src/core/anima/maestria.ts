import type { ProgressoBloco } from '@core/types/schema'

export type NivelMaestria = 1 | 2 | 3 | 4 | 5
export const NOME_NIVEL: Record<NivelMaestria, string> = {
  1: 'Semente',
  2: 'Germinando',
  3: 'Enraizado',
  4: 'Ramificado',
  5: 'Frutífero',
}
export const ICONE_NIVEL: Record<NivelMaestria, string> = {
  1: '·',
  2: '⌐',
  3: '↟',
  4: '⋔',
  5: '❋',
}

/**
 * Nível de maestria (5 estágios) derivado do estado real do SRS + calibração.
 * Pode REGREDIR — se a retenção caiu (SM-2 zerou repetições), o nível cai junto.
 * Nível 5 (Frutífero) exige também competência de ensinar de volta (bloco 4/8).
 */
export function calcularNivel(p: ProgressoBloco | undefined, ensinouDeVolta = false): NivelMaestria {
  if (!p || p.vezes_lido === 0) return 1
  const rep = p.srs.repeticoes
  if (rep === 0) return p.srs.lapsos > 0 ? 1 : 2
  if (rep === 1) return 2
  if (rep <= 2) return 3
  if (rep <= 4) return 4
  // Frutífero: domínio alto no SRS + (idealmente) prova de ensino
  return ensinouDeVolta || rep >= 6 ? 5 : 4
}

export interface DistribuicaoMaestria {
  contagem: Record<NivelMaestria, number>
  total: number
}

export function distribuir(progresso: ProgressoBloco[]): DistribuicaoMaestria {
  const contagem: Record<NivelMaestria, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const p of progresso) {
    if (p.vezes_lido === 0) continue
    contagem[calcularNivel(p)]++
  }
  const total = Object.values(contagem).reduce((a, b) => a + b, 0)
  return { contagem, total }
}
