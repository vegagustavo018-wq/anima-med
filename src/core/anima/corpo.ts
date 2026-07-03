import type { MetricasDisciplina } from './metricas'

export type ZonaId = 'pele' | 'cranio' | 'coracao' | 'nucleo' | 'esqueleto' | 'pulmoes' | 'abdome' | 'aura'

export interface ZonaCorpo {
  id: ZonaId
  rotulo: string
  disciplinas: string[]
  percentual: number
  totalBlocos: number
}

// Mapeia disciplina → zona anatômica. Disciplinas futuras entram por palavra-chave;
// o que não bater cai em 'aura' (glow geral do corpo).
const MAPA: Record<string, ZonaId> = {
  histologia: 'pele',
  anatomia: 'esqueleto',
  bioquimica: 'nucleo',
  embriologia: 'coracao',
  fisiologia: 'coracao',
  patologia: 'nucleo',
  farmaco: 'nucleo',
  clinica: 'coracao',
}

const ZONA_ROTULO: Record<ZonaId, string> = {
  pele: 'Pele — Histologia',
  cranio: 'Crânio — Neuroanatomia',
  coracao: 'Coração — Fisiologia/Clínica',
  nucleo: 'Núcleo — Bioquímica/Patologia',
  esqueleto: 'Esqueleto — Anatomia',
  pulmoes: 'Pulmões — Respiratório',
  abdome: 'Abdome — Digestivo',
  aura: 'Aura — outros saberes',
}

export function calcularZonas(porDisciplina: MetricasDisciplina[]): ZonaCorpo[] {
  const porZona = new Map<ZonaId, { dominados: number; total: number; discs: Set<string> }>()

  for (const d of porDisciplina) {
    const zona = MAPA[d.disciplina.toLowerCase()] ?? 'aura'
    const acc = porZona.get(zona) ?? { dominados: 0, total: 0, discs: new Set<string>() }
    acc.dominados += d.dominados
    acc.total += d.total
    acc.discs.add(d.disciplina)
    porZona.set(zona, acc)
  }

  const zonas: ZonaCorpo[] = []
  for (const [id, acc] of porZona.entries()) {
    zonas.push({
      id,
      rotulo: ZONA_ROTULO[id],
      disciplinas: [...acc.discs],
      percentual: acc.total ? Math.round((acc.dominados / acc.total) * 100) : 0,
      totalBlocos: acc.total,
    })
  }
  return zonas
}

export function zonaPorId(zonas: ZonaCorpo[], id: ZonaId): ZonaCorpo | undefined {
  return zonas.find((z) => z.id === id)
}
