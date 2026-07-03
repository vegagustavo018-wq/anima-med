import { useEffect, useState } from 'react'
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos'
import { calcularMetricas, type MetricasGerais } from '@core/anima/metricas'
import { diagnosticarErros, type DiagnosticoErros } from '@core/anima/erros'
import { calcularCircadiano, melhorFaixa, DIAS, type CelulaCircadiana } from '@core/anima/circadiano'
import { gerarRetrospectiva, type Retrospectiva } from '@core/anima/retrospectiva'
import { db } from '@core/db/database'
import { baixarBackup } from '@core/db/backup'

const FAIXAS_HORA = [
  { label: '00–04h', ini: 0, fim: 4 },
  { label: '04–08h', ini: 4, fim: 8 },
  { label: '08–12h', ini: 8, fim: 12 },
  { label: '12–16h', ini: 12, fim: 16 },
  { label: '16–20h', ini: 16, fim: 20 },
  { label: '20–24h', ini: 20, fim: 24 },
]

export function SinaisPage() {
  const [m, setM] = useState<MetricasGerais | null>(null)
  const [erros, setErros] = useState<DiagnosticoErros | null>(null)
  const [circadiano, setCircadiano] = useState<CelulaCircadiana[]>([])
  const [retro, setRetro] = useState<Retrospectiva | null>(null)
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana')
  const [saturacaoConexoes, setSaturacaoConexoes] = useState(0)

  useEffect(() => {
    calcularMetricas().then(setM)
    diagnosticarErros().then(setErros)
    calcularCircadiano().then(setCircadiano)
    db.blocos.toArray().then((blocos) => {
      if (!blocos.length) return
      const comConexao = blocos.filter(
        (b) => b.conexoes.prerequisitos.length + b.conexoes.futuras.length + b.conexoes.laterais.length > 0
      ).length
      setSaturacaoConexoes(Math.round((comConexao / blocos.length) * 100))
    })
  }, [])

  useEffect(() => {
    gerarRetrospectiva(periodo).then(setRetro)
  }, [periodo])

  if (!m) return <Pagina><p style={{ color: 'var(--color-text-muted)' }}>Lendo os sinais...</p></Pagina>

  const faixaBoa = melhorFaixa(circadiano)
  const maxContagem = Math.max(1, ...circadiano.map((c) => c.contagem))

  return (
    <Pagina largura={980}>
      <CabecalhoPagina
        titulo="Sinais Vitais"
        subtitulo="A linguagem clínica que você já domina, aplicada a você mesmo."
        acao={
          <button onClick={() => baixarBackup()} style={botaoLeve}>
            ↓ Prontuário do organismo
          </button>
        }
      />

      {/* Monitor de sinais vitais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        <SinalVital
          rotulo="Frequência de retenção"
          valor={`${m.percentualDominio}%`}
          status={m.percentualDominio >= 70 ? 'normal' : m.percentualDominio >= 40 ? 'atencao' : 'alerta'}
          descricao="blocos em domínio ≥ revisando"
        />
        <SinalVital
          rotulo="Pressão de calibração"
          valor={m.calibracao != null ? `${m.calibracao}%` : '—'}
          status={m.calibracao == null ? 'sem-dados' : m.calibracao >= 75 ? 'normal' : m.calibracao >= 50 ? 'atencao' : 'alerta'}
          descricao="confiança alta que se confirmou"
        />
        <SinalVital
          rotulo="Saturação de conexões"
          valor={`${saturacaoConexoes}%`}
          status={saturacaoConexoes >= 60 ? 'normal' : saturacaoConexoes >= 30 ? 'atencao' : 'alerta'}
          descricao="do acervo já tem conexões declaradas"
        />
        <SinalVital
          rotulo="Cards vencidos"
          valor={m.vencidos}
          status={m.vencidos === 0 ? 'normal' : m.vencidos <= 10 ? 'atencao' : 'alerta'}
          descricao="aguardando revisão agora"
        />
      </div>

      {/* Retrospectiva narrada */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }}>
            Retrospectiva
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['semana', 'mes'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 99,
                  border: `1px solid ${periodo === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: periodo === p ? 'var(--color-accent-glow)' : 'transparent',
                  color: periodo === p ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {p === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
        {retro && <FalaAnima texto={retro.narrativa} grande />}
      </section>

      {/* Diário de Erros Diagnósticos */}
      {erros && erros.totalErros > 0 && (
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Diário de Erros Diagnósticos
          </p>
          {erros.fraseDiagnostico && (
            <div style={{ marginBottom: 16 }}>
              <FalaAnima texto={erros.fraseDiagnostico} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Por disciplina</p>
              {erros.porDisciplina.map((p) => (
                <BarraPadrao key={p.chave} rotulo={p.rotulo} percentual={p.percentual} contagem={p.contagem} />
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Por tipo de raciocínio</p>
              {erros.porTipoCard.map((p) => (
                <BarraPadrao key={p.chave} rotulo={p.rotulo.replace(/_/g, ' ')} percentual={p.percentual} contagem={p.contagem} />
              ))}
              {erros.porTipoCard.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Ainda sem dados por tipo.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ritmo circadiano */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          Ritmo Circadiano
        </p>
        {faixaBoa && (
          <div style={{ marginBottom: 16 }}>
            <FalaAnima texto={faixaBoa} />
          </div>
        )}
        {circadiano.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: 4 }} />
                  {FAIXAS_HORA.map((f) => (
                    <th key={f.label} style={{ padding: 4, color: 'var(--color-text-muted)', fontWeight: 400 }}>{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIAS.map((dia, diaIdx) => (
                  <tr key={dia}>
                    <td style={{ padding: 4, color: 'var(--color-text-muted)', textAlign: 'right', paddingRight: 8 }}>{dia}</td>
                    {FAIXAS_HORA.map((f) => {
                      const cels = circadiano.filter((c) => c.diaSemana === diaIdx && c.hora >= f.ini && c.hora < f.fim)
                      const contagem = cels.reduce((s, c) => s + c.contagem, 0)
                      const acertos = cels.reduce((s, c) => s + c.acertos, 0)
                      const intensidade = contagem / maxContagem
                      const taxa = contagem ? acertos / contagem : 0
                      return (
                        <td key={f.label} style={{ padding: 3 }}>
                          <div
                            title={contagem ? `${contagem} revisões, ${Math.round(taxa * 100)}% acerto` : 'sem dados'}
                            style={{
                              width: 32,
                              height: 20,
                              borderRadius: 4,
                              background: contagem === 0 ? 'var(--color-bg-card)' : `rgba(79, 209, 197, ${0.15 + intensidade * 0.7})`,
                              border: '1px solid var(--color-border)',
                            }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Ainda sem dados suficientes de horário.</p>
        )}
      </section>
    </Pagina>
  )
}

function SinalVital({
  rotulo,
  valor,
  status,
  descricao,
}: {
  rotulo: string
  valor: string | number
  status: 'normal' | 'atencao' | 'alerta' | 'sem-dados'
  descricao: string
}) {
  const cor = {
    normal: 'var(--color-success)',
    atencao: 'var(--color-warning)',
    alerta: 'var(--color-danger)',
    'sem-dados': 'var(--color-text-muted)',
  }[status]
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: `1px solid ${status === 'alerta' ? cor : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: cor }} />
      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rotulo}</p>
      <p style={{ margin: '6px 0 2px', fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{valor}</p>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-secondary)' }}>{descricao}</p>
    </div>
  )
}

function BarraPadrao({ rotulo, percentual, contagem }: { rotulo: string; percentual: number; contagem: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{rotulo}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{contagem}</span>
      </div>
      <div style={{ height: 5, background: 'var(--color-bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentual}%`, background: 'var(--color-warning)' }} />
      </div>
    </div>
  )
}

const botaoLeve: React.CSSProperties = {
  padding: '8px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text-secondary)',
  fontSize: 12,
  cursor: 'pointer',
}
