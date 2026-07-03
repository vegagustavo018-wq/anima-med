import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos'
import { db } from '@core/db/database'
import { ehLeech } from '@core/srs/sm2'
import { useProgressoStore } from '@core/store/progressoStore'
import { explicarErro, type ExplicacaoErro } from '@core/anima/explicarErro'
import type { BlocoConteudo, ProgressoBloco } from '@core/types/schema'

interface Linha {
  bloco: BlocoConteudo
  progresso: ProgressoBloco
}

/**
 * Enfermaria de Sanguessugas (bloco 1) — conceitos que resistem ao SRS
 * repetidamente NÃO são punidos. A dificuldade é tratada como falha do
 * ensino, não do estudante.
 */
export function LeechWardPage() {
  const navigate = useNavigate()
  const { reformularParaLeech } = useProgressoStore()
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [explicacoes, setExplicacoes] = useState<Record<string, ExplicacaoErro>>({})

  useEffect(() => {
    ;(async () => {
      const progresso = await db.progresso.toArray()
      const leeches = progresso.filter((p) => ehLeech(p.srs))
      const blocos = await Promise.all(leeches.map((p) => db.blocos.get(p.resumo_id)))
      setLinhas(
        leeches
          .map((p, i) => ({ bloco: blocos[i], progresso: p }))
          .filter((l): l is Linha => !!l.bloco)
          .sort((a, b) => b.progresso.srs.lapsos - a.progresso.srs.lapsos)
      )
    })()
  }, [])

  const alternarExplicacao = async (bloco: BlocoConteudo) => {
    if (expandido === bloco.resumo_id) {
      setExpandido(null)
      return
    }
    setExpandido(bloco.resumo_id)
    if (!explicacoes[bloco.resumo_id]) {
      const exp = await explicarErro(bloco)
      setExplicacoes((e) => ({ ...e, [bloco.resumo_id]: exp }))
    }
  }

  return (
    <Pagina largura={800}>
      <CabecalhoPagina titulo="Enfermaria de Sanguessugas" subtitulo="Blocos que resistiram muitas vezes. Aqui, resistir é dado — não culpa." />

      {linhas.length === 0 ? (
        <EstadoVazio>
          <div style={{ fontSize: 40, marginBottom: 16, color: 'var(--color-accent)' }}>✦</div>
          <FalaAnima texto="Nada aqui precisa de cuidado especial agora. Isso é bom sinal." />
        </EstadoVazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {linhas.map(({ bloco, progresso }) => (
            <div
              key={bloco.resumo_id}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{bloco.metadata.titulo}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {progresso.srs.lapsos} recaídas · {bloco.metadata.disciplina}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => alternarExplicacao(bloco)}
                    style={{ padding: '7px 14px', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Por que isso resiste?
                  </button>
                  <button
                    onClick={() => navigate(`/bloco/${bloco.resumo_id}`)}
                    style={{ padding: '7px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Reler
                  </button>
                  <button
                    onClick={() => reformularParaLeech(bloco.resumo_id)}
                    style={{ padding: '7px 14px', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reiniciar suave
                  </button>
                </div>
              </div>
              {expandido === bloco.resumo_id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                  {explicacoes[bloco.resumo_id] ? (
                    <>
                      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>{explicacoes[bloco.resumo_id].titulo}</p>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{explicacoes[bloco.resumo_id].explicacao}</p>
                      {explicacoes[bloco.resumo_id].bloco_alvo_id && (
                        <button
                          onClick={() => navigate(`/bloco/${explicacoes[bloco.resumo_id].bloco_alvo_id}`)}
                          style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                        >
                          Ir para o pré-requisito →
                        </button>
                      )}
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>Analisando...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Pagina>
  )
}
