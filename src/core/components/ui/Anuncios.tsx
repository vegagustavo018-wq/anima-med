import { useAnuncioStore, type TipoAnuncio } from '@core/store/anuncioStore'

const COR: Record<TipoAnuncio, string> = {
  info: 'var(--color-accent)',
  sucesso: 'var(--color-success)',
  erro: 'var(--color-danger)',
}
const ICONE: Record<TipoAnuncio, string> = {
  info: '✦',
  sucesso: '✓',
  erro: '⚠',
}

/**
 * Pilha de anúncios (toasts) fixada no canto inferior. Container com aria-live
 * "polite" — anúncios novos são lidos por leitores de tela sem roubar o foco.
 */
export function Anuncios() {
  const { anuncios, remover } = useAnuncioStore()

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      style={{
        position: 'fixed',
        bottom: 'calc(20px + env(safe-area-inset-bottom))',
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 80,
        maxWidth: 'min(360px, calc(100vw - 40px))',
        pointerEvents: 'none',
      }}
    >
      {anuncios.map((a) => (
        <button
          key={a.id}
          onClick={() => remover(a.id)}
          className="anima-entra"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            textAlign: 'left',
            padding: '12px 15px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${COR[a.tipo]}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          <span aria-hidden="true" style={{ color: COR[a.tipo], fontSize: 15, flexShrink: 0, marginTop: 1 }}>
            {a.icone ?? ICONE[a.tipo]}
          </span>
          <span style={{ flex: 1 }}>{a.texto}</span>
        </button>
      ))}
    </div>
  )
}
