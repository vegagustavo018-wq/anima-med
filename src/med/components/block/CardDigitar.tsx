import { useState } from 'react'

interface Props {
  respostaCorreta: string
  onAvaliar: (acertouExato: boolean) => void
}

function normalizar(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos para comparação tolerante
}

/**
 * Cards de digitação (bloco 1) — eleva "produção-antes-de-revelar" de pensar
 * para escrever. Diff letra a letra contra a resposta canônica curta.
 */
export function CardDigitar({ respostaCorreta, onAvaliar }: Props) {
  const [valor, setValor] = useState('')
  const [avaliado, setAvaliado] = useState(false)

  const exato = normalizar(valor) === normalizar(respostaCorreta)

  const diff = () => {
    const a = valor
    const b = respostaCorreta
    const max = Math.max(a.length, b.length)
    const partes: { char: string; ok: boolean }[] = []
    for (let i = 0; i < max; i++) {
      const ca = a[i] ?? ''
      const cb = b[i] ?? ''
      partes.push({ char: cb || ca, ok: normalizar(ca) === normalizar(cb) && ca !== '' })
    }
    return partes
  }

  return (
    <div>
      {!avaliado ? (
        <>
          <input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAvaliado(true)
            }}
            placeholder="Digite a resposta…"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font-mono)',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => setAvaliado(true)}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)',
              color: 'var(--color-bg-base)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Conferir
          </button>
        </>
      ) : (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {exato ? '✓ exato' : 'sua resposta vs. a correta'}
          </p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {diff().map((p, i) => (
              <span key={i} style={{ color: p.ok ? 'var(--color-success)' : 'var(--color-danger)', background: p.ok ? 'transparent' : 'rgba(252,129,129,0.15)', borderRadius: 2, padding: '0 1px' }}>
                {p.char === ' ' ? ' ' : p.char}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onAvaliar(true)}
              style={{ padding: '6px 14px', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-success)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Considero correto
            </button>
            <button
              onClick={() => onAvaliar(false)}
              style={{ padding: '6px 14px', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Errei
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
