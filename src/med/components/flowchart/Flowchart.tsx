import { useMemo, useState } from 'react'
import type { StatusEstudo } from '@core/types/schema'
import { calcularLayout, achatar, type NoArvore } from './arvore'

interface Props {
  raizes: NoArvore[]
  statusPorId: Record<string, StatusEstudo | 'fantasma'>
  atualId: string | null
  reduzirMovimento: boolean
  onSelecionar: (id: string) => void
  // ids que passam no filtro de nível; nós fora ficam esmaecidos. null = tudo realçado
  idsRealcados?: Set<string> | null
}

const LARGURA_NO = 156
const ALTURA_NO = 56
const GAP_X = 40
const GAP_Y = 72
const MARGEM = 60

const COR_STATUS: Record<string, { borda: string; opac: number }> = {
  dominado: { borda: 'var(--color-accent)', opac: 1 },
  revisando: { borda: 'var(--color-accent)', opac: 0.85 },
  aprendendo: { borda: 'var(--color-accent-dim)', opac: 0.7 },
  novo: { borda: 'var(--color-border-accent)', opac: 0.55 },
  fantasma: { borda: '#3a4a63', opac: 0.4 },
}

function centro(no: NoArvore) {
  return { cx: no.x + LARGURA_NO / 2, cy: no.y + ALTURA_NO / 2 }
}

// caminho ortogonal (PCB) do pai para o filho
function trilha(pai: NoArvore, filho: NoArvore): string {
  const p = centro(pai)
  const f = centro(filho)
  const y1 = pai.y + ALTURA_NO // sai da base do pai
  const y2 = filho.y // entra no topo do filho
  const meio = (y1 + y2) / 2
  return `M ${p.cx},${y1} L ${p.cx},${meio} L ${f.cx},${meio} L ${f.cx},${y2}`
}

export function Flowchart({
  raizes,
  statusPorId,
  atualId,
  reduzirMovimento,
  onSelecionar,
  idsRealcados = null,
}: Props) {
  const [zoom, setZoom] = useState(1)

  const layout = useMemo(
    () =>
      calcularLayout(raizes, {
        larguraNo: LARGURA_NO,
        alturaNo: ALTURA_NO,
        gapX: GAP_X,
        gapY: GAP_Y,
      }),
    [raizes]
  )

  const nos = useMemo(() => achatar(raizes), [raizes])

  // arestas (pai → filho)
  const arestas: { pai: NoArvore; filho: NoArvore; ativa: boolean }[] = []
  for (const no of nos) {
    for (const filho of no.filhos) {
      arestas.push({
        pai: no,
        filho,
        ativa: no.id === atualId || filho.id === atualId,
      })
    }
  }

  const W = layout.largura + MARGEM * 2
  const H = layout.altura + MARGEM * 2

  return (
    <div
      style={{
        width: '100%',
        overflow: 'auto',
        background: 'var(--color-bg-base)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
      }}
    >
      {/* Controles de zoom */}
      <div
        style={{
          position: 'sticky',
          top: 12,
          left: 12,
          zIndex: 5,
          display: 'inline-flex',
          gap: 6,
          margin: 12,
        }}
      >
        {[
          { l: '−', fn: () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2))) },
          { l: '⟲', fn: () => setZoom(1) },
          { l: '+', fn: () => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2))) },
        ].map((b) => (
          <button
            key={b.l}
            onClick={b.fn}
            style={{
              width: 32,
              height: 32,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            {b.l}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W * zoom}
        height={H * zoom}
        style={{ display: 'block', minWidth: '100%' }}
        role="tree"
        aria-label="Mapa de conceitos do tema"
      >
        <defs>
          <linearGradient id="fcLedAtivo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4fd1c5" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#2c7a7b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0d3536" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="fcHalo" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#4fd1c5" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#4fd1c5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fcPulso" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#a8ede8" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#4fd1c5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0" />
          </radialGradient>
          <filter id="fcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${MARGEM}, ${MARGEM})`}>
          {/* Trilhas */}
          {arestas.map((a, i) => (
            <g key={i}>
              <path
                d={trilha(a.pai, a.filho)}
                fill="none"
                stroke={a.ativa ? 'var(--color-accent)' : 'var(--color-border-accent)'}
                strokeWidth={a.ativa ? 2.5 : 1.8}
                opacity={a.ativa ? 0.9 : 0.4}
                filter={a.ativa ? 'url(#fcGlow)' : undefined}
              />
              {/* pad na base do pai */}
              <circle
                cx={centro(a.pai).cx}
                cy={a.pai.y + ALTURA_NO}
                r={a.ativa ? 4 : 3}
                fill="var(--color-bg-base)"
                stroke={a.ativa ? 'var(--color-accent)' : 'var(--color-border-accent)'}
                strokeWidth={1.5}
              />
              {/* pulso saltatório na aresta ativa */}
              {a.ativa && !reduzirMovimento && (
                <circle r="5" fill="url(#fcPulso)" filter="url(#fcGlow)">
                  <animateMotion dur="2s" repeatCount="indefinite" path={trilha(a.pai, a.filho)} />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0.8;0"
                    keyTimes="0;0.1;0.6;0.95;1"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          ))}

          {/* Nós */}
          {nos.map((no) => {
            const { cx, cy } = centro(no)
            const st = statusPorId[no.id] ?? (no.preview ? 'novo' : 'fantasma')
            const cor = COR_STATUS[st] ?? COR_STATUS.novo
            const ativo = no.id === atualId
            const fantasma = st === 'fantasma'
            const esmaecido = idsRealcados !== null && !idsRealcados.has(no.id)
            return (
              <g
                key={no.id}
                transform={`translate(${cx}, ${cy})`}
                opacity={esmaecido ? 0.25 : 1}
                style={{ cursor: fantasma ? 'default' : 'pointer' }}
                onClick={() => !fantasma && onSelecionar(no.id)}
                role="treeitem"
                aria-label={no.titulo}
                tabIndex={fantasma ? -1 : 0}
                onKeyDown={(e) => {
                  if (!fantasma && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onSelecionar(no.id)
                  }
                }}
              >
                {/* halo pulsante no nó atual */}
                {ativo && (
                  <ellipse rx={LARGURA_NO * 0.7} ry={ALTURA_NO * 0.95} fill="url(#fcHalo)">
                    {!reduzirMovimento && (
                      <>
                        <animate
                          attributeName="opacity"
                          values="0.6;0.95;0.6"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </ellipse>
                )}

                {/* corner marks no nó atual */}
                {ativo && (
                  <g stroke="var(--color-accent)" strokeWidth={1.5} fill="none" opacity={0.8}>
                    <path d={`M ${-LARGURA_NO / 2 - 6},${-ALTURA_NO / 2 - 4} l 5,0 M ${-LARGURA_NO / 2 - 6},${-ALTURA_NO / 2 - 4} l 0,5`} />
                    <path d={`M ${LARGURA_NO / 2 + 6},${-ALTURA_NO / 2 - 4} l -5,0 M ${LARGURA_NO / 2 + 6},${-ALTURA_NO / 2 - 4} l 0,5`} />
                    <path d={`M ${-LARGURA_NO / 2 - 6},${ALTURA_NO / 2 + 4} l 5,0 M ${-LARGURA_NO / 2 - 6},${ALTURA_NO / 2 + 4} l 0,-5`} />
                    <path d={`M ${LARGURA_NO / 2 + 6},${ALTURA_NO / 2 + 4} l -5,0 M ${LARGURA_NO / 2 + 6},${ALTURA_NO / 2 + 4} l 0,-5`} />
                  </g>
                )}

                {/* retângulo do nó */}
                <rect
                  x={-LARGURA_NO / 2}
                  y={-ALTURA_NO / 2}
                  width={LARGURA_NO}
                  height={ALTURA_NO}
                  rx={6}
                  fill={fantasma ? 'transparent' : 'url(#fcLedAtivo)'}
                  stroke={cor.borda}
                  strokeWidth={ativo ? 1.8 : 1.3}
                  strokeDasharray={fantasma || st === 'novo' ? '4 3' : undefined}
                  opacity={cor.opac}
                  filter={ativo ? 'url(#fcGlow)' : undefined}
                />

                {/* pinos laterais */}
                {!fantasma && (
                  <g stroke={cor.borda} strokeWidth={1.6} opacity={cor.opac}>
                    <line x1={-LARGURA_NO / 2} y1={0} x2={-LARGURA_NO / 2 - 5} y2={0} />
                    <line x1={LARGURA_NO / 2} y1={0} x2={LARGURA_NO / 2 + 5} y2={0} />
                  </g>
                )}

                {/* texto */}
                <text
                  textAnchor="middle"
                  y={4}
                  style={{
                    font: `600 11.5px 'Inter', system-ui, sans-serif`,
                    fill: fantasma ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    pointerEvents: 'none',
                  }}
                >
                  {truncar(no.titulo, 26)}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function truncar(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}
