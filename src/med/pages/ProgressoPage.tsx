import { useEffect, useState } from 'react'
import { Pagina, CabecalhoPagina, Grade } from '@core/components/ui/primitivos'
import { calcularMetricas, type MetricasGerais } from '@core/anima/metricas'

export function ProgressoPage() {
  const [m, setM] = useState<MetricasGerais | null>(null)

  useEffect(() => {
    calcularMetricas().then(setM)
  }, [])

  if (!m) return <Pagina><p style={{ color: 'var(--color-text-muted)' }}>Calculando...</p></Pagina>

  return (
    <Pagina largura={900}>
      <CabecalhoPagina titulo="Progresso" subtitulo="Domínio real — não blocos vistos, blocos que ficaram." />

      {/* KPIs principais */}
      <Grade min={150}>
        <Kpi valor={`${m.percentualDominio}%`} rotulo="do acervo em domínio" cor="var(--color-accent)" />
        <Kpi valor={m.streak} rotulo={m.streak === 1 ? 'dia seguido' : 'dias seguidos'} />
        <Kpi valor={m.vencidos} rotulo="vencidos hoje" cor={m.vencidos > 0 ? 'var(--color-warning)' : 'var(--color-success)'} />
        <Kpi
          valor={m.calibracao != null ? `${m.calibracao}%` : '—'}
          rotulo="calibração (confiança × acerto)"
          cor={m.calibracao != null && m.calibracao < 70 ? 'var(--color-warning)' : 'var(--color-success)'}
        />
      </Grade>

      {/* Por disciplina */}
      <section style={{ marginTop: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Por disciplina
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {m.porDisciplina.map((d) => (
            <div key={d.disciplina}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{d.disciplina}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {d.dominados}/{d.total} · {d.percentual}%
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--color-bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.percentual}%`, background: 'var(--color-accent)', transition: 'width 0.4s' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {m.iniciados === 0 && (
        <p style={{ marginTop: 32, fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
          Você ainda não começou a estudar por mim. Quando começar, é aqui que vejo você crescer.
        </p>
      )}
    </Pagina>
  )
}

function Kpi({ valor, rotulo, cor }: { valor: number | string; rotulo: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: cor ?? 'var(--color-accent)' }}>{valor}</p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{rotulo}</p>
    </div>
  )
}
