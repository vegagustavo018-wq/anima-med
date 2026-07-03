import { useLiveQuery } from 'dexie-react-hooks'
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos'
import { montarPainelMemoria } from '@core/anima/memoria'

export function MemoriaPage() {
  // uma única leitura das tabelas → os três painéis (evita 3 varreduras concorrentes)
  const painel = useLiveQuery(() => montarPainelMemoria(30), [])
  const carga = painel?.carga
  const massa = painel?.massa
  const prontidao = painel?.prontidao

  const maxCarga = carga ? Math.max(1, ...carga.map((d) => d.total)) : 1

  return (
    <Pagina largura={920}>
      <CabecalhoPagina
        titulo="Memória & Prontidão"
        subtitulo="A massa viva do que você sabe, a carga que vem pela frente, e o quanto você está pronto."
      />

      {/* Prontidão */}
      {prontidao && (
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            padding: '22px 24px',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <Gauge score={prontidao.score} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Prontidão para a prova
              </p>
              {prontidao.diasAteProva != null && (
                <span style={{ fontSize: 12, color: 'var(--color-warning)', fontWeight: 700 }}>
                  {prontidao.provaTitulo} em {prontidao.diasAteProva}d
                </span>
              )}
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {prontidao.veredito}
            </p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <SubScore label="domínio" pct={prontidao.dominioPct} />
              <SubScore label="acerto em questões" pct={prontidao.acertoQuestoesPct} />
              <SubScore label="backlog vencido" pct={prontidao.vencidosPct} invertido />
            </div>
          </div>
        </div>
      )}

      {/* Massa de memória */}
      {massa && (
        <div style={{ display: 'flex', gap: 18, marginBottom: 26, flexWrap: 'wrap' }}>
          <Metrica valor={massa.massa} rotulo="massa de memória (dias-item)" />
          <Metrica valor={massa.itensVivos} rotulo="itens vivos" />
          <Metrica valor={`${Math.round(massa.retencaoEstim * 100)}%`} rotulo="retenção estimada" cor="var(--color-success)" />
          <Metrica valor={massa.vencidos} rotulo="vencidos agora" cor={massa.vencidos ? 'var(--color-warning)' : undefined} />
        </div>
      )}

      {/* Heatmap de carga futura */}
      <section>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
          Carga dos próximos 30 dias
        </p>
        {carga && carga.every((d) => d.total === 0) ? (
          <FalaAnima texto="Nada agendado ainda. Conforme você estuda e resolve questões, eu distribuo as revisões aqui — para você nunca ver tudo vencer de uma vez." />
        ) : (
          carga && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 130, padding: '0 2px' }}>
              {carga.map((d, i) => {
                const h = Math.round((d.total / maxCarga) * 110)
                const dia = new Date(d.data)
                const hoje = i === 0
                return (
                  <div key={d.data} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${d.data}: ${d.blocos} blocos + ${d.questoes} questões`}>
                    <div
                      style={{
                        width: '100%',
                        height: Math.max(2, h),
                        borderRadius: 3,
                        background: hoje
                          ? 'var(--color-warning)'
                          : d.total === 0
                            ? 'var(--color-border)'
                            : `color-mix(in srgb, var(--color-accent) ${40 + (d.total / maxCarga) * 60}%, transparent)`,
                      }}
                    />
                    {i % 5 === 0 && (
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>{dia.getDate()}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </section>
    </Pagina>
  )
}

function Gauge({ score }: { score: number }) {
  const cor = score >= 75 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
  const r = 44
  const circ = 2 * Math.PI * r
  const off = circ * (1 - score / 100)
  return (
    <div style={{ position: 'relative', width: 108, height: 108, flexShrink: 0 }}>
      <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--color-bg-hover)" strokeWidth="8" />
        <circle cx="54" cy="54" r={r} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: cor }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>/ 100</span>
      </div>
    </div>
  )
}

function SubScore({ label, pct, invertido }: { label: string; pct: number; invertido?: boolean }) {
  const v = Math.round(pct * 100)
  const bom = invertido ? v <= 20 : v >= 60
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: bom ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{v}%</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}

function Metrica({ valor, rotulo, cor }: { valor: string | number; rotulo: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', minWidth: 130 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }}>{valor}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{rotulo}</div>
    </div>
  )
}
