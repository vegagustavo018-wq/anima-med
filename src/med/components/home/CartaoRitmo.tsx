import { Flame, Award } from 'lucide-react'
import { Cartao } from '@core/components/ui/primitivos'
import { RotuloClinico, RodapeMetrica } from '@core/components/ui/hud'
import type { DiaRitmo } from '@core/anima/ritmo'

interface Props {
  dias: DiaRitmo[]
  streakDias: number
  reduzirMovimento: boolean
  onClick: () => void
}

const LETRA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function letraDia(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return LETRA_SEMANA[new Date(a, m - 1, d).getDay()]
}

const PROXIMO_MARCO = 15

/**
 * "Constância & Ritmo" — espelha o módulo de sequência do StatsMolecules do
 * AI Studio: rótulo clínico + badge de dias, grade semanal de chamas e
 * rodapé-métrica de próximo marco. Reaproveita @core/anima/ritmo.
 */
export function CartaoRitmo({ dias, streakDias, onClick }: Props) {
  const semana = dias.slice(-7)
  const faltam = Math.max(0, PROXIMO_MARCO - streakDias)

  return (
    <Cartao onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <RotuloClinico cor="var(--color-text-muted)" style={{ marginBottom: 6 }}>
            Constância & ritmo
          </RotuloClinico>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>Sua sequência de foco</p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 99,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--color-warning)',
            background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 22%, transparent)',
          }}
        >
          <Flame size={13} fill="currentColor" />
          {streakDias} {streakDias === 1 ? 'dia' : 'dias'}
        </span>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
        Constância diária reduz o esforço para fixar tópicos clínicos — reforço adaptativo.
      </p>

      {/* Grade semanal de chamas — 7 dias reais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 18 }}>
        {semana.map((d, i) => {
          const ativo = d.intensidade > 0
          return (
            <div
              key={i}
              style={{
                padding: '9px 0',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                background: ativo
                  ? 'color-mix(in srgb, var(--color-warning) 10%, transparent)'
                  : 'color-mix(in srgb, var(--color-bg-base) 40%, transparent)',
                border: `1px solid ${ativo ? 'color-mix(in srgb, var(--color-warning) 28%, transparent)' : 'var(--border-soft)'}`,
              }}
            >
              <Flame
                size={15}
                color={ativo ? 'var(--color-warning)' : 'var(--color-text-faint)'}
                fill={ativo ? 'currentColor' : 'none'}
                style={{ opacity: ativo ? 1 : 0.4 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: d.ehHoje ? 'var(--color-warning)' : 'var(--color-text-faint)',
                }}
              >
                {letraDia(d.data)}
              </span>
            </div>
          )
        })}
      </div>

      <RodapeMetrica icone={Award} cor="var(--color-warning)">
        {faltam > 0 ? `Próximo marco: ${PROXIMO_MARCO} dias (faltam ${faltam})` : 'Marco de constância atingido!'}
      </RodapeMetrica>
    </Cartao>
  )
}
