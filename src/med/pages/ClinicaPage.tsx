import { useParams, useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos'
import { VINHETAS_SEED } from '@core/anima/vinhetasSeed'
import { VinhetaClinicaPlayer } from '@med/components/clinico/VinhetaClinicaPlayer'

/** Raciocínio Clínico — lista e player de vinhetas ramificadas (bloco 5). */
export function ClinicaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  if (id) {
    const vinheta = VINHETAS_SEED.find((v) => v.vinheta_id === id)
    if (!vinheta) return <Pagina><p style={{ color: 'var(--color-text-muted)' }}>Vinheta não encontrada.</p></Pagina>
    return (
      <Pagina largura={820}>
        <button onClick={() => navigate('/clinica')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
          ← Vinhetas
        </button>
        <CabecalhoPagina titulo={vinheta.titulo} subtitulo={`${vinheta.disciplina} · decisão importa mais que memória aqui`} />
        <VinhetaClinicaPlayer vinheta={vinheta} />
      </Pagina>
    )
  }

  return (
    <Pagina largura={820}>
      <CabecalhoPagina titulo="Raciocínio Clínico" subtitulo="Casos com decisões reais — o que você escolhe muda o desfecho." />
      {VINHETAS_SEED.length === 0 ? (
        <EstadoVazio>
          <FalaAnima texto="Ainda não há vinhetas neste acervo. Elas nascem conforme os blocos crescem." />
        </EstadoVazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {VINHETAS_SEED.map((v) => (
            <div
              key={v.vinheta_id}
              onClick={() => navigate(`/clinica/${v.vinheta_id}`)}
              style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', cursor: 'pointer' }}
            >
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{v.titulo}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{v.disciplina}</p>
            </div>
          ))}
        </div>
      )}
    </Pagina>
  )
}
