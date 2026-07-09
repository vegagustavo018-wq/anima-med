interface Props {
  /** 0–1, quanto o organismo "brilha" — usado como proxy de progresso */
  intensidade?: number
  reduzirMovimento: boolean
  tamanho?: number
}

/**
 * Elemento decorativo do hero — uma célula/ovócito orgânico em CSS+SVG puro.
 * Membrana translúcida, anéis concêntricos que pulsam, ramificações sinápticas,
 * um satélite em órbita lenta e um núcleo bioluminescente que respira.
 * Mesma linguagem de FundoVivo/CorpoIluminado; nada disso é imagem raster.
 */
export function OrganismoHero({ intensidade = 0.6, reduzirMovimento, tamanho = 260 }: Props) {
  const nucleoOpac = 0.55 + intensidade * 0.4
  const anelDelay = ['0s', '0.6s', '1.2s']

  const ramos = [18, 62, 108, 154, 198, 242, 286, 330].map((ang, i) => {
    const rad = (ang * Math.PI) / 180
    const comprimento = 62 + ((i * 37) % 42)
    const x2 = 130 + Math.cos(rad) * comprimento
    const y2 = 130 + Math.sin(rad) * comprimento
    return { x1: 130 + Math.cos(rad) * 40, y1: 130 + Math.sin(rad) * 40, x2, y2 }
  })

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: tamanho,
        height: tamanho,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Glow ambiente por trás de tudo */}
      <div
        style={{
          position: 'absolute',
          inset: '-22%',
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 66%)',
          filter: 'blur(8px)',
          animation: reduzirMovimento ? undefined : 'respirar 5.5s ease-in-out infinite',
        }}
      />

      <svg viewBox="0 0 260 260" width="100%" height="100%" style={{ position: 'relative' }}>
        <defs>
          <radialGradient id="heroNucleo" cx="46%" cy="40%" r="62%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.92} />
            <stop offset="32%" stopColor="var(--color-accent)" stopOpacity={0.88} />
            <stop offset="72%" stopColor="var(--color-accent-strong)" stopOpacity={0.34} />
            <stop offset="100%" stopColor="var(--color-accent-dim)" stopOpacity={0.08} />
          </radialGradient>
          <radialGradient id="heroMembrana" cx="50%" cy="46%" r="55%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0} />
            <stop offset="82%" stopColor="var(--color-accent)" stopOpacity={0.05} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.14} />
          </radialGradient>
          <filter id="heroGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ramificações — sinapses finas saindo do núcleo */}
        <g stroke="var(--color-border-accent)" strokeWidth={1} opacity={0.55}>
          {ramos.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
        <g fill="var(--color-accent)">
          {ramos.map((r, i) => (
            <circle
              key={i}
              cx={r.x2}
              cy={r.y2}
              r={2.4}
              opacity={0.55}
              style={
                reduzirMovimento
                  ? undefined
                  : { animation: `cintilar ${5 + (i % 4)}s ease-in-out infinite`, animationDelay: `${i * 0.55}s` }
              }
            />
          ))}
        </g>

        {/* Membrana — o corpo translúcido da célula */}
        <circle cx={130} cy={130} r={96} fill="url(#heroMembrana)" />

        {/* Anéis concêntricos — pulsam em cascata */}
        {[56, 76, 96].map((r, i) => (
          <circle
            key={r}
            cx={130}
            cy={130}
            r={r}
            fill="none"
            stroke="var(--color-border-accent)"
            strokeWidth={1}
            opacity={0.38 - i * 0.09}
            style={
              reduzirMovimento
                ? undefined
                : { animation: `pulso ${3.6 + i * 0.5}s ease-in-out infinite`, animationDelay: anelDelay[i] }
            }
          />
        ))}

        {/* Órbita pontilhada + satélite — deriva lentíssima ao redor da célula */}
        <g
          style={
            reduzirMovimento
              ? undefined
              : { animation: 'girar 46s linear infinite', transformOrigin: '50% 50%', transformBox: 'view-box' }
          }
        >
          <circle
            cx={130}
            cy={130}
            r={114}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={0.8}
            strokeDasharray="1.5 7"
            opacity={0.4}
          />
          <circle cx={130} cy={16} r={3.4} fill="var(--color-accent)" filter="url(#heroGlow)" opacity={0.9} />
          <circle cx={222} cy={186} r={2} fill="var(--color-accent-strong)" opacity={0.65} />
        </g>

        {/* Núcleo — o ovócito central, bioluminescente */}
        <circle cx={130} cy={130} r={38} fill="url(#heroNucleo)" filter="url(#heroGlow)" opacity={nucleoOpac} />
        <circle cx={121} cy={119} r={9} fill="#ffffff" opacity={0.5} />
        <circle
          cx={130}
          cy={130}
          r={44}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={0.8}
          opacity={0.35}
        />
      </svg>
    </div>
  )
}
