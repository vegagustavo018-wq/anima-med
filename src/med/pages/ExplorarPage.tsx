import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, Cartao, Grade, Badge } from '@core/components/ui/primitivos'
import { CURRICULO } from '@med/data/curriculo'
import { db } from '@core/db/database'

export function ExplorarPage() {
  const navigate = useNavigate()
  const [contagens, setContagens] = useState<Record<number, number>>({})

  useEffect(() => {
    // conta blocos por semestre (prefixo sN-)
    db.blocos.toArray().then((blocos) => {
      const c: Record<number, number> = {}
      for (const b of blocos) {
        const sem = b.metadata.semestre
        c[sem] = (c[sem] ?? 0) + 1
      }
      setContagens(c)
    })
  }, [])

  return (
    <Pagina>
      <CabecalhoPagina
        titulo="Explorar"
        subtitulo="Doze semestres. O currículo inteiro, do primeiro tecido à clínica."
      />
      <Grade min={200}>
        {CURRICULO.map((sem) => {
          const n = contagens[sem.numero] ?? 0
          const temConteudo = sem.disciplinas.length > 0
          return (
            <Cartao
              key={sem.numero}
              onClick={() => temConteudo && navigate(`/explorar/${sem.numero}`)}
              cor={temConteudo ? 'var(--color-accent)' : undefined}
              style={{ opacity: temConteudo ? 1 : 0.55 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: temConteudo ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  {sem.numero}
                </span>
                {n > 0 && <Badge cor="var(--color-accent-dim)">{n} blocos</Badge>}
              </div>
              <p style={{ margin: '10px 0 2px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {sem.titulo}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                {temConteudo ? `${sem.disciplinas.length} disciplinas` : 'em breve'}
              </p>
            </Cartao>
          )
        })}
      </Grade>
    </Pagina>
  )
}
