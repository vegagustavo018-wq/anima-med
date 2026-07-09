import { Square } from 'lucide-react'
import { Cartao } from '@core/components/ui/primitivos'
import { RotuloClinico, AnelProgresso } from '@core/components/ui/hud'

interface Item {
  label: string
  meta: number
  categoria: string
  cor: string
}

interface Props {
  blocos: number
  cards: number
  questoes: number
  onClick: () => void
}

/**
 * "Plano de Hoje" — espelha o TodayPlanCard do AI Studio: rótulo clínico,
 * anel de progresso radial e lista de tarefas com categoria monoespaçada.
 * Dados reais (resumoPendencias: blocos/cards/questões).
 */
export function CartaoPlanoDia({ blocos, cards, questoes, onClick }: Props) {
  const itens: Item[] = [
    { label: 'Revisar blocos vencidos', meta: blocos, categoria: 'Revisão espaçada', cor: 'var(--color-warning)' },
    { label: 'Fazer flashcards', meta: cards, categoria: 'Flashcards', cor: 'var(--color-accent)' },
    { label: 'Responder questões', meta: Math.min(questoes, 10), categoria: 'Banco de questões', cor: 'var(--color-info)' },
  ].filter((i) => i.meta > 0)

  const total = itens.length
  const pct = total === 0 ? 100 : 0 // nada feito ainda hoje; anel reflete tarefas concluídas

  return (
    <Cartao onClick={onClick} cor="var(--color-accent)">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        <div>
          <RotuloClinico cor="var(--color-text-muted)" style={{ marginBottom: 6 }}>
            Plano de hoje
          </RotuloClinico>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
            Sua trilha adaptada para hoje
          </p>
        </div>
        <AnelProgresso pct={pct} />
      </div>

      {itens.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-muted)' }}>Nada pendente agora — respire.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
          {itens.map((it) => (
            <div
              key={it.label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: '9px 11px',
                borderRadius: 'var(--radius-md)',
                background: 'color-mix(in srgb, var(--color-bg-base) 45%, transparent)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <Square size={15} color="var(--color-text-faint)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                  {it.label}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 3,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    color: it.cor,
                  }}
                >
                  · {it.categoria}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: it.cor, flexShrink: 0 }}>
                {it.meta}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-accent)', fontWeight: 600 }}>Ver plano completo →</p>
    </Cartao>
  )
}
