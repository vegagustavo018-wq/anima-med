import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos'
import { montarJardim, type EstadoPlanta } from '@core/anima/jardim'
import { calcularOnda, continuidadeAtual, type DiaRitmo } from '@core/anima/ritmo'

const ICONE: Record<EstadoPlanta, string> = {
  broto: '🌱',
  crescendo: '🌿',
  florida: '🌸',
  murchando: '🥀',
}
const ROTULO: Record<EstadoPlanta, string> = {
  broto: 'brotando',
  crescendo: 'crescendo',
  florida: 'florida',
  murchando: 'precisa de água',
}

// Constância Compassiva (P30): ritmo médio de 30 dias, sem streak-culpa.
function mensagemConstancia(dias: DiaRitmo[]): { titulo: string; texto: string } {
  const ativos = dias.filter((d) => d.intensidade > 0).length
  const continuidade = continuidadeAtual(dias)
  const retomouHoje = dias[dias.length - 1]?.ehRetomada
  if (retomouHoje) {
    return { titulo: 'Você voltou', texto: 'Descansar faz parte do organismo. O importante é que você está aqui de novo — eu guardei tudo pra você.' }
  }
  if (ativos === 0) {
    return { titulo: 'Terra em repouso', texto: 'Nenhum dia ativo nos últimos 30. Sem cobrança — quando quiser, a gente rega o jardim junto.' }
  }
  if (continuidade >= 3) {
    return { titulo: `${continuidade} dias seguidos`, texto: `Seu ritmo médio foi de ${ativos} dias ativos no último mês. Constância não é nunca faltar — é sempre voltar.` }
  }
  return { titulo: `${ativos} dias ativos no mês`, texto: 'Ritmo é maré, não corrente contínua. Você está mantendo o organismo vivo — isso basta.' }
}

export function JardimPage() {
  const navigate = useNavigate()
  const jardim = useLiveQuery(() => montarJardim(), [])
  const [onda, setOnda] = useState<DiaRitmo[] | null>(null)

  useEffect(() => {
    calcularOnda().then(setOnda)
  }, [])

  const constancia = onda ? mensagemConstancia(onda) : null

  return (
    <Pagina largura={960}>
      <CabecalhoPagina
        titulo="Jardim das Sementes"
        subtitulo="Cada bloco que você estudou é uma planta. O estado dela é o estado da sua memória."
      />

      {/* Constância Compassiva */}
      {constancia && (
        <div
          style={{
            marginBottom: 24,
            padding: '18px 22px',
            background: 'var(--color-accent-glow)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {onda && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
              {onda.slice(-14).map((d) => (
                <span
                  key={d.data}
                  title={`${d.data}${d.ehRetomada ? ' · retomada' : ''}`}
                  style={{
                    width: 7,
                    height: `${20 + d.intensidade * 20}px`,
                    borderRadius: 2,
                    background: d.intensidade > 0 ? 'var(--color-accent)' : 'var(--color-border)',
                    opacity: d.ehHoje ? 1 : 0.55 + d.intensidade * 0.45,
                    outline: d.ehRetomada ? '1px solid var(--color-success)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{constancia.titulo}</p>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{constancia.texto}</p>
          </div>
        </div>
      )}

      {!jardim ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Cultivando…</p>
      ) : jardim.totalPlantas === 0 ? (
        <EstadoVazio>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🌱</div>
          <FalaAnima texto="O jardim ainda está em terra nua. Cada bloco que você estudar planta uma semente aqui — e eu cuido para que nada se perca." />
        </EstadoVazio>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 18, marginBottom: 22, flexWrap: 'wrap' }}>
            <Resumo icone="🌸" n={jardim.floridas} label="floridas" />
            <Resumo icone="🌿" n={jardim.totalPlantas - jardim.floridas - jardim.murchando - jardim.brotos} label="crescendo" />
            <Resumo icone="🌱" n={jardim.brotos} label="brotando" />
            <Resumo icone="🥀" n={jardim.murchando} label="pedindo água" cor={jardim.murchando ? 'var(--color-warning)' : undefined} />
          </div>

          {jardim.murchando > 0 && (
            <div style={{ marginBottom: 24 }}>
              <FalaAnima texto={`${jardim.murchando} ${jardim.murchando === 1 ? 'planta está murchando' : 'plantas estão murchando'} — toque nelas para regar (revisar). Nenhuma morre; só espera você.`} />
            </div>
          )}

          {jardim.canteiros.map((c) => (
            <section key={c.disciplina} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {c.disciplina} · {c.floridas}/{c.plantas.length} floridas
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 }}>
                {c.plantas.map((pl) => (
                  <button
                    key={pl.resumo_id}
                    onClick={() => navigate(`/bloco/${pl.resumo_id}`)}
                    title={`${pl.titulo} — ${ROTULO[pl.estado]}`}
                    className={pl.estado === 'murchando' ? 'anima-respira anima-lift' : 'anima-lift'}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '12px 6px',
                      border: `1px solid ${pl.estado === 'murchando' ? 'var(--color-warning)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: pl.estado === 'florida' ? 'color-mix(in srgb, var(--color-success) 8%, transparent)' : 'var(--color-bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 24, filter: pl.estado === 'murchando' ? 'grayscale(0.3)' : 'none' }} aria-hidden="true">
                      {ICONE[pl.estado]}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pl.titulo}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </Pagina>
  )
}

function Resumo({ icone, n, label, cor }: { icone: string; n: number; label: string; cor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 22 }} aria-hidden="true">{icone}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }}>{n}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</div>
      </div>
    </div>
  )
}
