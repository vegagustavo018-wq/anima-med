import { Component, type ReactNode } from 'react'
import { baixarBackup } from '@core/db/backup'
import { registrarEvento } from '@core/db/database'

interface Props {
  children: ReactNode
}
interface State {
  erro: Error | null
}

/**
 * Rede de segurança: um erro de render em qualquer tela não deve virar tela
 * branca sem contexto — o aluno precisa saber que os dados dele estão a salvo.
 * Tom da ANIMA: acolhe, não alarma.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: { componentStack?: string | null }) {
    void registrarEvento('erro_render', { mensagem: erro.message, stack: info.componentStack })
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div
        style={{
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--color-bg-base, #0a0e1a)',
          color: 'var(--color-text-primary, #e8edf5)',
          fontFamily: 'var(--font-sans, system-ui)',
        }}
      >
        <div style={{ maxWidth: 460, textAlign: 'center' }}>
          <div style={{ fontSize: 40, color: 'var(--color-accent, #4fd1c5)', marginBottom: 16 }}>✦</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
            Algo tropeçou por aqui.
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary, #8b9ab5)', margin: '0 0 6px' }}>
            Respire — <strong>seus dados estão salvos localmente</strong>, nada se perdeu. Foi só
            esta tela que travou.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted, #7a8aa8)', margin: '0 0 24px', fontFamily: 'var(--font-mono, monospace)' }}>
            {this.state.erro.message}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                background: 'var(--color-accent, #4fd1c5)',
                color: 'var(--color-bg-base, #0a0e1a)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Recarregar
            </button>
            <button
              onClick={() => void baixarBackup()}
              style={{
                padding: '10px 20px',
                border: '1px solid var(--color-border, #2a3550)',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--color-text-secondary, #8b9ab5)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Baixar backup dos meus dados
            </button>
          </div>
        </div>
      </div>
    )
  }
}
