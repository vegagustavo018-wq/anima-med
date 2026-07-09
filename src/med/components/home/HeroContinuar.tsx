import { Activity } from 'lucide-react'
import { BotaoCTA } from '@core/components/ui/primitivos'
import { OrganismoHero } from './OrganismoHero'

interface Props {
  titulo: string
  progresso: number // 0-100
  dominados: number
  ultimoAcessoLabel: string
  marcados: number
  reduzirMovimento: boolean
  onContinuar: () => void
}

export function HeroContinuar({
  titulo,
  progresso,
  dominados,
  ultimoAcessoLabel,
  marcados,
  reduzirMovimento,
  onContinuar,
}: Props) {
  return (
    <div
      className="home-hero"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
        padding: '40px 44px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-card)) 0%, var(--color-bg-card) 38%, var(--color-bg-elevated) 100%)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        border: '1px solid var(--color-border-accent)',
        boxShadow:
          '0 28px 70px rgba(0,0,0,0.42), 0 2px 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.03) inset',
      }}
    >
      {/* Halo teal ambiente vazando do canto — dá profundidade cinematográfica */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-40%',
          right: '-8%',
          width: 420,
          height: 420,
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 62%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
          }}
        >
          Continuar de onde parei
        </p>
        <h2
          style={{
            margin: '12px 0 22px',
            fontSize: 'clamp(22px, 2.6vw, 28px)',
            fontWeight: 700,
            lineHeight: 1.22,
            letterSpacing: '-0.01em',
            color: 'var(--color-text-primary)',
            maxWidth: 480,
          }}
        >
          {titulo}
        </h2>

        {/* Barra de progresso */}
        <div style={{ marginBottom: 22, maxWidth: 420 }}>
          <div
            style={{
              height: 7,
              borderRadius: 99,
              background: 'var(--color-bg-hover)',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(3, progresso))}%`,
                borderRadius: 99,
                background:
                  'linear-gradient(90deg, var(--color-accent-dim) 0%, var(--color-accent) 62%, var(--color-accent-strong) 100%)',
                boxShadow: '0 0 14px var(--color-accent-glow), 0 0 4px var(--color-accent)',
                transition: reduzirMovimento ? undefined : 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
            {progresso}% do domínio geral
          </p>
        </div>

        {/* Microdados */}
        <div style={{ display: 'flex', gap: 28, marginBottom: 26, flexWrap: 'wrap' }}>
          <Micro valor={dominados} rotulo={dominados === 1 ? 'bloco dominado' : 'blocos dominados'} />
          <Divisor />
          <Micro valor={ultimoAcessoLabel} rotulo="Último acesso" />
          <Divisor />
          <Micro valor={marcados} rotulo={marcados === 1 ? 'tópico marcado' : 'tópicos marcados'} />
        </div>

        <BotaoCTA onClick={onContinuar}>Continuar →</BotaoCTA>
      </div>

      <div
        className="home-hero-art"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
      >
        <OrganismoHero intensidade={progresso / 100} reduzirMovimento={reduzirMovimento} tamanho={240} />
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 99,
            border: '1px solid var(--border-soft)',
            background: 'color-mix(in srgb, var(--color-bg-card) 55%, transparent)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.08em',
            color: 'var(--color-text-faint)',
          }}
        >
          <Activity size={11} color="var(--color-accent)" />
          ORGANISMO_ATIVO · DOMÍNIO {progresso}%
        </div>
      </div>
    </div>
  )
}

function Micro({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
        {valor}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--color-text-muted)' }}>{rotulo}</p>
    </div>
  )
}

function Divisor() {
  return <div aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border)' }} />
}
