import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina } from '@core/components/ui/primitivos'
import { CURRICULO } from '@med/data/curriculo'
import { db } from '@core/db/database'
import { calcularProgressoSemestre } from '@core/anima/estado'
import { AnimaAtmosphere } from '@core/components/ui/AnimaAtmosphere'
import { IconeNav } from '@med/components/navigation/icones'

type Categoria = 'fundamentos' | 'sistemas' | 'clinica' | 'internato'

// Curadoria manual (não é campo do schema) — os títulos dos semestres já
// deixam a fase do curso implícita; isso só nomeia o agrupamento pra filtrar.
const CATEGORIA_POR_SEMESTRE: Record<number, Categoria> = {
  1: 'fundamentos',
  2: 'sistemas',
  3: 'fundamentos',
  4: 'sistemas',
  5: 'sistemas',
  6: 'sistemas',
  7: 'clinica',
  8: 'clinica',
  9: 'clinica',
  10: 'internato',
  11: 'internato',
  12: 'internato',
}

const FILTROS: { v: Categoria | 'todos'; label: string }[] = [
  { v: 'todos', label: 'Todos' },
  { v: 'fundamentos', label: 'Fundamentos' },
  { v: 'sistemas', label: 'Sistemas' },
  { v: 'clinica', label: 'Clínica' },
  { v: 'internato', label: 'Internato' },
]

export function ExplorarPage() {
  const navigate = useNavigate()
  const [contagens, setContagens] = useState<Record<number, number>>({})
  const [progresso, setProgresso] = useState<Record<number, number>>({})
  const [filtro, setFiltro] = useState<Categoria | 'todos'>('todos')

  useEffect(() => {
    db.blocos.toArray().then((blocos) => {
      const c: Record<number, number> = {}
      for (const b of blocos) {
        const sem = b.metadata.semestre
        c[sem] = (c[sem] ?? 0) + 1
      }
      setContagens(c)
    })
    Promise.all(CURRICULO.map((s) => calcularProgressoSemestre(s.numero))).then((resultados) => {
      const p: Record<number, number> = {}
      resultados.forEach((r, i) => (p[CURRICULO[i].numero] = r.percentualDominio))
      setProgresso(p)
    })
  }, [])

  const semestresVisiveis = CURRICULO.filter(
    (s) => filtro === 'todos' || CATEGORIA_POR_SEMESTRE[s.numero] === filtro
  )

  return (
    <Pagina largura={1240}>
      <div style={{ position: 'relative' }}>
        <AnimaAtmosphere densidade="baixa" reduzirMovimento={false} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(26px, 3vw, 34px)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-primary)',
              }}
            >
              Explorar o currículo
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--color-text-secondary)', maxWidth: 560 }}>
              Do primeiro tecido à clínica. Doze semestres, um organismo só — percorra na ordem ou pule direto
              para onde a curiosidade mandar.
            </p>
          </div>

          {/* Filtros por categoria */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {FILTROS.map((f) => {
              const ativo = filtro === f.v
              return (
                <button
                  key={f.v}
                  onClick={() => setFiltro(f.v)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 99,
                    border: `1px solid ${ativo ? 'var(--color-accent)' : 'var(--border-soft)'}`,
                    background: ativo ? 'var(--color-accent-glow)' : 'transparent',
                    color: ativo ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: 12.5,
                    fontWeight: ativo ? 700 : 400,
                    cursor: 'pointer',
                    boxShadow: ativo ? 'var(--shadow-glow)' : 'none',
                    transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Grade de semestres */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {semestresVisiveis.map((sem) => {
              const n = contagens[sem.numero] ?? 0
              const pct = progresso[sem.numero] ?? 0
              const temConteudo = sem.disciplinas.length > 0
              const preview = sem.disciplinas.slice(0, 3).map((d) => d.titulo)
              return (
                <CartaoSemestre
                  key={sem.numero}
                  numero={sem.numero}
                  titulo={sem.titulo}
                  contagem={n}
                  percentual={pct}
                  temConteudo={temConteudo}
                  preview={preview}
                  extras={Math.max(0, sem.disciplinas.length - 3)}
                  onClick={() => temConteudo && navigate(`/explorar/${sem.numero}`)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Pagina>
  )
}

function CartaoSemestre({
  numero,
  titulo,
  contagem,
  percentual,
  temConteudo,
  preview,
  extras,
  onClick,
}: {
  numero: number
  titulo: string
  contagem: number
  percentual: number
  temConteudo: boolean
  preview: string[]
  extras: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!temConteudo}
      style={{
        position: 'relative',
        display: 'block',
        textAlign: 'left',
        padding: '22px 22px 20px',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${temConteudo ? 'var(--border-soft)' : 'var(--border-soft)'}`,
        background: 'var(--panel)',
        backdropFilter: 'blur(18px) saturate(130%)',
        WebkitBackdropFilter: 'blur(18px) saturate(130%)',
        boxShadow: 'var(--shadow-card)',
        cursor: temConteudo ? 'pointer' : 'default',
        opacity: temConteudo ? 1 : 0.5,
        overflow: 'hidden',
        transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!temConteudo) return
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
        e.currentTarget.style.borderColor = 'var(--color-border-accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.borderColor = 'var(--border-soft)'
      }}
    >
      {/* Glow decorativo no canto — só em cards com conteúdo */}
      {temConteudo && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -50,
            right: -40,
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-serif)',
            background: temConteudo
              ? 'linear-gradient(160deg, var(--color-text-primary), var(--color-accent))'
              : undefined,
            WebkitBackgroundClip: temConteudo ? 'text' : undefined,
            WebkitTextFillColor: temConteudo ? 'transparent' : undefined,
            color: temConteudo ? undefined : 'var(--color-text-muted)',
          }}
        >
          {numero}
        </span>
        {contagem > 0 && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              border: '1px solid var(--border-soft)',
              borderRadius: 99,
              padding: '3px 9px',
            }}
          >
            {contagem} blocos
          </span>
        )}
      </div>

      <p
        style={{
          margin: '12px 0 4px',
          fontSize: 14.5,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 1.3,
        }}
      >
        {titulo}
      </p>

      {temConteudo ? (
        <>
          <p style={{ margin: '0 0 14px', fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {preview.join(' · ')}
            {extras > 0 && ` · +${extras}`}
          </p>

          {/* Mini barra de progresso — dado real (calcularProgressoSemestre) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: 'var(--color-bg-hover)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(percentual, percentual > 0 ? 4 : 0)}%`,
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--color-accent-dim), var(--color-accent))',
                }}
              />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {percentual}%
            </span>
          </div>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-faint)', fontStyle: 'italic' }}>ainda não nasceu</p>
      )}

      {temConteudo && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 18,
            right: 18,
            display: 'flex',
            color: 'var(--color-text-faint)',
          }}
        >
          <IconeNav nome="seta-dir" tamanho={14} />
        </span>
      )}
    </button>
  )
}

