import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina } from '@core/components/ui/primitivos'
import { construirGrafoGlobal, type GrafoGlobal } from '@core/anima/grafo'
import { useUIStore } from '@core/store/uiStore'

const CORES = ['#9f7aea', '#4fd1c5', '#68d391', '#f6ad55', '#fc8181', '#63b3ed', '#76e4f7', '#e05f8f']

function corDisciplina(disciplina: string, disciplinas: string[]): string {
  const i = disciplinas.indexOf(disciplina)
  return CORES[i % CORES.length]
}

const COR_STATUS: Record<string, number> = { dominado: 1, revisando: 0.85, aprendendo: 0.6, novo: 0.3 }

export function GrafoPage() {
  const navigate = useNavigate()
  const { reduzirMovimento } = useUIStore()
  const [grafo, setGrafo] = useState<GrafoGlobal | null>(null)
  const [zoom, setZoom] = useState(1)
  const [discFiltro, setDiscFiltro] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)

  useEffect(() => {
    construirGrafoGlobal().then(setGrafo)
  }, [])

  const nosVisiveis = useMemo(() => {
    if (!grafo) return []
    return discFiltro ? grafo.nos.filter((n) => n.disciplina === discFiltro) : grafo.nos
  }, [grafo, discFiltro])

  if (!grafo) return <Pagina><p style={{ color: 'var(--color-text-muted)' }}>Mapeando o organismo...</p></Pagina>

  const idsVisiveis = new Set(nosVisiveis.map((n) => n.id))
  const arestasVisiveis = grafo.arestas.filter((a) => idsVisiveis.has(a.de) && idsVisiveis.has(a.para))
  const noPorId = new Map(grafo.nos.map((n) => [n.id, n]))

  const W = 700
  const H = 700

  return (
    <Pagina largura={1100}>
      <CabecalhoPagina titulo="Grafo Global" subtitulo="A constelação do que você já sabe — e do que ainda é escuro." />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => setDiscFiltro(null)}
          style={{
            padding: '5px 12px',
            borderRadius: 99,
            border: `1px solid ${!discFiltro ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: !discFiltro ? 'var(--color-accent-glow)' : 'transparent',
            color: !discFiltro ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Tudo
        </button>
        {grafo.disciplinas.map((d) => (
          <button
            key={d}
            onClick={() => setDiscFiltro(discFiltro === d ? null : d)}
            style={{
              padding: '5px 12px',
              borderRadius: 99,
              border: `1px solid ${discFiltro === d ? corDisciplina(d, grafo.disciplinas) : 'var(--color-border)'}`,
              background: discFiltro === d ? `${corDisciplina(d, grafo.disciplinas)}22` : 'transparent',
              color: discFiltro === d ? corDisciplina(d, grafo.disciplinas) : 'var(--color-text-muted)',
              fontSize: 11,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6 }}>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))} style={zoomBtn}>−</button>
          <button onClick={() => setZoom(1)} style={zoomBtn}>⟲</button>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} style={zoomBtn}>+</button>
        </div>
        <svg viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} width={W * zoom} height={H * zoom} role="img" aria-label="Grafo global de domínio">
          <defs>
            <filter id="grafoGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Setores de disciplina — anéis guia sutis */}
          {[70, 150, 220, 290].map((r) => (
            <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="var(--color-border)" strokeOpacity={0.3} strokeDasharray="2 4" />
          ))}

          {/* Arestas */}
          {arestasVisiveis.map((a, i) => {
            const de = noPorId.get(a.de)
            const para = noPorId.get(a.para)
            if (!de || !para) return null
            return (
              <line
                key={i}
                x1={de.x}
                y1={de.y}
                x2={para.x}
                y2={para.y}
                stroke={a.tipo === 'arvore' ? 'var(--color-border-accent)' : 'var(--color-accent)'}
                strokeWidth={a.tipo === 'arvore' ? 1 : 0.6}
                strokeOpacity={a.tipo === 'arvore' ? 0.35 : 0.2}
              />
            )
          })}

          {/* Nós */}
          {nosVisiveis.map((n) => {
            const cor = corDisciplina(n.disciplina, grafo.disciplinas)
            const brilho = COR_STATUS[n.status] ?? 0.3
            const raio = 4 + Math.min(6, n.grau)
            const emFoco = hoverId === n.id
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId((h) => (h === n.id ? null : h))}
                onClick={() => navigate(`/bloco/${n.id}`)}
              >
                {emFoco && (
                  <circle r={raio + 6} fill="none" stroke={cor} strokeWidth={1} opacity={0.6}>
                    {!reduzirMovimento && <animate attributeName="r" values={`${raio + 4};${raio + 9};${raio + 4}`} dur="1.6s" repeatCount="indefinite" />}
                  </circle>
                )}
                <circle r={raio} fill={cor} fillOpacity={brilho} stroke={cor} strokeWidth={1} filter={brilho > 0.7 ? 'url(#grafoGlow)' : undefined} />
                {emFoco && (
                  <text y={-raio - 8} textAnchor="middle" style={{ font: '10px Inter, sans-serif', fill: 'var(--color-text-primary)' }}>
                    {n.titulo.length > 30 ? n.titulo.slice(0, 29) + '…' : n.titulo}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <p style={{ marginTop: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
        Tamanho = conexões · brilho = domínio real · zonas escuras revelam o que ainda falta explorar
      </p>
    </Pagina>
  )
}

const zoomBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  fontSize: 14,
}
