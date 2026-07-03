import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos'
import { detectarLacunas, type Lacuna } from '@core/anima/lacunas'

/** Detector de Lacunas (bloco 4) — bases que ficaram para trás. */
export function LacunasPage() {
  const navigate = useNavigate()
  const [lacunas, setLacunas] = useState<Lacuna[] | null>(null)

  useEffect(() => {
    detectarLacunas().then(setLacunas)
  }, [])

  return (
    <Pagina largura={800}>
      <CabecalhoPagina titulo="Detector de Lacunas" subtitulo="Onde você avançou sem a base — não é IA, é aritmética sobre o seu próprio histórico." />

      {lacunas === null ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Analisando...</p>
      ) : lacunas.length === 0 ? (
        <EstadoVazio>
          <FalaAnima texto="Nenhuma lacuna detectada por enquanto. Suas bases parecem sólidas até aqui." />
        </EstadoVazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lacunas.map((l, i) => (
            <div key={i} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }}>
                  Você estudou <strong>{l.bloco_titulo}</strong> mas a base <strong>{l.prereq_titulo}</strong> {l.motivo === 'nunca_estudado' ? 'nunca foi estudada' : 'ainda está frágil'}.
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{l.bloco_disciplina}</p>
              </div>
              <button
                onClick={() => navigate(`/bloco/${l.prereq_id}`)}
                style={{ flexShrink: 0, padding: '7px 14px', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Fechar a base
              </button>
            </div>
          ))}
        </div>
      )}
    </Pagina>
  )
}
