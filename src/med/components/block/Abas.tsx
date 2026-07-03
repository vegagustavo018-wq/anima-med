import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BlocoConteudo, Flashcard, CasoClinicos } from '@core/types/schema'
import { useProgressoStore } from '@core/store/progressoStore'
import { CardDigitar } from './CardDigitar'
import type { Qualidade } from '@core/srs/sm2'
import { backlinksDe, type Backlink } from '@core/anima/backlinks'
import { VINHETAS_SEED } from '@core/anima/vinhetasSeed'

const ROTULO_TIPO_BACKLINK: Record<Backlink['tipo'], string> = {
  prerequisito: 'depende disto',
  lateral: 'relacionado',
  futura: 'retoma no futuro',
  filho: 'sub-tópico',
  pai: 'tópico-mãe',
}

const COR_TIPO: Record<string, string> = {
  por_que: 'var(--color-accent)',
  mecanismo: 'var(--color-info)',
  contrafactual: 'var(--color-warning)',
  clinico: 'var(--color-success)',
  comparacao: 'var(--color-disc-anatomia)',
  armadilha: 'var(--color-danger)',
  sintese_transdisciplinar: 'var(--color-disc-histologia)',
  etimologia: 'var(--color-disc-bioquimica)',
  cloze: 'var(--color-accent-dim)',
}

const QUALIDADES: { q: Qualidade; label: string; cor: string }[] = [
  { q: 0, label: 'Errei', cor: 'var(--color-danger)' },
  { q: 2, label: 'Difícil', cor: 'var(--color-warning)' },
  { q: 4, label: 'Bom', cor: 'var(--color-success)' },
  { q: 5, label: 'Fácil', cor: 'var(--color-accent)' },
]

// ── Flashcards ────────────────────────────────────────────────────────────────
function FlashcardItem({ fc, resumo_id }: { fc: Flashcard; resumo_id: string }) {
  const [aberto, setAberto] = useState(false)
  const [revelado, setRevelado] = useState(false)
  const [avaliado, setAvaliado] = useState(false)
  const { revisarCard } = useProgressoStore()
  const cor = COR_TIPO[fc.tipo] ?? 'var(--color-accent)'
  const ehDigitar = fc.formato === 'digitar' && !!fc.resposta_curta

  const avaliar = async (q: Qualidade) => {
    await revisarCard(resumo_id, fc.card_id, q)
    setAvaliado(true)
  }

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderLeft: `3px solid ${cor}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          gap: 12,
          justifyContent: 'space-between',
          padding: '14px 16px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: cor,
              marginBottom: 6,
            }}
          >
            {fc.tipo.replace(/_/g, ' ')} · nível {fc.nivel_alvo}
            {ehDigitar && ' · digitar'}
          </span>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            {fc.pergunta}
          </p>
        </div>
        <span style={{ fontSize: 16, color: 'var(--color-text-muted)', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          ↓
        </span>
      </button>
      {aberto && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
          {ehDigitar && !revelado ? (
            <CardDigitar
              respostaCorreta={fc.resposta_curta!}
              onAvaliar={(exato) => {
                setRevelado(true)
                if (exato) avaliar(4)
              }}
            />
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {fc.resposta}
              </p>
              {!avaliado && (
                <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                  {QUALIDADES.map(({ q, label, cor: c }) => (
                    <button
                      key={q}
                      onClick={() => avaliar(q)}
                      style={{
                        padding: '5px 11px',
                        border: `1px solid ${c}`,
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        color: c,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {avaliado && <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>✓ registrado na memória</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function FlashcardsAba({ cards, resumo_id }: { cards: Flashcard[]; resumo_id: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cards.map((fc) => (
        <FlashcardItem key={fc.card_id} fc={fc} resumo_id={resumo_id} />
      ))}
    </div>
  )
}

// ── Casos clínicos ────────────────────────────────────────────────────────────
function CasoItem({ caso }: { caso: CasoClinicos }) {
  const [revelar, setRevelar] = useState(false)
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-warning)' }}>
          Caso Clínico
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {caso.titulo}
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          {caso.apresentacao}
        </p>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Cascata causal
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {caso.cascata.map((etapa, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 20, paddingTop: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
                {i < caso.cascata.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--color-border)', marginTop: 4 }} />
                )}
              </div>
              <div style={{ paddingBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {etapa.etapa}
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {etapa.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '16px 20px' }}>
        {!revelar ? (
          <button
            onClick={() => setRevelar(true)}
            style={{
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-success)',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Revelar diagnóstico e tratamento
          </button>
        ) : (
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>
              ✓ {caso.diagnostico_revelado}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {caso.tratamento_resumido}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CasosAba({ casos, resumo_id }: { casos: CasoClinicos[]; resumo_id: string }) {
  const navigate = useNavigate()
  const vinhetas = VINHETAS_SEED.filter((v) => v.bloco_id === resumo_id)
  return (
    <div>
      {vinhetas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {vinhetas.map((v) => (
            <button
              key={v.vinheta_id}
              onClick={() => navigate(`/clinica/${v.vinheta_id}`)}
              style={{
                textAlign: 'left',
                padding: '14px 18px',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-accent-glow)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                ⚕ Vinheta ramificada
              </span>
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{v.titulo}</p>
            </button>
          ))}
        </div>
      )}
      {casos.map((c) => (
        <CasoItem key={c.caso_id} caso={c} />
      ))}
    </div>
  )
}

// ── Conexões ──────────────────────────────────────────────────────────────────
export function ConexoesAba({ bloco }: { bloco: BlocoConteudo }) {
  const navigate = useNavigate()
  const { prerequisitos, futuras, laterais } = bloco.conexoes
  const [backlinks, setBacklinks] = useState<Backlink[]>([])

  useEffect(() => {
    let vivo = true
    backlinksDe(bloco.resumo_id).then((b) => vivo && setBacklinks(b))
    return () => {
      vivo = false
    }
  }, [bloco.resumo_id])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {backlinks.length > 0 && (
        <Secao titulo="Quem chega até aqui (backlinks)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {backlinks.map((b, i) => (
              <button
                key={i}
                onClick={() => navigate(`/bloco/${b.resumo_id}`)}
                style={{
                  textAlign: 'left',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)', minWidth: 90 }}>
                  {ROTULO_TIPO_BACKLINK[b.tipo]}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{b.titulo}</span>
              </button>
            ))}
          </div>
        </Secao>
      )}
      {prerequisitos.length > 0 && (
        <Secao titulo="Precisa de (pré-requisitos)">
          {prerequisitos.map((p, i) => (
            <LinhaConexao key={i} rotulo={`sem ${p.semestre}`} titulo={p.titulo} texto={p.explicacao} cor="var(--color-text-muted)" />
          ))}
        </Secao>
      )}
      {futuras.length > 0 && (
        <Secao titulo="Volta no futuro (espiral)">
          {futuras.map((f, i) => (
            <LinhaConexao key={i} rotulo={`sem ${f.semestre_futuro}`} titulo={f.topico} texto={f.mecanismo_conexao} cor="var(--color-info)" />
          ))}
        </Secao>
      )}
      {laterais.length > 0 && (
        <Secao titulo="Conexões laterais">
          {laterais.map((l, i) => (
            <LinhaConexao key={i} rotulo={l.tipo_relacao.toLowerCase()} titulo={l.bloco_id} texto={l.explicacao} cor="var(--color-disc-anatomia)" />
          ))}
        </Secao>
      )}
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function LinhaConexao({ rotulo, titulo, texto, cor }: { rotulo: string; titulo: string; texto: string; cor: string }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: cor, minWidth: 52, paddingTop: 2 }}>
        {rotulo}
      </span>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{titulo}</p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{texto}</p>
      </div>
    </div>
  )
}
