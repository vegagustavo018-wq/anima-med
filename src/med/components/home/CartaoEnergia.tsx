import { Zap, Coffee, Battery, Moon, Sparkles, Heart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Cartao } from '@core/components/ui/primitivos'
import { RotuloClinico } from '@core/components/ui/hud'
import type { PerfilSessao } from '@core/store/uiStore'

// Mesmo mapeamento valor→rótulo de RitualAbertura.tsx (a fonte canônica deste
// conceito) — precisa bater com ele para não confundir qual opção está ativa.
const OPCOES: {
  v: PerfilSessao
  label: string
  desc: string
  sugestao: string
  icone: LucideIcon
  cor: string
}[] = [
  {
    v: 'pico',
    label: 'Dia cheio',
    desc: 'Energia alta, foco em consolidar tudo',
    sugestao: 'Realize o ciclo completo de revisões + 1 simulado.',
    icone: Zap,
    cor: 'var(--color-accent)',
  },
  {
    v: 'padrao',
    label: 'Meio-termo',
    desc: 'Ritmo constante, metas equilibradas',
    sugestao: 'Siga a trilha padrão. Metas perfeitamente equilibradas.',
    icone: Coffee,
    cor: 'var(--color-info)',
  },
  {
    v: 'manutencao',
    label: 'Só o essencial',
    desc: 'Canseira batendo, foco no crucial',
    sugestao: 'Reduzimos suas tarefas para focar nas revisões urgentes.',
    icone: Battery,
    cor: 'var(--color-warning)',
  },
  {
    v: 'exausto',
    label: 'Hoje só descanso',
    desc: 'Saúde mental primeiro, pausar metas',
    sugestao: 'Descanse sem culpa. Amanhã a curva de esquecimento se ajusta.',
    icone: Moon,
    cor: 'var(--color-danger)',
  },
]

interface Props {
  perfilSessao: PerfilSessao
  onEscolher: (p: PerfilSessao) => void
}

/**
 * "Energia de Hoje" — espelha o EnergyCard do AI Studio: grade 2×2 de opções
 * com descrição, estado ativo preenchido e sugestão monoespaçada. Reaproveita
 * perfilSessao (uiStore) — já é exatamente "quanto você aguenta hoje".
 */
export function CartaoEnergia({ perfilSessao, onEscolher }: Props) {
  const selecionada = OPCOES.find((o) => o.v === perfilSessao)

  return (
    <Cartao style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <RotuloClinico cor="var(--color-text-muted)" style={{ marginBottom: 6 }}>
            Energia de hoje
          </RotuloClinico>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Como você está para estudar hoje?
          </p>
        </div>
        <Heart size={16} color="var(--color-danger)" className="anima-respira" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {OPCOES.map((o) => {
          const ativo = perfilSessao === o.v
          const Icone = o.icone
          return (
            <button
              key={o.v}
              onClick={() => onEscolher(o.v)}
              className="anima-bio-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '11px 12px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'left',
                cursor: 'pointer',
                border: `1px solid ${ativo ? o.cor : 'var(--border-soft)'}`,
                background: ativo
                  ? `color-mix(in srgb, ${o.cor} 90%, transparent)`
                  : 'color-mix(in srgb, var(--color-bg-base) 40%, transparent)',
                color: ativo ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
                boxShadow: ativo ? `0 0 15px color-mix(in srgb, ${o.cor} 40%, transparent)` : 'none',
                transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{o.label}</span>
                <Icone size={15} color={ativo ? 'var(--color-bg-base)' : o.cor} style={{ flexShrink: 0 }} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  lineHeight: 1.35,
                  color: ativo ? 'color-mix(in srgb, var(--color-bg-base) 78%, transparent)' : 'var(--color-text-faint)',
                }}
              >
                {o.desc}
              </span>
            </button>
          )
        })}
      </div>

      {selecionada && (
        <div
          style={{
            marginTop: 14,
            padding: '9px 11px',
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--color-accent) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 14%, transparent)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 7,
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            lineHeight: 1.45,
            color: 'var(--color-accent)',
          }}
        >
          <Sparkles size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{selecionada.sugestao}</span>
        </div>
      )}
    </Cartao>
  )
}
