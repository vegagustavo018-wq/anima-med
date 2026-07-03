import { useState } from 'react'

interface Props {
  pergunta: string
  dica?: string
  onRevelar: (resposta: string) => void
}

/**
 * Inversão pedagógica: antes de revelar a narrativa, a ANIMA pergunta.
 * O erro no palpite é DESEJADO (pretesting effect) — abre o buraco que a
 * narrativa vai preencher. O palpite é guardado para o reencontro em espiral.
 */
export function ModoPalpite({ pergunta, dica, onRevelar }: Props) {
  const [resposta, setResposta] = useState('')

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-accent)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        margin: '8px 0 40px',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 18, color: 'var(--color-accent)' }}>✦</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
          }}
        >
          Antes de eu contar — o que você acha?
        </span>
      </div>

      <p
        style={{
          margin: '0 0 6px',
          fontSize: 18,
          color: 'var(--color-text-primary)',
          lineHeight: 1.5,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {pergunta}
      </p>
      {dica && (
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          {dica}
        </p>
      )}

      <textarea
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
        placeholder="Arrisque. Errar aqui faz a explicação grudar melhor depois."
        rows={3}
        style={{
          width: '100%',
          background: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          color: 'var(--color-text-primary)',
          fontSize: 14,
          fontFamily: 'var(--font-sans)',
          resize: 'vertical',
          marginTop: 8,
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <button
          onClick={() => onRevelar(resposta)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)',
            color: 'var(--color-bg-base)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Revelar a resposta →
        </button>
        <button
          onClick={() => onRevelar('')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Pular
        </button>
      </div>
    </div>
  )
}
