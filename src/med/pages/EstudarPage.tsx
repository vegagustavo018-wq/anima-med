import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@core/db/database'
import { type Qualidade } from '@core/srs/sm2'
import { montarFilaEstudo } from '@core/anima/fila'
import { useProgressoStore } from '@core/store/progressoStore'
import { useSessaoConfigStore, PRESETS } from '@core/store/sessaoConfigStore'
import { Pagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos'
import { filaVazia, fimDeSessao, acertoDificil } from '@core/anima/voz'
import type { BlocoConteudo, PresetSessao } from '@core/types/schema'

type Fase = 'intro' | 'confianca' | 'produzir' | 'revelado' | 'fim'
const CONFIANCAS = [
  { v: 1, label: 'Chute' },
  { v: 2, label: 'Dúvida' },
  { v: 3, label: 'Confiante' },
  { v: 4, label: 'Certeza' },
]
const QUALIDADES: { q: Qualidade; label: string; cor: string }[] = [
  { q: 0, label: 'Errei', cor: 'var(--color-danger)' },
  { q: 2, label: 'Difícil', cor: 'var(--color-warning)' },
  { q: 4, label: 'Bom', cor: 'var(--color-success)' },
  { q: 5, label: 'Fácil', cor: 'var(--color-accent)' },
]

export function EstudarPage() {
  const navigate = useNavigate()
  const { revisarBloco } = useProgressoStore()
  const { config, carregar: carregarConfigSessao, aplicarPreset } = useSessaoConfigStore()
  const [todos, setTodos] = useState<BlocoConteudo[] | null>(null)
  const [fila, setFila] = useState<BlocoConteudo[]>([])
  const [idx, setIdx] = useState(0)
  const [fase, setFase] = useState<Fase>('intro')
  const [confianca, setConfianca] = useState<number | null>(null)
  const [producao, setProducao] = useState('')
  const [revisados, setRevisados] = useState(0)
  const [flashAnima, setFlashAnima] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      // fila unificada e priorizada (atraso + leech + marcado), não mais um
      // filtro plano — os blocos mais urgentes vêm primeiro.
      const fila = await montarFilaEstudo()
      const blocos = (await db.blocos.bulkGet(fila.map((f) => f.resumo_id))).filter(
        (b): b is BlocoConteudo => !!b
      )
      setTodos(blocos)
    })()
    carregarConfigSessao()
  }, [carregarConfigSessao])

  if (todos === null) return <Pagina largura={720}><p style={{ color: 'var(--color-text-muted)' }}>Montando a fila...</p></Pagina>

  if (todos.length === 0)
    return (
      <Pagina largura={720}>
        <div style={{ paddingTop: 40 }}>
          <EstadoVazio>
            <div style={{ fontSize: 44, marginBottom: 20, color: 'var(--color-accent)' }}>✦</div>
            <FalaAnima texto={filaVazia()} />
          </EstadoVazio>
        </div>
      </Pagina>
    )

  // ── Intro: escolher tamanho da sessão (micro-sessão de resgate) ──
  if (fase === 'intro') {
    const teto = config?.teto_cards_dia
    const listaComTeto = teto ? todos.slice(0, teto) : todos
    return (
      <Pagina largura={720}>
        <div style={{ paddingTop: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 20, color: 'var(--color-accent)' }}>⬡</div>
          <p style={{ fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            {todos.length} {todos.length === 1 ? 'bloco vencido' : 'blocos vencidos'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            Sem pressa. Até uma dose pequena mantém a corrente.
          </p>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {(Object.keys(PRESETS) as PresetSessao[]).map((p) => (
              <button
                key={p}
                onClick={() => aplicarPreset(p)}
                title={PRESETS[p].descricao}
                style={{
                  padding: '5px 12px',
                  borderRadius: 99,
                  border: `1px solid ${config?.preset === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: config?.preset === p ? 'var(--color-accent-glow)' : 'transparent',
                  color: config?.preset === p ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {PRESETS[p].label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => iniciar(listaComTeto)} style={botaoPrimario}>
              Revisar {teto && teto < todos.length ? `até o teto (${teto})` : `tudo (${todos.length})`}
            </button>
            {todos.length > 3 && (
              <button onClick={() => iniciar(todos.slice(0, 3))} style={botaoSecundario}>
                Só 5 min (3)
              </button>
            )}
          </div>

          <button
            onClick={() => navigate('/leech')}
            style={{ marginTop: 24, background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Ver enfermaria de sanguessugas
          </button>
        </div>
      </Pagina>
    )
  }

  if (fase === 'fim')
    return (
      <Pagina largura={720}>
        <div style={{ paddingTop: 40 }}>
          <FalaAnima texto={fimDeSessao(revisados)} grande />
          <p style={{ margin: '20px 0 0', fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Você fez o suficiente. Pode parar tranquilo.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/')} style={botaoPrimario}>Voltar ao início</button>
            <button onClick={() => navigate('/explorar')} style={botaoSecundario}>Explorar mais</button>
            <button onClick={() => navigate('/respirar')} style={botaoSecundario}>Respirar antes de sair</button>
          </div>
        </div>
      </Pagina>
    )

  const b = fila[idx]
  if (!b) return null

  function iniciar(lista: BlocoConteudo[]) {
    setFila(lista)
    setIdx(0)
    setFase('confianca')
    setConfianca(null)
    setProducao('')
  }

  const responder = async (q: Qualidade) => {
    await revisarBloco(b.resumo_id, q, confianca ?? undefined)
    setRevisados((n) => n + 1)
    if (q >= 4 && (confianca ?? 4) <= 2) {
      setFlashAnima(acertoDificil())
      setTimeout(() => setFlashAnima(null), 2200)
    }
    const prox = idx + 1
    if (prox >= fila.length) setFase('fim')
    else {
      setIdx(prox)
      setFase('confianca')
      setConfianca(null)
      setProducao('')
    }
  }

  // nível-alvo do bloco: se tem flashcards de nível 2+, exige produção
  const exigeProducao = b.flashcards.some((f) => f.nivel_alvo >= 3)
  const pergunta = b.metadata.subtitulo?.trim().endsWith('?')
    ? b.metadata.subtitulo.trim()
    : `Recorde: o que você sabe sobre ${b.metadata.titulo.toLowerCase()}?`

  return (
    <Pagina largura={720}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, color: 'var(--color-text-primary)' }}>Revisão</h1>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{idx + 1} / {fila.length}</span>
      </div>
      <div style={{ height: 4, background: 'var(--color-bg-card)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${((idx + 1) / fila.length) * 100}%`, background: 'var(--color-accent)', transition: 'width 0.3s' }} />
      </div>

      {flashAnima && <div style={{ marginBottom: 20 }}><FalaAnima texto={flashAnima} /></div>}

      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 32, marginBottom: 24 }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          {b.metadata.titulo}
        </p>

        {fase === 'confianca' && (
          <>
            <p style={{ margin: '12px 0 0', fontSize: 17, color: 'var(--color-text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>
              {pergunta}
            </p>
            <p style={{ margin: '20px 0 10px', fontSize: 13, color: 'var(--color-text-muted)' }}>
              Antes de revelar — quão confiante você está?
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CONFIANCAS.map((c) => (
                <button
                  key={c.v}
                  onClick={() => {
                    setConfianca(c.v)
                    setFase(exigeProducao ? 'produzir' : 'revelado')
                  }}
                  style={botaoConfianca}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {fase === 'produzir' && (
          <>
            <p style={{ margin: '12px 0 12px', fontSize: 16, color: 'var(--color-text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }}>
              {pergunta}
            </p>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Escreva o que você lembra — recuperar da memória é o que fixa.
            </p>
            <textarea
              autoFocus
              value={producao}
              onChange={(e) => setProducao(e.target.value)}
              rows={4}
              placeholder="Do que você lembra?"
              style={{
                width: '100%',
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: 'var(--color-text-primary)',
                fontSize: 14,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <button onClick={() => setFase('revelado')} style={{ ...botaoPrimario, marginTop: 12 }}>
              Comparar com a resposta →
            </button>
          </>
        )}

        {fase === 'revelado' && (
          <>
            {producao.trim() && (
              <div style={{ margin: '12px 0', padding: '10px 14px', background: 'var(--color-bg-base)', borderLeft: '2px solid var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Você escreveu</p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>{producao}</p>
              </div>
            )}
            <p style={{ margin: '16px 0 0', fontSize: 16, color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
              {b.resumo_conciso}
            </p>
            <button
              onClick={() => navigate(`/bloco/${b.resumo_id}`)}
              style={{ marginTop: 14, background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              Abrir bloco completo →
            </button>
          </>
        )}
      </div>

      {fase === 'revelado' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {QUALIDADES.map(({ q, label, cor }) => (
            <button key={q} onClick={() => responder(q)} style={{ ...botaoQualidade, borderColor: cor, color: cor }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </Pagina>
  )
}

const botaoPrimario: React.CSSProperties = {
  padding: '11px 22px',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-accent)',
  color: 'var(--color-bg-base)',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
}
const botaoSecundario: React.CSSProperties = {
  padding: '11px 22px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: 14,
  cursor: 'pointer',
}
const botaoConfianca: React.CSSProperties = {
  flex: 1,
  minWidth: 90,
  padding: '10px 12px',
  border: '1px solid var(--color-border-accent)',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
}
const botaoQualidade: React.CSSProperties = {
  flex: 1,
  minWidth: 100,
  padding: '12px 16px',
  border: '1px solid',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
}
