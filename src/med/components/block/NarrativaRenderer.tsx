import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { NarrativaItem } from '@core/types/schema'
import { ImagemBloco } from '@med/components/block/ImagemBloco'

function md(text: string) {
  return DOMPurify.sanitize(marked.parse(text) as string)
}

// ── Tipos individuais ────────────────────────────────────────────────────────

function Texto({ conteudo }: { conteudo: string }) {
  return (
    <div
      className="narrativa"
      dangerouslySetInnerHTML={{ __html: md(conteudo) }}
      style={{ marginBottom: '1rem' }}
    />
  )
}

function Secao({ titulo }: { titulo: string }) {
  return (
    <h2
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginTop: '2.75rem',
        marginBottom: '1.25rem',
        paddingBottom: 10,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Nó da espinha — a progressão viva do bloco (bioluminescência, estático p/ performance) */}
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          minWidth: 10,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          boxShadow: '0 0 0 4px var(--color-accent-glow)',
        }}
      />
      {titulo}
    </h2>
  )
}

function Pausa({ conteudo }: { conteudo: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-accent)',
        borderLeft: '3px solid var(--color-accent-dim)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        margin: '1.5rem 0',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic',
      }}
    >
      ⏸ {conteudo}
    </div>
  )
}

function Highlight({ conteudo }: { conteudo: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'var(--color-accent-glow)',
        border: '1px solid var(--color-border-accent)',
        borderLeft: '3px solid var(--color-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        margin: '1.75rem 0',
        fontSize: 15,
        color: 'var(--color-text-primary)',
        fontWeight: 500,
        lineHeight: 1.65,
      }}
    >
      <span aria-hidden="true" style={{ color: 'var(--color-accent)', fontSize: 18, flexShrink: 0, marginTop: 1 }}>✦</span>
      <span>{conteudo}</span>
    </div>
  )
}

function Contrafactual({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        margin: '1.5rem 0',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--color-warning)',
        }}
      >
        🤔 {pergunta}
      </p>
      <div
        className="narrativa"
        dangerouslySetInnerHTML={{ __html: md(resposta) }}
        style={{ fontSize: 14 }}
      />
    </div>
  )
}

function Analogia({ icone, conteudo }: { icone: string; conteudo: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        margin: '1.5rem 0',
        display: 'flex',
        gap: 14,
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{icone}</span>
      <div
        className="narrativa"
        dangerouslySetInnerHTML={{ __html: md(conteudo) }}
        style={{ flex: 1, fontSize: 14 }}
      />
    </div>
  )
}

function Etimologia({
  termo,
  origem,
  significado,
  explicacao,
}: {
  termo: string
  origem: string
  significado: string
  explicacao: string
}) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderLeft: '3px solid var(--color-disc-histologia)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        margin: '1.5rem 0',
      }}
    >
      <p
        style={{
          margin: '0 0 4px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-disc-histologia)',
        }}
      >
        Etimologia
      </p>
      <p
        style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}
      >
        {termo}
      </p>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
        <em>{origem}</em>
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-accent)', fontWeight: 500 }}>
        "{significado}"
      </p>
      <div
        className="narrativa"
        dangerouslySetInnerHTML={{ __html: md(explicacao) }}
        style={{ fontSize: 14 }}
      />
    </div>
  )
}

function PassoAPasso({
  titulo,
  passos,
}: {
  titulo: string
  passos: { numero: number; titulo: string; explicacao: string }[]
}) {
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <p
        style={{
          margin: '0 0 14px',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {passos.map((p) => (
          <div
            key={p.numero}
            style={{
              display: 'flex',
              gap: 14,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                minWidth: 26,
                borderRadius: '50%',
                background: 'var(--color-accent-glow)',
                border: '1px solid var(--color-accent-dim)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {p.numero}
            </span>
            <div>
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {p.titulo}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {p.explicacao}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabelaComparativa({
  titulo,
  colunas,
  linhas,
}: {
  titulo: string
  colunas: string[]
  linhas: Record<string, string>[]
}) {
  return (
    <div style={{ margin: '1.5rem 0' }}>
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {titulo}
      </p>
      <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
          <thead>
            <tr>
              {colunas.map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, i) => (
              <tr key={i}>
                {colunas.map((c) => (
                  <td
                    key={c}
                    style={{
                      padding: '10px 14px',
                      color: 'var(--color-text-secondary)',
                      borderBottom: '1px solid var(--color-border)',
                      lineHeight: 1.5,
                      verticalAlign: 'top',
                    }}
                  >
                    {linha[c] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

// Nível de profundidade de cada tipo — usado pelo zoom ELI5⇄aprofundar (bloco 2)
const PROFUNDIDADE_TIPO: Record<NarrativaItem['tipo'], number> = {
  texto: 1,
  secao: 1,
  highlight: 1,
  analogia: 1,
  pausa: 2,
  passo_a_passo: 2,
  contrafactual: 2,
  imagem: 2,
  tabela_comparativa: 3,
  etimologia: 3,
}

interface Props {
  items: NarrativaItem[]
  itemAtivoIndex?: number | null
  nivelZoom?: number // 1 (ELI5) a 3 (aprofundado) — omitido = mostra tudo
}

export function NarrativaRenderer({ items, itemAtivoIndex, nivelZoom }: Props) {
  return (
    <>
      {items.map((item, i) => {
        if (nivelZoom && PROFUNDIDADE_TIPO[item.tipo] > nivelZoom) return null

        const conteudo = (() => {
          switch (item.tipo) {
            case 'texto':
              return <Texto conteudo={item.conteudo} />
            case 'secao':
              return <Secao titulo={item.titulo} />
            case 'pausa':
              return <Pausa conteudo={item.conteudo} />
            case 'highlight':
              return <Highlight conteudo={item.conteudo} />
            case 'contrafactual':
              return <Contrafactual pergunta={item.pergunta} resposta={item.resposta} />
            case 'analogia':
              return <Analogia icone={item.icone} conteudo={item.conteudo} />
            case 'etimologia':
              return <Etimologia {...item} />
            case 'imagem':
              return (
                <ImagemBloco
                  titulo={item.titulo}
                  descricao={item.descricao}
                  origem={item.origem ?? 'ia'}
                  url={item.url ?? null}
                />
              )
            case 'passo_a_passo':
              return <PassoAPasso titulo={item.titulo} passos={item.passos} />
            case 'tabela_comparativa':
              return <TabelaComparativa titulo={item.titulo} colunas={item.colunas} linhas={item.linhas} />
            default:
              return null
          }
        })()
        if (!conteudo) return null

        return (
          <div
            key={i}
            style={
              itemAtivoIndex === i
                ? { outline: '2px solid var(--color-accent)', outlineOffset: 6, borderRadius: 8, transition: 'outline-color 0.2s' }
                : undefined
            }
          >
            {conteudo}
          </div>
        )
      })}
    </>
  )
}
