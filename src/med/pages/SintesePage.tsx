import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos'
import { useSinteseStore } from '@core/store/sinteseStore'

/** Lista de canvases de síntese (bloco 9). */
export function SintesePage() {
  const navigate = useNavigate()
  const { lista, carregarLista, criar, remover } = useSinteseStore()
  const [titulo, setTitulo] = useState('')

  useEffect(() => {
    carregarLista()
  }, [carregarLista])

  const nova = async () => {
    const t = titulo.trim() || 'Síntese sem título'
    const id = await criar(t)
    navigate(`/sintese/${id}`)
  }

  return (
    <Pagina largura={820}>
      <CabecalhoPagina titulo="Canvas de Síntese" subtitulo="Um espaço livre para amarrar ideias com suas próprias palavras." />

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && nova()}
          placeholder="Nome da síntese (ex: Ciclo de Krebs)"
          style={{ flex: 1, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 }}
        />
        <button onClick={nova} style={{ padding: '10px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Criar
        </button>
      </div>

      {lista.length === 0 ? (
        <EstadoVazio>
          <FalaAnima texto="Nenhuma síntese ainda. Comece uma quando quiser conectar ideias com as próprias mãos." />
        </EstadoVazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/sintese/${s.id}`)}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.titulo}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>{s.nos.length} nós · {s.arestas.length} conexões</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  s.id && remover(s.id)
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </Pagina>
  )
}
