import { BrainCircuit, ChevronRight, Zap } from 'lucide-react'
import { Cartao } from '@core/components/ui/primitivos'
import { RotuloClinico, BadgeStatus } from '@core/components/ui/hud'

interface Props {
  cardsVencidos: number
  /** Título de um bloco real vencido/próximo, para o mini-bloco neural (sem mock). */
  proximoTitulo?: string
  onClick: () => void
}

/**
 * "Revisar Agora" — espelha o ReviewCard do protótipo AI Studio:
 * rótulo clínico + badge Ativo, título grande, mini-bloco neural com o bloco
 * real da vez, e badge Pendente. Dados reais (cardsVencidos + título do bloco).
 */
export function CartaoRevisar({ cardsVencidos, proximoTitulo, onClick }: Props) {
  return (
    <Cartao onClick={onClick} cor="var(--color-accent)">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <RotuloClinico cor="var(--color-text-muted)">Sistema Inteligente</RotuloClinico>
        <BadgeStatus tipo="ativo" icone={Zap} glow>
          Ativo
        </BadgeStatus>
      </div>

      <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Revisar agora
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
        {cardsVencidos} {cardsVencidos === 1 ? 'bloco atingiu' : 'blocos atingiram'} a curva de esquecimento. A ANIMA
        conduz a sequência.
      </p>

      {/* Mini-bloco neural — o bloco real da vez */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '11px 13px',
          borderRadius: 'var(--radius-lg)',
          background: 'color-mix(in srgb, var(--color-bg-base) 55%, transparent)',
          border: '1px solid var(--color-border)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <span
            className="anima-respira"
            style={{
              display: 'flex',
              padding: 7,
              borderRadius: 'var(--radius-md)',
              background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)',
              color: 'var(--color-accent)',
              flexShrink: 0,
            }}
          >
            <BrainCircuit size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {proximoTitulo ?? 'Repetição espaçada'}
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-faint)' }}>
              Sistema de repetição espaçada
            </p>
          </div>
        </div>
        <BadgeStatus tipo="pendente">Pendente</BadgeStatus>
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--color-accent)',
        }}
      >
        Iniciar revisão <ChevronRight size={14} />
      </span>
    </Cartao>
  )
}
