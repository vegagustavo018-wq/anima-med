import { useEffect, useState } from 'react'
import { db } from '@core/db/database'
import type { SRSState } from '@core/types/schema'

/**
 * Curva de Esquecimento (P58) — sparkline da recuperabilidade estimada de UM
 * bloco ao longo do tempo, reconstruída do SRS. Modelo: R(t) = 2^(−t/S), onde a
 * meia-vida S ≈ intervalo agendado (o intervalo do SM-2 é escolhido para cair
 * perto da meta de retenção). Marca "hoje" e a próxima revisão — o momento em
 * que a ANIMA vai te reencontrar antes de você esquecer.
 */

const AMOSTRAS = 40

function recuperabilidade(diasDesde: number, meiaVida: number): number {
  if (meiaVida <= 0) return diasDesde <= 0 ? 1 : 0.2
  return Math.pow(2, -diasDesde / meiaVida)
}

export function CurvaEsquecimento({ resumoId }: { resumoId: string }) {
  const [srs, setSrs] = useState<SRSState | null>(null)
  const [carregou, setCarregou] = useState(false)

  useEffect(() => {
    let vivo = true
    db.progresso.get(resumoId).then((p) => {
      if (!vivo) return
      setSrs(p && p.vezes_lido > 0 ? p.srs : null)
      setCarregou(true)
    })
    return () => {
      vivo = false
    }
  }, [resumoId])

  if (!carregou || !srs || !srs.ultima_revisao) return null

  const meiaVida = Math.max(1, srs.intervalo_dias || 1)
  const ultima = new Date(srs.ultima_revisao).getTime()
  const agora = Date.now()
  const proxima = srs.proxima_revisao ? new Date(srs.proxima_revisao).getTime() : ultima + meiaVida * 86400000
  // janela: da última revisão até um pouco além da próxima
  const fim = Math.max(proxima, agora) + meiaVida * 0.4 * 86400000
  const span = Math.max(1, fim - ultima)

  const W = 260
  const H = 54
  const pts: string[] = []
  for (let i = 0; i <= AMOSTRAS; i++) {
    const t = ultima + (span * i) / AMOSTRAS
    const dias = (t - ultima) / 86400000
    const r = recuperabilidade(dias, meiaVida)
    const x = (i / AMOSTRAS) * W
    const y = H - r * (H - 6) - 3
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const xHoje = Math.min(W, Math.max(0, ((agora - ultima) / span) * W))
  const xProx = Math.min(W, Math.max(0, ((proxima - ultima) / span) * W))
  const rHoje = recuperabilidade((agora - ultima) / 86400000, meiaVida)

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Curva de esquecimento
        </span>
        <span style={{ fontSize: 11, color: rHoje > 0.7 ? 'var(--color-success)' : rHoje > 0.4 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
          retenção hoje ~{Math.round(rHoje * 100)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label={`Curva de esquecimento: retenção estimada de ${Math.round(rHoje * 100)}% hoje`}>
        <polyline points={pts.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
        {/* próxima revisão */}
        <line x1={xProx} y1="0" x2={xProx} y2={H} stroke="var(--color-accent-dim)" strokeWidth="1" strokeDasharray="3 3" />
        {/* hoje */}
        <line x1={xHoje} y1="0" x2={xHoje} y2={H} stroke="var(--color-text-muted)" strokeWidth="1" />
        <circle cx={xHoje} cy={H - rHoje * (H - 6) - 3} r="3" fill="var(--color-accent)" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' }}>
        <span>última revisão</span>
        <span>próxima ⟂</span>
      </div>
    </div>
  )
}
