import { useParams, useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, Breadcrumb, Cartao, Grade, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos'
import { getSemestre } from '@med/data/curriculo'

export function SemestrePage() {
  const { num } = useParams()
  const navigate = useNavigate()
  const sem = getSemestre(Number(num))

  if (!sem) return <Pagina><p style={{ color: 'var(--color-danger)' }}>Semestre não encontrado.</p></Pagina>

  return (
    <Pagina>
      <Breadcrumb itens={[{ label: 'Explorar', to: '/explorar' }, { label: `Semestre ${sem.numero}` }]} />
      <CabecalhoPagina titulo={sem.titulo} subtitulo={`Semestre ${sem.numero}`} />
      {sem.disciplinas.length === 0 ? (
        <EstadoVazio>
          <FalaAnima texto={`O semestre ${sem.numero} tem seu lugar aqui. Ainda estou construindo este pedaço de mim.`} />
        </EstadoVazio>
      ) : (
        <Grade min={240}>
          {sem.disciplinas.map((d) => (
            <Cartao key={d.id} onClick={() => navigate(`/explorar/${sem.numero}/${d.id}`)} cor={d.cor}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {d.titulo}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                {d.temas.length} {d.temas.length === 1 ? 'tema' : 'temas'}
              </p>
            </Cartao>
          ))}
        </Grade>
      )}
    </Pagina>
  )
}
