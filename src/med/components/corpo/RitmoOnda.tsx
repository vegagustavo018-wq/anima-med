import type { DiaRitmo } from '@core/anima/ritmo'

interface Props {
  dias: DiaRitmo[]
  reduzirMovimento: boolean
}

/**
 * Streak reimaginada como RITMO (bloco 8) — uma linha que ondula, não um
 * número vermelho que quebra. Dias de descanso são protegidos; a retomada
 * é celebrada tanto quanto a continuidade.
 */
export function RitmoOnda({ dias, reduzirMovimento }: Props) {
  const W = 620
  const H = 90
  const passo = W / (dias.length - 1)

  const pontos = dias.map((d, i) => {
    const x = i * passo
    const y = H - 8 - d.intensidade * (H - 24)
    return { x, y, d }
  })

  const linha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${linha} L ${W},${H} L 0,${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }} role="img" aria-label="Ritmo de estudo dos últimos 30 dias">
      <defs>
        <linearGradient id="ondaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4fd1c5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ondaGrad)" />
      <path d={linha} fill="none" stroke="var(--color-accent)" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      {pontos.map((p, i) => {
        const d = dias[i]
        if (d.intensidade === 0 && !d.ehHoje) return null
        return (
          <circle
            key={d.data}
            cx={p.x}
            cy={p.y}
            r={d.ehRetomada ? 4.5 : d.ehHoje ? 3.5 : 2.2}
            fill={d.ehRetomada ? 'var(--color-warning)' : 'var(--color-accent)'}
            opacity={d.intensidade === 0 && d.ehHoje ? 0.3 : 1}
            style={{
              animation: d.ehHoje && !reduzirMovimento ? 'pulso 2s ease-in-out infinite' : undefined,
              transformOrigin: `${p.x}px ${p.y}px`,
            }}
          />
        )
      })}
    </svg>
  )
}
