import { useEffect, useState } from 'react'
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos'
import { calcularMetricas } from '@core/anima/metricas'
import { calcularZonas, type ZonaCorpo, type ZonaId } from '@core/anima/corpo'
import { calcularOnda, continuidadeAtual, type DiaRitmo } from '@core/anima/ritmo'
import { distribuir, NOME_NIVEL, ICONE_NIVEL, type NivelMaestria } from '@core/anima/maestria'
import { db } from '@core/db/database'
import { useUIStore } from '@core/store/uiStore'
import { useDescobertasStore } from '@core/store/descobertasStore'
import { CorpoIluminado } from '@med/components/corpo/CorpoIluminado'
import { RitmoOnda } from '@med/components/corpo/RitmoOnda'

export function CorpoPage() {
  const { reduzirMovimento } = useUIStore()
  const { descobertas, carregar: carregarDescobertas } = useDescobertasStore()
  const [zonas, setZonas] = useState<ZonaCorpo[]>([])
  const [zonaFoco, setZonaFoco] = useState<ZonaId | null>(null)
  const [dias, setDias] = useState<DiaRitmo[]>([])
  const [distMaestria, setDistMaestria] = useState<ReturnType<typeof distribuir> | null>(null)

  useEffect(() => {
    calcularMetricas().then((m) => setZonas(calcularZonas(m.porDisciplina)))
    calcularOnda().then(setDias)
    db.progresso.toArray().then((p) => setDistMaestria(distribuir(p)))
    carregarDescobertas()
  }, [carregarDescobertas])

  const zonaSelecionada = zonaFoco ? zonas.find((z) => z.id === zonaFoco) : null
  const ritmo = dias.length ? continuidadeAtual(dias) : 0

  return (
    <Pagina largura={880}>
      <CabecalhoPagina titulo="O Corpo" subtitulo="Cada zona acende por domínio real — não por tempo estudado." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start', marginBottom: 40 }}>
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
          }}
        >
          <CorpoIluminado zonas={zonas} reduzirMovimento={reduzirMovimento} zonaFoco={zonaFoco} onZonaClick={(id) => setZonaFoco((z) => (z === id ? null : id))} />
        </div>

        <div>
          {zonaSelecionada ? (
            <div style={{ animation: 'entrarBaixo 0.2s ease' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                {zonaSelecionada.rotulo}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {zonaSelecionada.percentual}%
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {zonaSelecionada.totalBlocos} blocos nesta região · disciplinas: {zonaSelecionada.disciplinas.join(', ') || '—'}
              </p>
            </div>
          ) : (
            <FalaAnima texto="Toque numa zona do corpo para ver o que ela sabe de você." />
          )}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {zonas
              .slice()
              .sort((a, b) => b.percentual - a.percentual)
              .map((z) => (
                <button
                  key={z.id}
                  onClick={() => setZonaFoco((cur) => (cur === z.id ? null : z.id))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: zonaFoco === z.id ? 'var(--color-accent-glow)' : 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1 }}>{z.rotulo}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>{z.percentual}%</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Árvore de Maestria */}
      {distMaestria && distMaestria.total > 0 && (
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Árvore de Maestria
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10 }}>
            {([1, 2, 3, 4, 5] as NivelMaestria[]).map((n) => {
              const c = distMaestria.contagem[n]
              const p = distMaestria.total ? Math.round((c / distMaestria.total) * 100) : 0
              return (
                <div
                  key={n}
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 22, color: n === 5 ? 'var(--color-accent)' : 'var(--color-text-secondary)', marginBottom: 6 }}>
                    {ICONE_NIVEL[n]}
                  </div>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>{c}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--color-text-muted)' }}>{NOME_NIVEL[n]}</p>
                  <div style={{ height: 3, background: 'var(--color-bg-hover)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: 'var(--color-accent)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Ritmo (streak reimaginada) */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
            Ritmo — 30 dias
          </p>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{ritmo} {ritmo === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          {dias.length > 0 ? (
            <RitmoOnda dias={dias} reduzirMovimento={reduzirMovimento} />
          ) : (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Ainda sem ritmo registrado.</p>
          )}
        </div>
      </section>

      {/* Marcos de Descoberta */}
      {descobertas.length > 0 && (
        <section>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }}>
            Marcos de Descoberta
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {descobertas.slice(0, 8).map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '2px solid var(--color-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                  "{d.narrativa}"
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {new Date(d.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </Pagina>
  )
}
