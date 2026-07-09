import { useEffect, useMemo, useState } from 'react'
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

const LARGURA_NO = 240
const ALTURA_NO = 76
const GAP_X = 90
const GAP_Y = 28
const MARGEM = 60

const COR_STATUS: Record<string, { borda: string; opac: number }> = {
  dominado: { borda: 'var(--color-success)', opac: 1 },
  revisando: { borda: 'var(--color-success)', opac: 0.85 },
  aprendendo: { borda: 'var(--color-accent-dim)', opac: 0.7 },
  novo: { borda: 'var(--color-border-accent)', opac: 0.55 },
  fantasma: { borda: '#3a4a63', opac: 0.4 },
}

// já visitado ao menos uma vez → conta como "trilha percorrida" no caminho de progresso
function percorrido(status: string): boolean {
  return status === 'aprendendo' || status === 'revisando' || status === 'dominado'
}

function centro(no: NoArvore) {
  return { cx: no.x + LARGURA_NO / 2, cy: no.y + ALTURA_NO / 2 }
}

// caminho ortogonal (PCB) do pai para o filho — flui da esquerda para a direita
function trilha(pai: NoArvore, filho: NoArvore): string {
  const p = centro(pai)
  const f = centro(filho)
  const x1 = pai.x + LARGURA_NO // sai da lateral direita do pai
  const x2 = filho.x // entra na lateral esquerda do filho
  const meio = (x1 + x2) / 2
  return `M ${x1},${p.cy} L ${meio},${p.cy} L ${meio},${f.cy} L ${x2},${f.cy}`
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

  // dispara a animação de "desenhar o caminho" logo após o primeiro render — usa
  // useEffect puro (não requestAnimationFrame) porque rAF fica pausado em abas
  // sem foco/visibilidade, o que travaria a trilha em abas de segundo plano.
  const [montado, setMontado] = useState(reduzirMovimento)
  useEffect(() => {
    if (reduzirMovimento) {
      setMontado(true)
      return
    }
    setMontado(false)
    const id = setTimeout(() => setMontado(true), 30)
    return () => clearTimeout(id)
  }, [raizes, reduzirMovimento])

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
  const arestas: { pai: NoArvore; filho: NoArvore; ativa: boolean; percorrida: boolean }[] = []
  for (const no of nos) {
    for (const filho of no.filhos) {
      const stFilho = statusPorId[filho.id] ?? (filho.preview ? 'novo' : 'fantasma')
      arestas.push({
        pai: no,
        filho,
        ativa: no.id === atualId || filho.id === atualId,
        percorrida: percorrido(stFilho),
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
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
            <stop offset="50%" stopColor="var(--color-accent-dim)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--color-accent-dim) 55%, black)" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="fcHalo" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fcPulso" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="color-mix(in srgb, var(--color-accent) 45%, white)" stopOpacity="0.95" />
            <stop offset="70%" stopColor="var(--color-accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
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
          {arestas.map((a, i) => {
            const corTrilha = a.ativa
              ? 'var(--color-accent)'
              : a.percorrida
                ? 'var(--color-success)'
                : 'var(--color-border-accent)'
            return (
            <g key={i}>
              <path
                d={trilha(a.pai, a.filho)}
                fill="none"
                stroke={corTrilha}
                strokeWidth={a.ativa ? 2.5 : a.percorrida ? 2.2 : 1.8}
                opacity={a.ativa ? 0.9 : a.percorrida ? 0.85 : 0.35}
                strokeDasharray={a.percorrida || a.ativa ? undefined : '3 4'}
                filter={a.ativa ? 'url(#fcGlow)' : undefined}
                pathLength={a.percorrida && !a.ativa ? 100 : undefined}
                style={
                  a.percorrida && !a.ativa
                    ? {
                        strokeDasharray: 100,
                        strokeDashoffset: montado ? 0 : 100,
                        transition: reduzirMovimento ? undefined : 'stroke-dashoffset 0.9s ease',
                      }
                    : undefined
                }
              />
              {/* pad na lateral direita do pai */}
              <circle
                cx={a.pai.x + LARGURA_NO}
                cy={centro(a.pai).cy}
                r={a.ativa ? 4 : 3}
                fill="var(--color-bg-base)"
                stroke={corTrilha}
                strokeWidth={1.5}
                style={reduzirMovimento ? undefined : { transition: 'stroke 0.5s ease' }}
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
            )
          })}

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
                  style={reduzirMovimento ? undefined : { transition: 'stroke 0.5s ease, fill 0.5s ease, opacity 0.5s ease' }}
                />

                {/* pinos laterais */}
                {!fantasma && (
                  <g stroke={cor.borda} strokeWidth={1.6} opacity={cor.opac}>
                    <line x1={-LARGURA_NO / 2} y1={0} x2={-LARGURA_NO / 2 - 5} y2={0} />
                    <line x1={LARGURA_NO / 2} y1={0} x2={LARGURA_NO / 2 + 5} y2={0} />
                  </g>
                )}

                {/* marca de concluído — canto superior direito, só em blocos dominados */}
                {st === 'dominado' && (
                  <g
                    transform={`translate(${LARGURA_NO / 2 - 12}, ${-ALTURA_NO / 2 + 12})`}
                    opacity={montado ? 1 : 0}
                    style={
                      reduzirMovimento
                        ? undefined
                        : { transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s' }
                    }
                  >
                    <circle r={8} fill="var(--color-success)" />
                    <path
                      d="M -3.5,0 L -1,2.5 L 3.5,-3"
                      fill="none"
                      stroke="var(--color-bg-base)"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* texto — quebra de linha real via foreignObject, sem truncar título */}
                <foreignObject
                  x={-LARGURA_NO / 2 + 10}
                  y={-ALTURA_NO / 2}
                  width={LARGURA_NO - 20}
                  height={ALTURA_NO}
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        font: `600 13px 'Inter', system-ui, sans-serif`,
                        lineHeight: 1.25,
                        color: fantasma ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {no.titulo}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
