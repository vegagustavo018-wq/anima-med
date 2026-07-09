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
  // Vidro fosco derivado dos tokens do tema ativo (nunca hex fixo) — em temas
  // escuros fica um vidro navy/teal; no modo Claro vira um vidro claro legível,
  // porque color-mix() sempre parte de --color-bg-card/--color-bg-elevated.
  const GLASS_REPOUSO =
    'linear-gradient(140deg, color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-card) 90%) 0%, color-mix(in srgb, var(--color-bg-card) 90%, transparent) 42%, var(--color-bg-elevated) 100%)'
  const GLASS_HOVER =
    'linear-gradient(140deg, color-mix(in srgb, var(--color-accent) 16%, var(--color-bg-card) 84%) 0%, color-mix(in srgb, var(--color-bg-hover) 92%, transparent) 42%, var(--color-bg-hover) 100%)'

  const base: React.CSSProperties = {
    display: 'block',
    // Vidro fosco — sheen estático (não depende do backdrop-filter, que muitas
    // GPUs degradam ao vivo) + blur por cima quando o navegador consegue render.
    background: GLASS_REPOUSO,
    backdropFilter: 'blur(20px) saturate(135%)',
    WebkitBackdropFilter: 'blur(20px) saturate(135%)',
    // Longhands (não o shorthand `border`) para não conflitar com borderTop,
    // que precisa de espessura/cor diferentes quando `cor` é passada.
    borderLeft: '1px solid var(--color-border-accent)',
    borderRight: '1px solid var(--color-border-accent)',
    borderBottom: '1px solid var(--color-border-accent)',
    borderTop: cor ? `3px solid ${cor}` : '1px solid var(--color-border-accent)',
    borderRadius: 'var(--radius-lg)',
    // Sombra em camadas (chão distante + contato próximo) + brilho interno = profundidade real
    boxShadow: '0 12px 40px rgba(0,0,0,0.34), 0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
    padding: 20,
    cursor: onClick || to ? 'pointer' : 'default',
    textAlign: 'left',
    textDecoration: 'none',
    transition:
      'border-color 0.2s ease, background 0.2s ease, transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease',
    width: '100%',
    ...style,
  }
  const interativo = !!(onClick || to)
  const hover = (e: React.MouseEvent<HTMLElement>, on: boolean) => {
    if (!interativo) return
    e.currentTarget.style.background = on ? GLASS_HOVER : GLASS_REPOUSO
    e.currentTarget.style.transform = on ? 'translateY(-3px)' : 'translateY(0)'
    // No hover, todas as bordas ganham o teal do acento + glow suave
    const borda = on ? 'var(--color-accent)' : 'var(--color-border-accent)'
    e.currentTarget.style.borderLeftColor = borda
    e.currentTarget.style.borderRightColor = borda
    e.currentTarget.style.borderBottomColor = borda
    if (!cor) e.currentTarget.style.borderTopColor = borda
    e.currentTarget.style.boxShadow = on
      ? '0 20px 52px rgba(0,0,0,0.40), 0 0 22px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,0.10)'
      : '0 12px 40px rgba(0,0,0,0.34), 0 2px 8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)'
  }
  if (to)
    return (
      <Link to={to} style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
        {children}
      </Link>
    )
  if (onClick)
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
  // Sem onClick/to: não é interativo — <div>, nunca <button> (evita <button> aninhado
  // quando o card só existe para agrupar controles próprios, como CartaoEnergia).
  return (
    <div style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
      {children}
    </div>
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
        background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
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

// ── Botão CTA primário — sólido, cor de acento, para a ação principal de um card ──
export function BotaoCTA({
  children,
  onClick,
  to,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  to?: string
  style?: React.CSSProperties
}) {
  const SOMBRA_REPOUSO =
    '0 4px 18px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.18)'
  const SOMBRA_HOVER =
    '0 10px 30px var(--color-accent-glow), 0 0 0 1px color-mix(in srgb, var(--color-accent) 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.18)'
  const base: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 88%, white) 0%, var(--color-accent) 42%, var(--color-accent-dim) 130%)',
    color: 'var(--color-bg-base)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: '0.01em',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: SOMBRA_REPOUSO,
    transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease, filter 0.2s ease',
    ...style,
  }
  const hover = (e: React.MouseEvent<HTMLElement>, on: boolean) => {
    e.currentTarget.style.transform = on ? 'translateY(-2px)' : 'translateY(0)'
    e.currentTarget.style.filter = on ? 'brightness(1.06)' : 'brightness(1)'
    e.currentTarget.style.boxShadow = on ? SOMBRA_HOVER : SOMBRA_REPOUSO
  }
  if (to)
    return (
      <Link to={to} style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
        {children}
      </Link>
    )
  return (
    <button onClick={onClick} style={base} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
      {children}
    </button>
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
