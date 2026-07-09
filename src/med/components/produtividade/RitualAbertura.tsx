import { useEffect, useState } from 'react'
import { getMeta, setMeta } from '@core/db/database'
import { useUIStore, type PerfilSessao } from '@core/store/uiStore'
import { IconeNav } from '@med/components/navigation/icones'

const OPCOES: { v: PerfilSessao; label: string; desc: string; icone: string }[] = [
  { v: 'pico', label: 'Dia cheio', desc: 'Tenho tempo e energia hoje', icone: 'sol-cheio' },
  { v: 'padrao', label: 'Meio-termo', desc: 'O de sempre', icone: 'meio-sol' },
  { v: 'manutencao', label: 'Só o essencial', desc: 'Pouco tempo, quero sustentar', icone: 'nuvem' },
  { v: 'exausto', label: 'Hoje só descanso', desc: 'Sem estudo — só passar por aqui', icone: 'lua' },
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
        padding: '14px 18px',
        background: 'var(--panel)',
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--inner-highlight)',
        animation: 'entrarBaixo 0.2s ease',
      }}
    >
      {escolhido ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-accent)' }}>Combinado. Vou ajustar o ritmo de hoje por isso.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 11px', fontSize: 12.5, color: 'var(--color-text-secondary)' }}>Quanto de você cabe hoje?</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OPCOES.map((o) => (
              <button
                key={o.v}
                onClick={() => escolher(o.v)}
                title={o.desc}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 13px 7px 9px',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 99,
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, color 0.18s ease, background 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-accent)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                  e.currentTarget.style.background = 'color-mix(in srgb, var(--color-bg-hover) 60%, transparent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-soft)'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span aria-hidden="true" style={{ display: 'flex', color: 'var(--color-accent)' }}>
                  <IconeNav nome={o.icone} tamanho={13} />
                </span>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
