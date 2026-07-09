import { TrendingUp, Target } from 'lucide-react'
import { Cartao } from '@core/components/ui/primitivos'
import { RotuloClinico, RodapeMetrica } from '@core/components/ui/hud'
import type { DiaRitmo } from '@core/anima/ritmo'

interface Props {
  dias: DiaRitmo[]
  reduzirMovimento: boolean
  onClick: () => void
}

const LETRA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/** Letra do dia da semana a partir de 'YYYY-MM-DD' (parse local, sem drift de fuso). */
function letraDia(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return LETRA_SEMANA[new Date(a, m - 1, d).getDay()]
}

/**
 * "Rendimento Semanal" — espelha o módulo de StatsMolecules do AI Studio:
 * rótulo clínico + valor mono, meta, gráfico de colunas e rodapé-métrica.
 * Deriva dos últimos 7 dias reais de ritmo (@core/anima/ritmo).
 */
export function CartaoProgressoSemanal({ dias, reduzirMovimento, onClick }: Props) {
  const semana = dias.slice(-7)
  const ativos = semana.filter((d) => d.intensidade > 0).length
  const pct = semana.length ? Math.round((ativos / 7) * 100) : 0

  return (
    <Cartao onClick={onClick} cor="var(--color-accent)" style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -60,
          right: -30,
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 66%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <RotuloClinico cor="var(--color-text-muted)" style={{ marginBottom: 6 }}>
              Rendimento semanal
            </RotuloClinico>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>Dias ativos na semana</p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: 'var(--color-accent-strong)', lineHeight: 1, textShadow: '0 0 12px var(--color-accent-glow)' }}>
            {pct}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-muted)' }}>
          <Target size={14} color="var(--color-accent-strong)" />
          <span>{ativos} dias ativos de 7</span>
        </div>

        {/* Gráfico de colunas — 7 dias reais */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64, marginTop: 20 }}>
          {semana.map((d, i) => {
            const altura = Math.max(8, d.intensidade * 100)
            const ativo = d.intensidade > 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div
                  style={{
                    width: '100%',
                    height: 48,
                    display: 'flex',
                    alignItems: 'flex-end',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'color-mix(in srgb, var(--color-bg-base) 50%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 55%, transparent)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${altura}%`,
                      minHeight: 4,
                      background: ativo
                        ? 'linear-gradient(180deg, var(--color-accent), var(--color-accent-dim))'
                        : 'color-mix(in srgb, var(--color-text-faint) 25%, transparent)',
                      boxShadow: ativo ? '0 0 8px var(--color-accent-glow)' : 'none',
                      transition: reduzirMovimento ? undefined : 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: d.ehHoje ? 'var(--color-accent)' : 'var(--color-text-faint)',
                    fontWeight: d.ehHoje ? 700 : 400,
                  }}
                >
                  {letraDia(d.data)}
                </span>
              </div>
            )
          })}
        </div>

        <RodapeMetrica icone={TrendingUp} cor="var(--color-accent-strong)">
          {ativos > 0 ? 'Constância ativa nesta semana' : 'Comece hoje sua sequência'}
        </RodapeMetrica>
      </div>
    </Cartao>
  )
}
