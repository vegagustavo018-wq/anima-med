import { useState } from 'react'
import type { BlocoConteudo } from '@core/types/schema'

/** Rapid Review / High-Yield colapsável (bloco 2) — o essencial em 10 segundos. */
export function RapidReview({ bloco }: { bloco: BlocoConteudo }) {
  const [aberto, setAberto] = useState(false)

  const destaques = bloco.narrativa.filter(
    (i): i is Extract<typeof i, { tipo: 'highlight' }> => i.tipo === 'highlight'
  )
  if (destaques.length === 0) return null

  return (
    <div style={{ marginBottom: 28, border: '1px solid var(--color-border-accent)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <button
        onClick={() => setAberto((a) => !a)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'var(--color-bg-card)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          ⚡ Rapid Review · {destaques.length} pontos
        </span>
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)', transform: aberto ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }}>
          ⌄
        </span>
      </button>
      {aberto && (
        <div style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'entrarSuave 0.15s ease' }}>
          {destaques.map((d, i) => (
            <p key={i} style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>✦</span>
              {d.conteudo}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
