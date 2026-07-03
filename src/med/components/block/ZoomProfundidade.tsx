const NIVEIS = [
  { v: 1, label: 'Essencial' },
  { v: 2, label: 'Padrão' },
  { v: 3, label: 'Aprofundado' },
]

interface Props {
  nivel: number
  onMudar: (n: number) => void
}

/** Zoom de profundidade ELI5⇄aprofundar (bloco 2) — controla densidade da narrativa. */
export function ZoomProfundidade({ nivel, onMudar }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Profundidade</span>
      <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        {NIVEIS.map((n) => (
          <button
            key={n.v}
            onClick={() => onMudar(n.v)}
            title={n.label}
            style={{
              padding: '5px 12px',
              border: 'none',
              background: nivel === n.v ? 'var(--color-accent)' : 'transparent',
              color: nivel === n.v ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  )
}
