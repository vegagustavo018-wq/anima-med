import type { QuestaoMCQ } from '@core/types/questoes'

/**
 * Player de uma questão de múltipla escolha (controlado). No treino/revisão,
 * `revelar` fica true após a escolha (feedback imediato + comentário). No Modo
 * Exame, `revelar` fica false até o fim (só marca a escolha).
 */
export function MCQPlayer({
  questao,
  escolhida,
  revelar,
  aoEscolher,
  numero,
  total,
}: {
  questao: QuestaoMCQ
  escolhida: string | null
  revelar: boolean
  aoEscolher: (id: string) => void
  numero: number
  total: number
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.06em' }}>
          {questao.especialidade.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {numero} / {total}
        </span>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-primary)', whiteSpace: 'pre-line', margin: '0 0 20px' }}>
        {questao.enunciado}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questao.alternativas.map((alt) => {
          const eEscolhida = escolhida === alt.id
          const eCorreta = alt.id === questao.correta
          let borda = 'var(--color-border)'
          let fundo = 'var(--color-bg-card)'
          let corTexto = 'var(--color-text-primary)'
          if (revelar) {
            if (eCorreta) {
              borda = 'var(--color-success)'
              fundo = 'color-mix(in srgb, var(--color-success) 12%, transparent)'
            } else if (eEscolhida) {
              borda = 'var(--color-danger)'
              fundo = 'color-mix(in srgb, var(--color-danger) 12%, transparent)'
            }
          } else if (eEscolhida) {
            borda = 'var(--color-accent)'
            fundo = 'var(--color-accent-glow)'
            corTexto = 'var(--color-accent)'
          }
          return (
            <button
              key={alt.id}
              onClick={() => !revelar && !escolhida && aoEscolher(alt.id)}
              disabled={revelar || (!!escolhida && !revelar)}
              className={!revelar && !escolhida ? 'anima-lift' : undefined}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '13px 15px',
                border: `1.5px solid ${borda}`,
                borderRadius: 'var(--radius-md)',
                background: fundo,
                color: corTexto,
                fontSize: 14,
                lineHeight: 1.45,
                cursor: revelar || escolhida ? 'default' : 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: `1.5px solid ${borda}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {revelar && eCorreta ? '✓' : revelar && eEscolhida ? '✕' : alt.id}
              </span>
              <span style={{ flex: 1 }}>{alt.texto}</span>
            </button>
          )
        })}
      </div>

      {revelar && (
        <div
          className="anima-surge"
          role="status"
          aria-live="polite"
          style={{
            marginTop: 18,
            padding: '14px 16px',
            background: 'var(--color-accent-glow)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', margin: 0 }}>
            {escolhida === questao.correta ? 'Correto.' : 'Incorreto.'} A resposta certa é {questao.alternativas.find((a) => a.id === questao.correta)?.texto}.
          </p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
            {questao.comentario}
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
            {questao.tema}
            {questao.cid ? ` · CID ${questao.cid}` : ''} · {questao.fonte}
          </p>
        </div>
      )}
    </div>
  )
}
