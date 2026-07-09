import { Zap, Flame, Bell, Sparkles } from 'lucide-react'

function periodo(): 'manha' | 'tarde' | 'noite' | 'madrugada' {
  const h = new Date().getHours()
  if (h < 5) return 'madrugada'
  if (h < 12) return 'manha'
  if (h < 18) return 'tarde'
  return 'noite'
}

function saudacaoPeriodo(): string {
  const p = periodo()
  if (p === 'manha') return 'Bom dia'
  if (p === 'tarde') return 'Boa tarde'
  if (p === 'noite') return 'Boa noite'
  return 'Ainda por aqui'
}

function rotuloEnergia(pct: number): string {
  if (pct >= 85) return 'Energia: Alta'
  if (pct >= 55) return 'Energia: Média'
  if (pct >= 40) return 'Energia: Limitada'
  return 'Energia: Baixa'
}

interface Props {
  nome: string
  energiaPct: number
  streakDias: number
  notificacoes: number
  onClickSino?: () => void
}

/**
 * Cabeçalho da Home — espelha o HomeHeader do protótipo AI Studio: saudação
 * grande com nome em acento + glow, citação em itálico com barra à esquerda, e
 * os indicadores (energia/sequência/sino) em pílulas monoespaçadas dentro de um
 * contêiner de vidro. Dados reais (energiaPct, streakDias, notificações).
 */
export function HomeHeader({ nome, energiaPct, streakDias, notificacoes, onClickSino }: Props) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 24,
        flexWrap: 'wrap',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.6vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--color-text-primary)',
            }}
          >
            {saudacaoPeriodo()},{' '}
            <span style={{ color: 'var(--color-accent)', fontWeight: 500, textShadow: '0 0 16px var(--color-accent-glow)' }}>
              {nome}
            </span>
          </h1>
          <span
            className="anima-respira"
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="var(--color-accent)" />
          </span>
        </div>
        <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: '2px solid color-mix(in srgb, var(--color-accent) 30%, transparent)' }}>
          <p style={{ margin: 0, fontSize: 14.5, fontStyle: 'italic', fontWeight: 300, lineHeight: 1.55, color: 'var(--color-text-secondary)', maxWidth: 520 }}>
            “Que seu foco e constância de hoje se tornem sua excelência de amanhã.”
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 8,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--panel)',
          backdropFilter: 'blur(14px) saturate(130%)',
          WebkitBackdropFilter: 'blur(14px) saturate(130%)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--inner-highlight)',
        }}
      >
        <PilulaHud icone={Zap} cor="var(--color-accent)">
          {rotuloEnergia(energiaPct)}
        </PilulaHud>
        <PilulaHud icone={Flame} cor="var(--color-warning)">
          {streakDias} {streakDias === 1 ? 'dia' : 'dias'}
        </PilulaHud>
        <button
          onClick={onClickSino}
          aria-label={notificacoes > 0 ? `${notificacoes} pendências` : 'Sem pendências'}
          title={notificacoes > 0 ? `${notificacoes} pendências` : 'Sem pendências'}
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-soft)',
            background: 'var(--panel-soft)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'border-color 0.18s ease, color 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-accent)'
            e.currentTarget.style.color = 'var(--color-accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-soft)'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <Bell size={16} />
          {notificacoes > 0 && (
            <span
              className="anima-respira"
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                boxShadow: '0 0 8px var(--color-accent)',
              }}
            />
          )}
        </button>
      </div>
    </header>
  )
}

function PilulaHud({
  icone: Icone,
  cor,
  children,
}: {
  icone: typeof Zap
  cor: string
  children: React.ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '8px 13px',
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        fontWeight: 700,
        color: cor,
        background: `color-mix(in srgb, ${cor} 9%, transparent)`,
        border: `1px solid color-mix(in srgb, ${cor} 22%, transparent)`,
      }}
    >
      <Icone size={14} color={cor} style={{ flexShrink: 0 }} />
      {children}
    </span>
  )
}
