import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '@core/db/database'
import { type Qualidade } from '@core/srs/sm2'
import { montarFilaEstudo } from '@core/anima/fila'
import { useProgressoStore } from '@core/store/progressoStore'
import { useSessaoConfigStore, PRESETS } from '@core/store/sessaoConfigStore'
import { useUIStore } from '@core/store/uiStore'
import { Pagina, FalaAnima, EstadoVazio, BotaoCTA } from '@core/components/ui/primitivos'
import { filaVazia, fimDeSessao, acertoDificil } from '@core/anima/voz'
import { calcularEstado, contarLeeches } from '@core/anima/estado'
import { detectarLacunas } from '@core/anima/lacunas'
import { AnimaAtmosphere } from '@core/components/ui/AnimaAtmosphere'
import { IconeNav } from '@med/components/navigation/icones'
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
  const { reduzirMovimento } = useUIStore()
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
  const [blocosDominados, setBlocosDominados] = useState(0)
  const [leeches, setLeeches] = useState(0)
  const [lacunas, setLacunas] = useState(0)

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
    calcularEstado().then((e) => setBlocosDominados(e.blocosDominados))
    contarLeeches().then(setLeeches)
    detectarLacunas().then((l) => setLacunas(l.length))
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

  // ── Intro: central de revisão (fila real + modos + memória ativa) ──
  if (fase === 'intro') {
    const teto = config?.teto_cards_dia
    const listaComTeto = teto ? todos.slice(0, teto) : todos
    return (
      <Pagina largura={880}>
        <div style={{ position: 'relative' }}>
          <AnimaAtmosphere reduzirMovimento={reduzirMovimento} densidade="media" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ marginBottom: 24, paddingTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(24px, 3vw, 30px)',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Revisão inteligente
                </h1>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 11px',
                    borderRadius: 99,
                    border: '1px solid var(--color-border-accent)',
                    background: 'var(--color-accent-glow)',
                    color: 'var(--color-accent)',
                    fontSize: 11.5,
                    fontWeight: 700,
                  }}
                >
                  <IconeNav nome="revisar" tamanho={12} />
                  {todos.length} {todos.length === 1 ? 'bloco vencido' : 'blocos vencidos'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--color-text-secondary)', maxWidth: 520 }}>
                A ANIMA organiza o que precisa voltar para a sua memória.
              </p>
            </div>

            {/* Card principal — Revisar agora */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 28,
                padding: '32px 36px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                marginBottom: 22,
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-card)) 0%, var(--color-bg-card) 40%, var(--color-bg-elevated) 100%)',
                backdropFilter: 'blur(24px) saturate(140%)',
                WebkitBackdropFilter: 'blur(24px) saturate(140%)',
                border: '1px solid var(--color-border-accent)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-6%',
                  width: 340,
                  height: 340,
                  background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 62%)',
                  filter: 'blur(8px)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)',
                  }}
                >
                  Revisar agora
                </p>
                <p
                  style={{
                    margin: '12px 0 20px',
                    fontSize: 14,
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-serif)',
                    maxWidth: 420,
                  }}
                >
                  Sem pressa. Uma dose pequena mantém a corrente.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <BotaoCTA onClick={() => iniciar(listaComTeto)}>
                    Revisar {teto && teto < todos.length ? `até o teto (${teto})` : `tudo (${todos.length})`} →
                  </BotaoCTA>
                  {todos.length > 3 && (
                    <button onClick={() => iniciar(todos.slice(0, 3))} className="anima-chip">
                      Só 5 min (3)
                    </button>
                  )}
                </div>
              </div>
              <CurvaEsquecimento reduzirMovimento={reduzirMovimento} />
            </div>

            {/* Modos de sessão — cards com descrição real (PRESETS) */}
            <p style={rotuloSecao}>Modos de sessão</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: 10,
                marginBottom: 26,
              }}
            >
              {(Object.keys(PRESETS) as PresetSessao[]).map((p) => {
                const ativo = config?.preset === p
                return (
                  <button
                    key={p}
                    onClick={() => aplicarPreset(p)}
                    style={{
                      textAlign: 'left',
                      padding: '13px 14px',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${ativo ? 'var(--color-accent)' : 'var(--border-soft)'}`,
                      background: ativo ? 'var(--color-accent-glow)' : 'var(--panel)',
                      boxShadow: ativo ? 'var(--shadow-glow)' : 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
                    }}
                  >
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: ativo ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                      {PRESETS[p].label}
                    </p>
                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {PRESETS[p].descricao}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Fila de revisão + Memória ativa */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <button
                onClick={() => navigate('/leech')}
                style={{
                  textAlign: 'left',
                  padding: 18,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--panel)',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, transform 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-accent)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-soft)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Fila de revisão
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: leeches > 0 ? 'color-mix(in srgb, var(--color-warning) 16%, transparent)' : 'var(--color-accent-glow)',
                      color: leeches > 0 ? 'var(--color-warning)' : 'var(--color-accent)',
                      flexShrink: 0,
                    }}
                  >
                    <IconeNav nome="leech" tamanho={14} />
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{leeches}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)' }}>
                      na enfermaria de sanguessugas
                    </p>
                  </div>
                </div>
              </button>

              <div
                style={{
                  padding: 18,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-soft)',
                  background: 'var(--panel)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <p style={{ margin: '0 0 12px', fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Memória ativa
                </p>
                <div style={{ display: 'flex', gap: 18 }}>
                  <MiniMetrica valor={blocosDominados} rotulo="em domínio" />
                  <MiniMetrica valor={lacunas} rotulo="lacunas" cor={lacunas > 0 ? 'var(--color-warning)' : undefined} />
                </div>
              </div>
            </div>
          </div>
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

const rotuloSecao: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  margin: '0 0 12px',
}

function MiniMetrica({ valor, rotulo, cor }: { valor: number; rotulo: string; cor?: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: cor ?? 'var(--color-accent)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
        {valor}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>{rotulo}</p>
    </div>
  )
}

/**
 * Curva de esquecimento — decoração SVG do card "Revisar agora": uma queda
 * suave (memória sem reforço) interrompida por um degrau ascendente (o
 * reforço que a revisão espaçada aplica). Puramente ilustrativo.
 */
function CurvaEsquecimento({ reduzirMovimento }: { reduzirMovimento: boolean }) {
  return (
    <svg
      width={150}
      height={110}
      viewBox="0 0 150 110"
      style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="curvaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M4 20 C 30 24, 46 46, 52 68 L 52 30 C 66 26, 78 34, 86 52 C 96 74, 112 84, 146 88"
        fill="none"
        stroke="var(--color-border-accent)"
        strokeWidth={1.2}
        strokeDasharray="2 3"
        opacity={0.5}
      />
      <path
        d="M4 20 C 30 24, 46 46, 52 68 L 52 30 C 66 26, 78 34, 86 52 C 96 74, 112 84, 146 88 L 146 108 L 4 108 Z"
        fill="url(#curvaFill)"
        stroke="none"
      />
      <path
        d="M4 20 C 30 24, 46 46, 52 68"
        fill="none"
        stroke="var(--color-text-faint)"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M52 30 C 66 26, 78 34, 86 52 C 96 74, 112 84, 146 88"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={1.8}
        strokeLinecap="round"
        style={reduzirMovimento ? undefined : { filter: 'drop-shadow(0 0 4px var(--color-accent-glow))' }}
      />
      {/* Ponto de reforço — onde a revisão intercepta o esquecimento */}
      <circle cx={52} cy={30} r={3.4} fill="var(--color-accent)">
        {!reduzirMovimento && (
          <animate attributeName="r" values="3.4;5;3.4" dur="2.4s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
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
