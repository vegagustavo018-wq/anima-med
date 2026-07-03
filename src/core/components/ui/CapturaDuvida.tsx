import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDuvidasStore } from '@core/store/duvidasStore'

/**
 * Captura rápida de dúvida — a lacuna de fricção mais grave para estudo profundo.
 * Botão flutuante + atalho `q` + captura do texto selecionado. Salva num inbox
 * leve SEM tirar o estudante do fluxo. A dúvida é dado de aprendizagem.
 */
export function CapturaDuvida() {
  const location = useLocation()
  const { capturar } = useDuvidasStore()
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [selecao, setSelecao] = useState('')
  const [confirmado, setConfirmado] = useState(false)

  const resumoId = location.pathname.startsWith('/bloco/')
    ? location.pathname.split('/bloco/')[1]
    : null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        const sel = window.getSelection()?.toString().trim() ?? ''
        setSelecao(sel)
        setTexto('')
        setAberto(true)
      }
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const salvar = async () => {
    const trecho = selecao || texto
    if (!trecho.trim()) return
    await capturar(trecho, resumoId, texto)
    setConfirmado(true)
    setTimeout(() => {
      setAberto(false)
      setConfirmado(false)
    }, 900)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => {
          const sel = window.getSelection()?.toString().trim() ?? ''
          setSelecao(sel)
          setTexto('')
          setAberto(true)
        }}
        title="Capturar dúvida (q)"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid var(--color-border-accent)',
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-accent)',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      >
        ?
      </button>

      {aberto && (
        <div
          onClick={() => setAberto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-accent)',
              borderRadius: 'var(--radius-xl)',
              padding: 24,
              width: '100%',
              maxWidth: 520,
              marginBottom: 60,
            }}
          >
            {confirmado ? (
              <p style={{ margin: 0, color: 'var(--color-accent)', fontSize: 15, textAlign: 'center' }}>
                ✦ Guardei sua dúvida. Voltamos a ela.
              </p>
            ) : (
              <>
                <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Guardar uma dúvida
                </p>
                {selecao && (
                  <p
                    style={{
                      margin: '0 0 12px',
                      padding: '8px 12px',
                      background: 'var(--color-bg-card)',
                      borderLeft: '2px solid var(--color-accent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    "{selecao.slice(0, 160)}"
                  </p>
                )}
                <textarea
                  autoFocus
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={selecao ? 'O que te intriga nisso?' : 'Qual é a dúvida?'}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) salvar()
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: 'var(--color-text-primary)',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                  <button onClick={() => setAberto(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13 }}>
                    Cancelar
                  </button>
                  <button
                    onClick={salvar}
                    style={{
                      padding: '8px 16px',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-accent)',
                      color: 'var(--color-bg-base)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
