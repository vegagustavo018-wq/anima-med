import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { detectarRituais, type Ritual } from '@core/anima/rituais'
import { Botao } from '@core/components/ui/controles'
import { tocar } from '@core/anima/som'

/**
 * Cerimônia de passagem. Componente global e silencioso: verifica marcos ao
 * montar e sempre que o evento 'anima:rituais' dispara (após firmar um domínio).
 * Quando um marco NOVO é cruzado, interrompe com uma cerimônia em tela cheia —
 * o único momento do app que rouba a cena, porque é raro e irreversível.
 */
export function RitualPassagem() {
  const [fila, setFila] = useState<Ritual[]>([])
  const atual = fila[0]

  const verificar = useCallback(async () => {
    try {
      const novos = await detectarRituais()
      if (novos.length) {
        setFila((f) => [...f, ...novos])
        tocar('sucesso')
      }
    } catch {
      // nunca deve quebrar o app
    }
  }, [])

  useEffect(() => {
    verificar()
    const h = () => verificar()
    window.addEventListener('anima:rituais', h)
    return () => window.removeEventListener('anima:rituais', h)
  }, [verificar])

  if (!atual) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={atual.titulo}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
        padding: 32,
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-accent) 16%, var(--color-bg-base)) 0%, var(--color-bg-base) 68%)',
        animation: 'entrarSuave 0.4s ease',
      }}
    >
      <div className="anima-aurora" style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />
      <span
        aria-hidden="true"
        className="anima-respira"
        style={{ fontSize: 72, color: 'var(--color-accent)', filter: 'drop-shadow(0 0 24px var(--color-accent))', zIndex: 1 }}
      >
        {atual.icone}
      </span>
      <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-accent)', zIndex: 1 }}>
        Ritual de Passagem
      </p>
      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', zIndex: 1 }}>
        {atual.titulo}
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: 520,
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-serif)',
          zIndex: 1,
        }}
      >
        {atual.narrativa}
      </p>
      <div style={{ zIndex: 1, marginTop: 6 }}>
        <Botao variante="primario" tamanho="lg" som="colheita" onClick={() => setFila((f) => f.slice(1))}>
          Eu recebo isso
        </Botao>
      </div>
    </div>,
    document.body
  )
}
