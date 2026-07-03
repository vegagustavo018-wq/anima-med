import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@core/db/database'
import { Pagina, CabecalhoPagina, Badge } from '@core/components/ui/primitivos'
import { checar8Etapas, validarSchema, checarIntegridade, type ProblemaIntegridade } from '@core/autoria/validador'
import { baixarBackup, importarProgresso } from '@core/db/backup'
import { garantirPersistencia, type StatusArmazenamento } from '@core/db/storage'
import { CURRICULO } from '@med/data/curriculo'
import type { BlocoConteudo, StatusCicloVida } from '@core/types/schema'

interface LinhaInventario {
  bloco: BlocoConteudo
  score: number
  erros: number
  antiPadroes: number
}

export function StudioPage() {
  const navigate = useNavigate()
  const [linhas, setLinhas] = useState<LinhaInventario[]>([])
  const [integridade, setIntegridade] = useState<ProblemaIntegridade[]>([])
  const [armazenamento, setArmazenamento] = useState<StatusArmazenamento | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [estados, setEstados] = useState<Record<string, number>>({})
  const [backlog, setBacklog] = useState<{ sem: number; disc: string; tema: string }[]>([])

  useEffect(() => {
    ;(async () => {
      const blocos = await db.blocos.toArray()
      setLinhas(
        blocos
          .map((b) => {
            const c = checar8Etapas(b)
            return {
              bloco: b,
              score: c.score,
              erros: validarSchema(b).filter((p) => p.gravidade === 'erro').length,
              antiPadroes: c.antiPadroes.length,
            }
          })
          .sort((a, b) => a.score - b.score)
      )
      setIntegridade(checarIntegridade(blocos))
      setArmazenamento(await garantirPersistencia())

      // distribuição por estado de ciclo de vida
      const est: Record<string, number> = {}
      for (const b of blocos) est[b.estado_ciclo_vida] = (est[b.estado_ciclo_vida] ?? 0) + 1
      setEstados(est)

      // backlog: temas do currículo sem nenhum bloco
      const faltando: { sem: number; disc: string; tema: string }[] = []
      for (const s of CURRICULO) {
        for (const d of s.disciplinas) {
          for (const t of d.temas) {
            const n = await db.blocos.where('resumo_id').startsWith(t.prefixo).count()
            if (n === 0) faltando.push({ sem: s.numero, disc: d.titulo, tema: t.titulo })
          }
        }
      }
      setBacklog(faltando)
    })()
  }, [])

  const totalBlocos = linhas.length
  const scoreMedia = totalBlocos ? Math.round(linhas.reduce((s, l) => s + l.score, 0) / totalBlocos) : 0
  const comErro = linhas.filter((l) => l.erros > 0).length

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string)
        const r = await importarProgresso(json)
        setMsg(r.mensagem)
      } catch {
        setMsg('Arquivo inválido.')
      }
    }
    reader.readAsText(f)
  }

  return (
    <Pagina largura={1100}>
      <CabecalhoPagina titulo="ANIMA Studio" subtitulo="Autoria, governança e saúde do organismo." />

      {/* Painéis de saúde */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        <Painel valor={totalBlocos} rotulo="blocos no acervo" />
        <Painel valor={`${scoreMedia}%`} rotulo="score médio 8 etapas" cor={scoreMedia >= 80 ? 'var(--color-success)' : 'var(--color-warning)'} />
        <Painel valor={comErro} rotulo="blocos com erro" cor={comErro > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
        <Painel valor={integridade.length} rotulo="problemas de integridade" cor={integridade.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'} />
      </div>

      {/* Backup / dados */}
      <Secao titulo="Dados & backup">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => baixarBackup()} style={botao}>↓ Exportar progresso</button>
          <label style={{ ...botao, cursor: 'pointer' }}>
            ↑ Importar progresso
            <input type="file" accept="application/json" onChange={onImport} style={{ display: 'none' }} />
          </label>
          {armazenamento && (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Persistência: {armazenamento.persistente ? '✓ garantida' : '⚠ não garantida'}
              {armazenamento.usoMB != null && ` · ${armazenamento.usoMB} MB usados`}
            </span>
          )}
          {msg && <span style={{ fontSize: 12, color: 'var(--color-accent)' }}>{msg}</span>}
        </div>
      </Secao>

      {/* Ciclo de vida */}
      <Secao titulo="Ciclo de vida dos blocos">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ESTADOS_ORDEM.map((e) => (
            <div
              key={e}
              style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${CICLO_COR[e]}`,
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CICLO_COR[e] }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{e.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{estados[e] ?? 0}</span>
            </div>
          ))}
        </div>
      </Secao>

      {/* Backlog de produção */}
      {backlog.length > 0 && (
        <Secao titulo={`Backlog de produção — temas a nascer (${backlog.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {backlog.slice(0, 30).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                <Badge>sem {b.sem}</Badge>
                <span style={{ color: 'var(--color-text-muted)', minWidth: 160 }}>{b.disc}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{b.tema}</span>
              </div>
            ))}
            {backlog.length > 30 && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>+ {backlog.length - 30} outros temas</p>
            )}
          </div>
        </Secao>
      )}

      {/* Integridade */}
      {integridade.length > 0 && (
        <Secao titulo={`Integridade referencial (${integridade.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {integridade.slice(0, 20).map((p, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 8 }}>
                <Badge cor="var(--color-warning)">{p.tipo.replace(/_/g, ' ')}</Badge>
                <code style={{ color: 'var(--color-text-muted)' }}>{p.resumo_id}</code>
                <span>→</span>
                <code style={{ color: 'var(--color-danger)' }}>{p.alvo}</code>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {/* Inventário */}
      <Secao titulo="Inventário de blocos (piores scores primeiro)">
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {linhas.map((l) => (
            <button
              key={l.bloco.resumo_id}
              onClick={() => navigate(`/bloco/${l.bloco.resumo_id}`)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ width: 44, fontSize: 13, fontWeight: 700, color: corScore(l.score) }}>{l.score}%</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>{l.bloco.metadata.titulo}</span>
              {l.erros > 0 && <Badge cor="var(--color-danger)">{l.erros} erro</Badge>}
              {l.antiPadroes > 0 && <Badge cor="var(--color-warning)">{l.antiPadroes} anti-padrão</Badge>}
              <Badge>{l.bloco.estado_ciclo_vida}</Badge>
            </button>
          ))}
        </div>
      </Secao>
    </Pagina>
  )
}

const ESTADOS_ORDEM: StatusCicloVida[] = [
  'rascunho',
  'revisado_pelo_autor',
  'validado_cross_fonte',
  'em_uso_clinico',
  'em_revisao',
  'obsoleto',
]
const CICLO_COR: Record<StatusCicloVida, string> = {
  rascunho: 'var(--color-text-muted)',
  revisado_pelo_autor: 'var(--color-warning)',
  validado_cross_fonte: 'var(--color-info)',
  em_uso_clinico: 'var(--color-success)',
  em_revisao: 'var(--color-disc-bioquimica)',
  obsoleto: 'var(--color-danger)',
}

function corScore(s: number): string {
  if (s >= 90) return 'var(--color-success)'
  if (s >= 70) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

function Painel({ valor, rotulo, cor }: { valor: number | string; rotulo: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: cor ?? 'var(--color-accent)' }}>{valor}</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{rotulo}</p>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        {titulo}
      </p>
      {children}
    </section>
  )
}

const botao: React.CSSProperties = {
  padding: '9px 16px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text-secondary)',
  fontSize: 13,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
}
