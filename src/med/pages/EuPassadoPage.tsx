import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos'
import { compararComPassado, type Confronto } from '@core/anima/euPassado'

function tempoRelativo(dias: number): string {
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 30) return `há ${dias} dias`
  const meses = Math.round(dias / 30)
  return meses === 1 ? 'há 1 mês' : `há ${meses} meses`
}

export function EuPassadoPage() {
  const navigate = useNavigate()
  const dados = useLiveQuery(() => compararComPassado(), [])

  return (
    <Pagina largura={820}>
      <CabecalhoPagina
        titulo="Câmara do Eu-Passado"
        subtitulo="O único ranking justo: você contra quem você era. Seus palpites de ontem, o seu domínio de hoje."
      />

      {!dados ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Revirando a memória…</p>
      ) : dados.totalPalpites === 0 ? (
        <EstadoVazio>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🕰</div>
          <FalaAnima texto={dados.narrativa} />
        </EstadoVazio>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <FalaAnima texto={dados.narrativa} grande />
          </div>

          <div style={{ display: 'flex', gap: 22, marginBottom: 24, flexWrap: 'wrap' }}>
            <Metrica n={dados.viradas} label="chutes que viraram domínio" cor="var(--color-success)" />
            <Metrica n={dados.totalPalpites} label="palpites guardados" />
            {dados.primeiroDia && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {tempoRelativo(Math.floor((Date.now() - new Date(dados.primeiroDia).getTime()) / 86400000))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>seu primeiro palpite</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dados.confrontos.map((c) => (
              <ConfrontoCard key={c.resumo_id} c={c} onIr={() => navigate(`/bloco/${c.resumo_id}`)} />
            ))}
          </div>
        </>
      )}
    </Pagina>
  )
}

function ConfrontoCard({ c, onIr }: { c: Confronto; onIr: () => void }) {
  return (
    <button
      onClick={onIr}
      className="anima-lift"
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        border: `1px solid ${c.dominadoAgora ? 'var(--color-success)' : 'var(--color-border)'}`,
        borderLeft: `3px solid ${c.dominadoAgora ? 'var(--color-success)' : 'var(--color-border-accent)'}`,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-card)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>{c.titulo}</p>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }}>{c.disciplina}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <div>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
            você, {tempoRelativo(c.diasDesde)}
          </span>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{c.palpiteTexto.length > 120 ? c.palpiteTexto.slice(0, 120) + '…' : c.palpiteTexto}"
          </p>
        </div>
        <span aria-hidden="true" style={{ fontSize: 18, color: 'var(--color-accent)' }}>→</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>hoje</span>
          <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: c.dominadoAgora ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
            {c.dominadoAgora ? '✦ dominado' : c.statusAtual}
          </p>
        </div>
      </div>
    </button>
  )
}

function Metrica({ n, label, cor }: { n: number; label: string; cor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 140 }}>{label}</div>
    </div>
  )
}
