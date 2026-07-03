import { useState } from 'react'
import { useCheckInStore } from '@core/store/checkinStore'
import type { NivelEnergia, Humor } from '@core/types/schema'

const ENERGIAS: { v: NivelEnergia; label: string; icone: string }[] = [
  { v: 'baixa', label: 'Baixa', icone: '○' },
  { v: 'media', label: 'Média', icone: '◐' },
  { v: 'alta', label: 'Alta', icone: '●' },
]
const HUMORES: { v: Humor; label: string }[] = [
  { v: 'ansioso', label: 'Ansioso' },
  { v: 'neutro', label: 'Neutro' },
  { v: 'motivado', label: 'Motivado' },
  { v: 'cansado', label: 'Cansado' },
  { v: 'sobrecarregado', label: 'Sobrecarregado' },
]

interface Props {
  onFeito?: (energia: NivelEnergia, humor: Humor) => void
  compacto?: boolean
}

/** Check-in de Energia e Humor (bloco 7) — 1 toque, adapta a sessão. */
export function CheckInRapido({ onFeito, compacto }: Props) {
  const { registrar } = useCheckInStore()
  const [energia, setEnergia] = useState<NivelEnergia | null>(null)

  const escolherHumor = async (humor: Humor) => {
    const e = energia ?? 'media'
    await registrar(e, humor)
    onFeito?.(e, humor)
  }

  if (!energia) {
    return (
      <div>
        <p style={{ margin: '0 0 10px', fontSize: compacto ? 12 : 13, color: 'var(--color-text-secondary)' }}>
          Como está sua energia agora?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {ENERGIAS.map((e) => (
            <button
              key={e.v}
              onClick={() => setEnergia(e.v)}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 2 }}>{e.icone}</div>
              {e.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: compacto ? 12 : 13, color: 'var(--color-text-secondary)' }}>E o humor?</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {HUMORES.map((h) => (
          <button
            key={h.v}
            onClick={() => escolherHumor(h.v)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 99,
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            {h.label}
          </button>
        ))}
      </div>
    </div>
  )
}
