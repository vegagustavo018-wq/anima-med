import { useEffect, useRef, useState } from 'react'
import { VozDoOrganismo as MotorVoz, extrairFala, type EstadoVoz } from '@core/anima/tts'
import type { BlocoConteudo } from '@core/types/schema'

interface Props {
  bloco: BlocoConteudo
  onItemAtivo: (indice: number | null) => void
}

/** Controle da Voz do Organismo — TTS offline com destaque sincronizado (bloco 2). */
export function VozDoOrganismo({ bloco, onItemAtivo }: Props) {
  const motorRef = useRef<MotorVoz | null>(null)
  const [estado, setEstado] = useState<EstadoVoz>('parado')
  const [velocidade, setVelocidade] = useState(1)

  useEffect(() => {
    const motor = new MotorVoz()
    motor.onMudancaEstado = setEstado
    motor.onMudancaItem = onItemAtivo
    motorRef.current = motor
    return () => motor.parar()
  }, [bloco.resumo_id, onItemAtivo])

  if (!motorRef.current?.suportado && typeof window !== 'undefined' && !('speechSynthesis' in window)) {
    return null
  }

  const trechos = extrairFala(bloco.resumo_conciso, bloco.narrativa)

  const alternar = () => {
    const motor = motorRef.current
    if (!motor) return
    if (estado === 'parado') motor.iniciar(trechos, velocidade)
    else if (estado === 'falando') motor.pausar()
    else if (estado === 'pausado') motor.retomar()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={alternar}
        title="Ouvir este bloco"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid var(--color-border-accent)',
          background: estado !== 'parado' ? 'var(--color-accent-glow)' : 'var(--color-bg-elevated)',
          color: 'var(--color-accent)',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        {estado === 'falando' ? '❚❚' : '▶'}
      </button>
      {estado !== 'parado' && (
        <>
          <button onClick={() => motorRef.current?.parar()} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12 }}>
            parar
          </button>
          <select
            value={velocidade}
            onChange={(e) => setVelocidade(Number(e.target.value))}
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)', fontSize: 11, padding: '3px 6px' }}
          >
            <option value={0.8}>0.8×</option>
            <option value={1}>1×</option>
            <option value={1.3}>1.3×</option>
            <option value={1.6}>1.6×</option>
          </select>
        </>
      )}
    </div>
  )
}
