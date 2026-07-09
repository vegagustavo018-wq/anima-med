interface Props {
  reduzirMovimento: boolean
  /** baixa = decoração discreta (Explorar/Estudar); alta = protagonista (Home). */
  densidade?: 'baixa' | 'media' | 'alta'
}

// Nós da rede neural — posicionados nas bordas para não competir com o texto central.
const NOS = [
  { x: 90, y: 120 },
  { x: 260, y: 60 },
  { x: 180, y: 280 },
  { x: 1050, y: 90 },
  { x: 1160, y: 240 },
  { x: 980, y: 340 },
  { x: 140, y: 640 },
  { x: 320, y: 720 },
  { x: 1120, y: 660 },
  { x: 960, y: 740 },
]

// Arestas (índices em NOS) — poucas, finas, só para sugerir sinapses.
const ARESTAS: [number, number][] = [
  [0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5], [6, 7], [8, 9], [8, 5], [1, 3],
]

const CINTILANTES = new Set([1, 4, 7, 8])

/**
 * Atmosfera decorativa reutilizável — gradientes radiais + rede neural
 * biomédica em SVG. Puramente estética (aria-hidden), atrás do conteúdo,
 * custo de runtime desprezível (SVG estático, sem JS por frame). Não
 * substitui o FundoVivo global de partículas (App.tsx) — complementa,
 * dando a cada página sua própria "respiração" de fundo.
 */
export function AnimaAtmosphere({ reduzirMovimento, densidade = 'media' }: Props) {
  const opacBlobs = densidade === 'alta' ? 1 : densidade === 'media' ? 0.6 : 0.35
  const opacRede = densidade === 'alta' ? 0.14 : densidade === 'media' ? 0.09 : 0.06
  const opacFluxo = densidade === 'alta' ? 0.22 : densidade === 'media' ? 0.14 : 0.08
  const mostrarNos = densidade !== 'baixa'

  const fagulhas = densidade === 'alta' ? [
    { top: '22%', left: '14%', delay: '0s' },
    { top: '64%', left: '78%', delay: '3s' },
    { top: '44%', left: '42%', delay: '5.5s' },
  ] : []

  return (
    <div
      aria-hidden="true"
      className="anima-textura-neural"
      style={{
        position: 'absolute',
        inset: '-60px -100px',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {densidade === 'alta' && !reduzirMovimento && <div className="anima-scanline" />}
      {!reduzirMovimento &&
        fagulhas.map((f, i) => (
          <div key={i} className="anima-fagulha" style={{ top: f.top, left: f.left, animationDelay: f.delay }} />
        ))}

      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-4%',
          width: 560,
          height: 560,
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 62%)',
          filter: 'blur(34px)',
          opacity: opacBlobs * 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '-4%',
          width: 480,
          height: 480,
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 14%, transparent) 0%, transparent 64%)',
          filter: 'blur(40px)',
          opacity: opacBlobs * 0.6,
        }}
      />

      <svg
        viewBox="0 0 1280 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="fluxoAtmosfera" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-accent)" stopOpacity={opacFluxo} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Correntes orgânicas — como linhas de fluxo num tecido vivo */}
        <g fill="none" stroke="url(#fluxoAtmosfera)" strokeWidth={1.2}>
          <path d="M-40 210 C 240 140, 420 320, 720 240 S 1180 160, 1330 250" />
          <path d="M-40 560 C 300 640, 560 480, 880 570 S 1240 660, 1330 600" opacity={0.7} />
        </g>

        {mostrarNos && (
          <>
            <g stroke="var(--color-border-accent)" strokeWidth={1} opacity={opacRede}>
              {ARESTAS.map(([a, b], i) => (
                <line key={i} x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y} />
              ))}
            </g>
            {NOS.map((n, i) => {
              const cintila = CINTILANTES.has(i) && densidade === 'alta'
              return (
                <circle
                  key={i}
                  cx={n.x}
                  cy={n.y}
                  r={cintila ? 3 : 2}
                  fill="var(--color-accent)"
                  style={
                    cintila && !reduzirMovimento
                      ? { animation: `cintilar ${6 + (i % 3) * 1.5}s ease-in-out infinite`, animationDelay: `${i * 0.7}s`, opacity: 0.4 }
                      : { opacity: opacRede * 1.6 }
                  }
                />
              )
            })}
          </>
        )}
      </svg>
    </div>
  )
}
