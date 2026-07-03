import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, Breadcrumb, Cartao, Grade, Badge } from '@core/components/ui/primitivos'
import { getSemestre, getDisciplina } from '@med/data/curriculo'
import { db } from '@core/db/database'

export function DisciplinaPage() {
  const { num, disc } = useParams()
  const navigate = useNavigate()
  const sem = getSemestre(Number(num))
  const disciplina = getDisciplina(Number(num), disc ?? '')
  const [contagens, setContagens] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!disciplina) return
    Promise.all(
      disciplina.temas.map(async (t) => {
        const n = await db.blocos.where('resumo_id').startsWith(t.prefixo).count()
        return [t.id, n] as const
      })
    ).then((pares) => setContagens(Object.fromEntries(pares)))
  }, [disciplina])

  if (!sem || !disciplina)
    return <Pagina><p style={{ color: 'var(--color-danger)' }}>Disciplina não encontrada.</p></Pagina>

  return (
    <Pagina>
      <Breadcrumb
        itens={[
          { label: 'Explorar', to: '/explorar' },
          { label: `Semestre ${sem.numero}`, to: `/explorar/${sem.numero}` },
          { label: disciplina.titulo },
        ]}
      />
      <CabecalhoPagina titulo={disciplina.titulo} />
      <Grade min={260}>
        {disciplina.temas.map((t) => {
          const n = contagens[t.id] ?? 0
          const temConteudo = n > 0
          return (
            <Cartao
              key={t.id}
              onClick={() => navigate(`/explorar/${sem.numero}/${disciplina.id}/${t.id}`)}
              cor={disciplina.cor}
              style={{ opacity: temConteudo ? 1 : 0.6 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {t.titulo}
                </p>
                <Badge cor={temConteudo ? disciplina.cor : undefined}>{temConteudo ? `${n}` : '—'}</Badge>
              </div>
              {t.descricao && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {t.descricao}
                </p>
              )}
              {!temConteudo && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  ainda não nasceu
                </p>
              )}
            </Cartao>
          )
        })}
      </Grade>
    </Pagina>
  )
}
