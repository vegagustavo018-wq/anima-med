import { useState } from 'react'
import type { FlashcardRevalida } from '@core/types/questoes'
import type { Qualidade } from '@core/srs/sm2'
import { Botao } from '@core/components/ui/controles'

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const NOTAS: { q: Qualidade; label: string; cor: string }[] = [
  { q: 1, label: 'Errei', cor: 'var(--color-danger)' },
  { q: 3, label: 'Difícil', cor: 'var(--color-warning)' },
  { q: 4, label: 'Bom', cor: 'var(--color-accent)' },
  { q: 5, label: 'Fácil', cor: 'var(--color-success)' },
]

/**
 * Player de flashcard: modo flip (revelar → autoavaliar) e modo type-in (digitar
 * a resposta curta → comparação normalizada → autoavaliar). Entrega o P3.
 */
export function FlashcardPlayer({
  card,
  aoAvaliar,
  numero,
  total,
}: {
  card: FlashcardRevalida
  aoAvaliar: (q: Qualidade) => void
  numero: number
  total: number
}) {
  const [revelado, setRevelado] = useState(false)
  const [texto, setTexto] = useState('')
  const [mostrarDica, setMostrarDica] = useState(false)
  const digitar = card.subtipo === 'digitar'
  const acertouDigitar = digitar && normalizar(texto) === normalizar(card.verso)

  const revelar = () => setRevelado(true)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.06em' }}>
          {card.especialidade.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {numero} / {total}
        </span>
      </div>

      <p style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--color-text-primary)', margin: '0 0 18px', fontWeight: 600 }}>
        {card.frente}
      </p>

      {card.dica && !revelado && (
        <button
          onClick={() => setMostrarDica((v) => !v)}
          style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 14 }}
        >
          {mostrarDica ? `💡 ${card.dica}` : '💡 Ver dica'}
        </button>
      )}

      {digitar && !revelado && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            autoFocus
            value={texto}
            aria-label="Sua resposta"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && revelar()}
            placeholder="Digite sua resposta…"
            style={{
              flex: 1,
              padding: '11px 14px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <Botao onClick={revelar} variante="secundario">Verificar</Botao>
        </div>
      )}

      {!revelado && !digitar && (
        <Botao onClick={revelar} variante="primario" som="revelar">Revelar resposta</Botao>
      )}

      {revelado && (
        <div className="anima-surge" role="status" aria-live="polite">
          {digitar && (
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: acertouDigitar ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {acertouDigitar ? '✓ Correto' : `✕ Você escreveu: "${texto || '—'}"`}
            </p>
          )}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 14,
            }}
          >
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
              {card.verso}
            </p>
            {card.fraseParaPaciente && (
              <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--color-border-accent)', paddingLeft: 10 }}>
                🗣 "{card.fraseParaPaciente}"
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {NOTAS.map((n) => (
              <button
                key={n.q}
                onClick={() => aoAvaliar(n.q)}
                className="anima-lift"
                style={{
                  flex: 1,
                  minWidth: 72,
                  padding: '10px 12px',
                  border: `1px solid ${n.cor}`,
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: n.cor,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
