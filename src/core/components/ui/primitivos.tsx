import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// ── Container de página ───────────────────────────────────────────────────────
export function Pagina({ children, largura = 1100 }: { children: ReactNode; largura?: number }) {
  return <div style={{ padding: '32px 40px', maxWidth: largura, margin: '0 auto' }}>{children}</div>
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ itens }: { itens: { label: string; to?: string }[] }) {
  return (
    <nav style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      {itens.map((it, i) => (
        <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {it.to ? (
            <Link
              to={it.to}
              style={{ fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              {it.label}
            </Link>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{it.label}</span>
          )}
          {i < itens.length - 1 && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>›</span>
          )}
        </span>
      ))}
    </nav>
  )
}

// ── Cabeçalho de página ───────────────────────────────────────────────────────
export function CabecalhoPagina({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string
  subtitulo?: string
  acao?: ReactNode
}) {
  return (
    <header
      style={{
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {titulo}
        </h1>
        {subtitulo && (
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {subtitulo}
          </p>
        )}
      </div>
      {acao}
    </header>
  )
}

// ── Cartão clicável ───────────────────────────────────────────────────────────
export function Cartao({
  children,
  onClick,
  to,
  cor,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  to?: string
  cor?: string
  style?: React.CSSProperties
}) {
  const base: React.CSSProperties = {
    display: 'block',
    // Vidro fosco — deixa a bioluminescência do fundo vazar por trás
    background: 'rgba(26, 34, 52, 0.55)',
    backdropFilter: 'blur(16px) saturate(125%)',
    WebkitBackdropFilter: 'blur(16px) saturate(125%)',
    border: '1px solid rgba(140, 160, 190, 0.12)',
    borderTop: cor ? `3px solid ${cor}` : '1px solid rgba(140, 160, 190, 0.12)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)',
    padding: 18,
    cursor: onClick || to ? 'pointer' : 'default',
    textAlign: 'left',
    textDecoration: 'none',
    transition: 'border-color 0.18s, background 0.18s, transform 0.18s, box-shadow 0.18s',
    width: '100%',
    ...style,
  }
  const hover = (e: React.MouseEvent<HTMLElement>, on: boolean) => {
    e.currentTarget.style.background = on ? 'rgba(30, 42, 64, 0.7)' : 'rgba(26, 34, 52, 0.55)'
    e.currentTarget.style.transform = on ? 'translateY(-2px)' : 'translateY(0)'
    e.currentTarget.style.boxShadow = on
      ? '0 14px 40px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.07)'
      : '0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)'
    if (cor) e.currentTarget.style.borderTopColor = cor
  }
  if (to)
    return (
      <Link to={to} style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
        {children}
      </Link>
    )
  return (
    <button
      onClick={onClick}
      style={base}
      onMouseEnter={(e) => hover(e, true)}
      onMouseLeave={(e) => hover(e, false)}
    >
      {children}
    </button>
  )
}

// ── Grade responsiva ──────────────────────────────────────────────────────────
export function Grade({ children, min = 240 }: { children: ReactNode; min?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap: 16,
      }}
    >
      {children}
    </div>
  )
}

// ── Fala da ANIMA ─────────────────────────────────────────────────────────────
export function FalaAnima({ texto, grande = false }: { texto: string; grande?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: grande ? '20px 24px' : '14px 18px',
        background: 'rgba(79, 209, 197, 0.10)',
        backdropFilter: 'blur(14px) saturate(120%)',
        WebkitBackdropFilter: 'blur(14px) saturate(120%)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          fontSize: grande ? 24 : 18,
          color: 'var(--color-accent)',
          lineHeight: 1,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ✦
      </span>
      <p
        style={{
          margin: 0,
          fontSize: grande ? 17 : 14,
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {texto}
      </p>
    </div>
  )
}

// ── Badge de nível/estado ─────────────────────────────────────────────────────
export function Badge({ children, cor }: { children: ReactNode; cor?: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: cor ?? 'var(--color-text-muted)',
        padding: '2px 8px',
        border: `1px solid ${cor ?? 'var(--color-border)'}`,
        borderRadius: 99,
      }}
    >
      {children}
    </span>
  )
}

// ── Estado vazio ──────────────────────────────────────────────────────────────
export function EstadoVazio({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 32px',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}
