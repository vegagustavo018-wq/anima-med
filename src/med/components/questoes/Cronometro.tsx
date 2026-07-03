import { useEffect, useRef, useState } from 'react'
import { tocar } from '@core/anima/som'

/**
 * Cronômetro regressivo do Modo Exame (também reutilizável em provas). Mono Deep
 * Ocean, avisos sonoros aos marcos (1 min, 10 s), chama `aoZerar` uma vez.
 */
export function Cronometro({
  segundos,
  pausado = false,
  aoZerar,
}: {
  segundos: number
  pausado?: boolean
  aoZerar: () => void
}) {
  const [restante, setRestante] = useState(segundos)
  const avisou60 = useRef(false)
  const avisou10 = useRef(false)
  const zerou = useRef(false)
  // referência estável de aoZerar: sem isto, cada render do pai (finalizar é
  // recriada a cada render) reinicia o setInterval e o relógio "atrasa" (drift).
  const aoZerarRef = useRef(aoZerar)
  useEffect(() => {
    aoZerarRef.current = aoZerar
  }, [aoZerar])

  useEffect(() => {
    if (pausado) return
    const t = setInterval(() => {
      setRestante((r) => {
        const prox = r - 1
        if (prox === 60 && !avisou60.current) {
          avisou60.current = true
          tocar('transicao')
        }
        if (prox === 10 && !avisou10.current) {
          avisou10.current = true
          tocar('erro')
        }
        if (prox <= 0 && !zerou.current) {
          zerou.current = true
          aoZerarRef.current()
          return 0
        }
        return Math.max(0, prox)
      })
    }, 1000)
    return () => clearInterval(t)
  }, [pausado])

  const mm = Math.floor(restante / 60)
  const ss = restante % 60
  const critico = restante <= 60
  return (
    <span
      role="timer"
      aria-label={`Tempo restante ${mm} minutos e ${ss} segundos`}
      className={critico ? 'anima-pulso-luz' : undefined}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: critico ? 'var(--color-danger)' : 'var(--color-text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
    </span>
  )
}
