import { useEffect, useState } from 'react'
import { useProgressoStore } from '@core/store/progressoStore'
import type { ProgressoBloco } from '@core/types/schema'

const NIVEIS = [
  { v: 1, label: 'Travei' },
  { v: 2, label: 'Consegui parcialmente' },
  { v: 3, label: 'Consegui bem' },
  { v: 4, label: 'Ensinaria com clareza' },
]

/**
 * Modo Ensinar (bloco 4) — técnica de Feynman: explique como se fosse para
 * um leigo, depois avalie sua própria clareza. Sem API externa — o
 * julgamento é seu, e isso já é o exercício.
 */
export function ModoEnsinar({ resumo_id, titulo, progresso }: { resumo_id: string; titulo: string; progresso?: ProgressoBloco }) {
  const { salvarDiario, setAutoAvaliacao } = useProgressoStore()
  const [texto, setTexto] = useState(progresso?.diario_aprendizagem ?? '')
  const [salvo, setSalvo] = useState(true)

  useEffect(() => {
    setTexto(progresso?.diario_aprendizagem ?? '')
  }, [resumo_id, progresso?.diario_aprendizagem])

  useEffect(() => {
    if (salvo) return
    const t = setTimeout(async () => {
      await salvarDiario(resumo_id, texto)
      setSalvo(true)
    }, 700)
    return () => clearTimeout(t)
  }, [texto, salvo, resumo_id, salvarDiario])

  const nivelAtual = progresso?.auto_avaliacao.explicar_para_leigo ?? null

  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600 }}>
        Explique "{titulo}" como se fosse para alguém que nunca ouviu falar disso
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--color-text-muted)' }}>
        Sem jargão. Se você travar em algum ponto, esse é exatamente o ponto que precisa de mais estudo.
      </p>
      <textarea
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setSalvo(false)
        }}
        rows={6}
        placeholder="Comece: 'Bom, imagina que...'"
        style={{
          width: '100%',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          color: 'var(--color-text-primary)',
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: 'var(--font-serif)',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'right' }}>{salvo ? 'salvo' : 'salvando...'}</p>

      <div style={{ marginTop: 20 }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-secondary)' }}>Com que clareza você conseguiu explicar?</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {NIVEIS.map((n) => (
            <button
              key={n.v}
              onClick={() => setAutoAvaliacao(resumo_id, 'explicar_para_leigo', n.v)}
              style={{
                padding: '7px 14px',
                borderRadius: 99,
                border: `1px solid ${nivelAtual === n.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: nivelAtual === n.v ? 'var(--color-accent-glow)' : 'transparent',
                color: nivelAtual === n.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
