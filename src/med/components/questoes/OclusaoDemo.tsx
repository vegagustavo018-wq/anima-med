import { useState } from 'react'
import { Botao } from '@core/components/ui/controles'
import { useQuestoesStore } from '@core/store/questoesStore'
import type { Qualidade } from '@core/srs/sm2'

/**
 * Oclusão de Imagem — player "função antes do nome". Uma região da figura fica
 * mascarada; o aluno recorda o que é antes de revelar. Cada máscara é um card
 * de SRS (persistido em progressoQuestao com id sintético q-ocl-*).
 *
 * Aqui roda um DEMO autocontido (esquema de neurônio em SVG) porque o acervo da
 * ANIMA ainda não tem imagens — o player já está pronto para figuras reais:
 * basta trocar `imagem`/`mascaras` por dados vindos de /questoes/oclusoes.json.
 */

interface Mascara {
  id: string
  x: number
  y: number
  w: number
  h: number
  rotulo: string
  descricao: string
}

const MASCARAS: Mascara[] = [
  { id: 'dendritos', x: 6, y: 40, w: 70, h: 120, rotulo: 'Dendritos', descricao: 'Recebem sinais de outros neurônios e conduzem ao corpo celular.' },
  { id: 'soma', x: 78, y: 68, w: 74, h: 74, rotulo: 'Corpo celular (soma)', descricao: 'Contém o núcleo; integra os sinais recebidos.' },
  { id: 'mielina', x: 210, y: 88, w: 60, h: 34, rotulo: 'Bainha de mielina', descricao: 'Isola o axônio e acelera a condução saltatória.' },
  { id: 'terminais', x: 340, y: 60, w: 56, h: 90, rotulo: 'Terminais axônicos', descricao: 'Liberam neurotransmissores na sinapse.' },
]

const NOTAS: { q: Qualidade; label: string; cor: string }[] = [
  { q: 1, label: 'Errei', cor: 'var(--color-danger)' },
  { q: 3, label: 'Difícil', cor: 'var(--color-warning)' },
  { q: 5, label: 'Acertei', cor: 'var(--color-success)' },
]

export function OclusaoDemo({ onSair }: { onSair: () => void }) {
  const { avaliarFlashcard } = useQuestoesStore()
  const [idx, setIdx] = useState(0)
  const [revelado, setRevelado] = useState(false)
  const [feitos, setFeitos] = useState(0)

  const alvo = MASCARAS[idx]
  const fim = idx >= MASCARAS.length

  async function avaliar(q: Qualidade) {
    await avaliarFlashcard(`q-ocl-neuronio-${alvo.id}`, q, 'treino')
    setFeitos((f) => f + 1)
    setRevelado(false)
    setIdx((i) => i + 1)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={onSair} style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }}>
          ← Sair
        </button>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Oclusão · Neurônio · {Math.min(idx + 1, MASCARAS.length)}/{MASCARAS.length}
        </span>
      </div>

      {fim ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 40, color: 'var(--color-success)' }}>✓</div>
          <p style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>Você revisou {feitos} estruturas.</p>
          <Botao variante="primario" onClick={onSair}>Voltar</Botao>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            {revelado ? alvo.rotulo : 'Que estrutura está oculta?'}
          </p>

          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <svg viewBox="0 0 400 200" style={{ width: '100%', height: 'auto' }} role="img" aria-label="Esquema de um neurônio">
              {/* dendritos */}
              <g stroke="var(--color-text-secondary)" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M115 100 L60 55 M78 48 L48 60 M60 55 L30 45" />
                <path d="M115 100 L58 145 M58 145 L30 155 M58 145 L42 170" />
                <path d="M115 100 L50 100 M50 100 L20 90 M50 100 L20 110" />
              </g>
              {/* soma */}
              <circle cx="115" cy="105" r="34" fill="color-mix(in srgb, var(--color-accent) 22%, transparent)" stroke="var(--color-accent)" strokeWidth="2.5" />
              <circle cx="115" cy="105" r="12" fill="var(--color-accent)" />
              {/* axônio + mielina */}
              <line x1="149" y1="105" x2="360" y2="105" stroke="var(--color-text-secondary)" strokeWidth="3" />
              {[175, 240, 305].map((x) => (
                <rect key={x} x={x} y="96" width="34" height="18" rx="9" fill="color-mix(in srgb, var(--color-accent-dim) 40%, transparent)" stroke="var(--color-accent-dim)" strokeWidth="1.5" />
              ))}
              {/* terminais */}
              <g stroke="var(--color-text-secondary)" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M360 105 L388 80 M360 105 L392 105 M360 105 L388 130" />
              </g>
              {/* máscara ativa */}
              {!revelado && (
                <rect
                  x={alvo.x}
                  y={alvo.y}
                  width={alvo.w}
                  height={alvo.h}
                  rx="8"
                  fill="var(--color-bg-elevated)"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                  className="anima-pulso-luz"
                />
              )}
              {!revelado && (
                <text x={alvo.x + alvo.w / 2} y={alvo.y + alvo.h / 2 + 6} textAnchor="middle" fontSize="22" fill="var(--color-accent)">
                  ?
                </text>
              )}
            </svg>
          </div>

          {revelado ? (
            <div className="anima-surge" style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12, fontFamily: 'var(--font-serif)' }}>
                {alvo.descricao}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {NOTAS.map((n) => (
                  <button
                    key={n.q}
                    onClick={() => avaliar(n.q)}
                    className="anima-lift"
                    style={{ flex: 1, padding: '10px', border: `1px solid ${n.cor}`, borderRadius: 'var(--radius-md)', background: 'transparent', color: n.cor, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              <Botao variante="primario" som="revelar" onClick={() => setRevelado(true)}>
                Revelar
              </Botao>
            </div>
          )}
        </>
      )}
    </div>
  )
}
