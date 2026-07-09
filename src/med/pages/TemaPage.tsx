import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pagina, CabecalhoPagina, Breadcrumb, EstadoVazio, FalaAnima, Cartao, Grade, Badge } from '@core/components/ui/primitivos'
import { getSemestre, getDisciplina, getTema } from '@med/data/curriculo'
import { useBlocoStore } from '@core/store/blocoStore'
import { useProgressoStore } from '@core/store/progressoStore'
import { useUIStore } from '@core/store/uiStore'
import { montarArvore, achatar, type NoArvore } from '@med/components/flowchart/arvore'
import { Flowchart } from '@med/components/flowchart/Flowchart'
import { noVazio } from '@core/anima/voz'
import type { BlocoPreview, StatusEstudo } from '@core/types/schema'

export function TemaPage() {
  const { num, disc, tema } = useParams()
  const navigate = useNavigate()
  const { previewsPorPrefixo } = useBlocoStore()
  const { carregarVarios } = useProgressoStore()

  const { filtroNivel, toggleNivel, reduzirMovimento } = useUIStore()
  const sem = getSemestre(Number(num))
  const disciplina = getDisciplina(Number(num), disc ?? '')
  const temaObj = getTema(Number(num), disc ?? '', tema ?? '')

  const [previews, setPreviews] = useState<BlocoPreview[] | null>(null)

  useEffect(() => {
    if (!temaObj) return
    let vivo = true
    previewsPorPrefixo(temaObj.prefixo).then((prevs) => {
      if (vivo) setPreviews(prevs)
    })
    return () => {
      vivo = false
    }
  }, [temaObj, previewsPorPrefixo])

  const ids = useMemo(() => previews?.map((p) => p.resumo_id) ?? [], [previews])

  const progressoPorId = useLiveQuery(
    () => (ids.length ? carregarVarios(ids) : Promise.resolve({})),
    [ids, carregarVarios]
  )

  const statusPorId: Record<string, StatusEstudo | 'fantasma'> = useMemo(() => {
    const map: Record<string, StatusEstudo | 'fantasma'> = {}
    if (!previews) return map
    for (const prev of previews) {
      const p = progressoPorId?.[prev.resumo_id]
      map[prev.resumo_id] = p && p.vezes_lido > 0 ? p.srs.status : 'novo'
    }
    return map
  }, [previews, progressoPorId])

  const raizes = useMemo(() => (previews ? montarArvore(previews) : []), [previews])

  if (!sem || !disciplina || !temaObj)
    return <Pagina><p style={{ color: 'var(--color-danger)' }}>Tema não encontrado.</p></Pagina>

  const vazio = previews !== null && previews.length === 0

  // Árvore com 3+ níveis (módulo → seção → blocos-folha): mostra uma grade de
  // seções em vez de despejar tudo num único fluxograma lotado. Temas rasos
  // (raiz → folhas direto) continuam indo direto para o fluxograma.
  const raizArvore: NoArvore | null = raizes[0] ?? null
  const precisaGrade = !!raizArvore && raizArvore.filhos.some((f) => f.filhos.length > 0)

  // Filtro de nível: realça só os blocos cujo nível está ativo.
  const todosAtivos = filtroNivel.CORE && filtroNivel.EXPANSAO && filtroNivel.APROFUNDAMENTO
  const idsRealcados =
    todosAtivos || !previews
      ? null
      : new Set(
          previews
            .filter((p) => {
              const n = p.metadata.nivel ?? 'CORE'
              return filtroNivel[n]
            })
            .map((p) => p.resumo_id)
        )
  const niveis = ['CORE', 'EXPANSAO', 'APROFUNDAMENTO'] as const

  return (
    <Pagina largura={1400}>
      <Breadcrumb
        itens={[
          { label: 'Explorar', to: '/explorar' },
          { label: `Semestre ${sem.numero}`, to: `/explorar/${sem.numero}` },
          { label: disciplina.titulo, to: `/explorar/${sem.numero}/${disciplina.id}` },
          { label: temaObj.titulo },
        ]}
      />
      <CabecalhoPagina titulo={temaObj.titulo} subtitulo={temaObj.descricao} />

      {vazio ? (
        <EstadoVazio>
          <div style={{ fontSize: 40, marginBottom: 16, color: 'var(--color-accent)' }}>✦</div>
          <FalaAnima texto={noVazio(temaObj.titulo)} />
        </EstadoVazio>
      ) : precisaGrade && raizArvore ? (
        <Grade min={260}>
          {raizArvore.filhos.map((secao) => {
            const n = achatar([secao]).length
            const ehFolha = secao.filhos.length === 0
            return (
              <Cartao
                key={secao.id}
                onClick={() =>
                  ehFolha
                    ? navigate(`/bloco/${secao.id}`)
                    : navigate(`/explorar/${sem.numero}/${disciplina.id}/${tema}/${secao.id}`)
                }
                cor={disciplina.cor}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {secao.titulo}
                  </p>
                  <Badge cor={disciplina.cor}>{n}</Badge>
                </div>
                {secao.preview?.metadata.subtitulo && (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {secao.preview.metadata.subtitulo}
                  </p>
                )}
              </Cartao>
            )
          })}
        </Grade>
      ) : (
        <>
          {/* Filtro de nível */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {niveis.map((n) => (
              <button
                key={n}
                onClick={() => toggleNivel(n)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 99,
                  border: `1px solid ${filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: filtroNivel[n] ? 'var(--color-accent-glow)' : 'transparent',
                  color: filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ height: 'calc(100svh - 270px)', minHeight: 400 }}>
            <Flowchart
              raizes={raizes}
              statusPorId={statusPorId}
              atualId={null}
              reduzirMovimento={reduzirMovimento}
              onSelecionar={(id) => navigate(`/bloco/${id}`)}
              idsRealcados={idsRealcados}
            />
          </div>
        </>
      )}
    </Pagina>
  )
}
