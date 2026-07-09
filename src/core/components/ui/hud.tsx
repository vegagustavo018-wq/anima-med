import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/**
 * Camada de linguagem visual "HUD clínico" — espelha a assinatura estética do
 * protótipo ANIMA feito no Google AI Studio: micro-rótulos monoespaçados em
 * MAIÚSCULO, badges de status em pílula, barras de progresso rotuladas, anéis
 * radiais e rodapés-métrica. Tudo token-based (var(--color-*)), então acompanha
 * tema claro/OLED/sépia e cor de acento automaticamente — nada de hex fixo.
 *
 * Convenção do projeto: estilos inline + tokens (não classes utilitárias), para
 * manter consistência com os ~90 componentes já existentes.
 */

// ── Micro-rótulo clínico ────────────────────────────────────────────────────
// Ex.: "SISTEMA INTELIGENTE", "DOMÍNIO COGNITIVO", "FOCO CLÍNICO: PERGUNTA".
export function RotuloClinico({
  children,
  icone: Icone,
  cor = 'var(--color-accent)',
  pulsar = false,
  tamanho = 11,
  style,
}: {
  children: ReactNode
  icone?: LucideIcon
  cor?: string
  pulsar?: boolean
  tamanho?: number
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: 'var(--font-mono)',
        fontSize: tamanho,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: cor,
        lineHeight: 1,
        ...style,
      }}
    >
      {Icone && (
        <Icone
          size={tamanho + 2}
          color={cor}
          className={pulsar ? 'anima-respira' : undefined}
          style={{ flexShrink: 0 }}
        />
      )}
      {children}
    </span>
  )
}

// ── Badge de status ─────────────────────────────────────────────────────────
type TipoBadge = 'ativo' | 'concluido' | 'pendente' | 'forte' | 'fraca' | 'novo' | 'ia' | 'neutro'

const CORES_BADGE: Record<TipoBadge, { cor: string; fundo: string; borda: string }> = {
  ativo: {
    cor: 'var(--color-accent)',
    fundo: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
  },
  concluido: {
    cor: 'var(--color-success)',
    fundo: 'color-mix(in srgb, var(--color-success) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-success) 30%, transparent)',
  },
  pendente: {
    cor: 'var(--color-warning)',
    fundo: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
  },
  forte: {
    cor: 'var(--color-accent)',
    fundo: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-accent) 30%, transparent)',
  },
  fraca: {
    cor: 'var(--color-danger)',
    fundo: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-danger) 30%, transparent)',
  },
  novo: {
    cor: 'var(--color-warning)',
    fundo: 'color-mix(in srgb, var(--color-warning) 12%, transparent)',
    borda: 'color-mix(in srgb, var(--color-warning) 30%, transparent)',
  },
  ia: {
    cor: 'var(--color-accent-strong)',
    fundo: 'color-mix(in srgb, var(--color-accent-strong) 14%, transparent)',
    borda: 'color-mix(in srgb, var(--color-accent-strong) 32%, transparent)',
  },
  neutro: {
    cor: 'var(--color-text-muted)',
    fundo: 'color-mix(in srgb, var(--color-text-faint) 12%, transparent)',
    borda: 'var(--border-soft)',
  },
}

export function BadgeStatus({
  tipo = 'neutro',
  children,
  icone: Icone,
  glow = false,
}: {
  tipo?: TipoBadge
  children: ReactNode
  icone?: LucideIcon
  glow?: boolean
}) {
  const c = CORES_BADGE[tipo]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2.5px 9px',
        borderRadius: 99,
        fontFamily: 'var(--font-mono)',
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: c.cor,
        background: c.fundo,
        border: `1px solid ${c.borda}`,
        boxShadow: glow ? `0 0 10px color-mix(in srgb, ${c.cor} 22%, transparent)` : undefined,
        whiteSpace: 'nowrap',
        lineHeight: 1.3,
      }}
    >
      {Icone && <Icone size={11} color={c.cor} style={{ flexShrink: 0 }} />}
      {children}
    </span>
  )
}

// ── Barra de progresso rotulada ─────────────────────────────────────────────
// Ex.: "DOMÍNIO COGNITIVO ............ 82%" + barra com glow.
export function BarraRotulada({
  rotulo,
  valor,
  pct,
  cor = 'var(--color-accent)',
  reduzirMovimento,
}: {
  rotulo: string
  valor?: string
  pct: number
  cor?: string
  reduzirMovimento?: boolean
}) {
  const largura = Math.min(100, Math.max(2, pct))
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}
        >
          {rotulo}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: cor }}>
          {valor ?? `${pct}%`}
        </span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 99,
          background: 'color-mix(in srgb, var(--color-bg-base) 70%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
          overflow: 'hidden',
          padding: 1,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${largura}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, var(--color-accent-dim) 0%, ${cor} 70%, var(--color-accent-strong) 100%)`,
            boxShadow: `0 0 10px color-mix(in srgb, ${cor} 45%, transparent)`,
            transition: reduzirMovimento ? undefined : 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  )
}

// ── Anel de progresso radial ────────────────────────────────────────────────
export function AnelProgresso({
  pct,
  tamanho = 44,
  espessura = 3,
  cor = 'var(--color-accent)',
}: {
  pct: number
  tamanho?: number
  espessura?: number
  cor?: string
}) {
  const r = (tamanho - espessura) / 2
  const circ = 2 * Math.PI * r
  const off = circ * (1 - Math.min(100, Math.max(0, pct)) / 100)
  return (
    <div style={{ position: 'relative', width: tamanho, height: tamanho, flexShrink: 0 }}>
      <svg width={tamanho} height={tamanho} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--color-bg-base) 60%, transparent)"
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeDasharray={circ}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: tamanho * 0.22,
          fontWeight: 700,
          color: cor,
        }}
      >
        {pct}%
      </span>
    </div>
  )
}

// ── Rodapé-métrica ──────────────────────────────────────────────────────────
// Linha fina com borda superior: ícone + texto mono (ex. "+15% vs semana ant.").
export function RodapeMetrica({
  icone: Icone,
  children,
  cor = 'var(--color-accent)',
}: {
  icone?: LucideIcon
  children: ReactNode
  cor?: string
}) {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: cor,
      }}
    >
      {Icone && <Icone size={13} color={cor} style={{ flexShrink: 0 }} />}
      {children}
    </div>
  )
}
