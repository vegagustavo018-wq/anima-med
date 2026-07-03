import { useEffect, useState } from 'react'
import { getMeta, setMeta } from '@core/db/database'
import { useUIStore, type PerfilSessao } from '@core/store/uiStore'

const OPCOES: { v: PerfilSessao; label: string; desc: string }[] = [
  { v: 'pico', label: 'Dia cheio', desc: 'Tenho tempo e energia hoje' },
  { v: 'padrao', label: 'Meio-termo', desc: 'O de sempre' },
  { v: 'manutencao', label: 'Só o essencial', desc: 'Pouco tempo, quero sustentar' },
  { v: 'exausto', label: 'Hoje só descanso', desc: 'Sem estudo — só passar por aqui' },
]

/**
 * Ritual de Abertura (bloco 6) — "quanto de você cabe hoje?" Oferece, nunca
 * obriga. Mostrado no máximo uma vez por dia.
 */
export function RitualAbertura() {
  const { setPerfilSessao } = useUIStore()
  const [mostrar, setMostrar] = useState(false)
  const [escolhido, setEscolhido] = useState<PerfilSessao | null>(null)

  useEffect(() => {
    ;(async () => {
      const hoje = new Date().toISOString().slice(0, 10)
      const ultimo = await getMeta<string>('ritual_abertura_dia')
      if (ultimo !== hoje) setMostrar(true)
    })()
  }, [])

  if (!mostrar) return null

  const escolher = async (v: PerfilSessao) => {
    setPerfilSessao(v)
    setEscolhido(v)
    await setMeta('ritual_abertura_dia', new Date().toISOString().slice(0, 10))
    setTimeout(() => setMostrar(false), 900)
  }

  return (
    <div
      style={{
        marginBottom: 20,
        padding: '16px 20px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: 'var(--radius-lg)',
        animation: 'entrarBaixo 0.2s ease',
      }}
    >
      {escolhido ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-accent)' }}>Combinado. Vou ajustar o ritmo de hoje por isso.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>Quanto de você cabe hoje?</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OPCOES.map((o) => (
              <button
                key={o.v}
                onClick={() => escolher(o.v)}
                title={o.desc}
                style={{
                  padding: '8px 14px',
                  border: '1px solid var(--color-border-accent)',
                  borderRadius: 99,
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
