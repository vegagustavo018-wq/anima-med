import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos'
import { useProvasStore, diasAte } from '@core/store/provasStore'
import { useSessaoConfigStore } from '@core/store/sessaoConfigStore'

/** Contagem regressiva de prova com plano vivo (bloco 6). */
export function ProvasPage() {
  const navigate = useNavigate()
  const { provas, carregar, criar, remover } = useProvasStore()
  const { aplicarPreset } = useSessaoConfigStore()
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')

  useEffect(() => {
    carregar()
  }, [carregar])

  const salvar = async () => {
    if (!titulo.trim() || !data) return
    await criar(titulo.trim(), data, [])
    setTitulo('')
    setData('')
  }

  const irEstudarComFoco = async () => {
    await aplicarPreset('prova')
    navigate('/estudar')
  }

  return (
    <Pagina largura={720}>
      <CabecalhoPagina titulo="Provas" subtitulo="Contagem serena, plano vivo — não pânico de véspera." />

      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nome da prova"
          style={{ flex: 2, minWidth: 160, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 }}
        />
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 }}
        />
        <button
          onClick={salvar}
          style={{ padding: '10px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Adicionar
        </button>
      </div>

      {provas.length === 0 ? (
        <EstadoVazio>
          <FalaAnima texto="Nenhuma prova marcada. Quando marcar, eu ajusto o ritmo das revisões para você." />
        </EstadoVazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {provas.map((p) => {
            const dias = diasAte(p.data)
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.titulo}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: dias <= 3 ? 'var(--color-warning)' : 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                    {dias === 0 ? 'hoje' : dias < 0 ? 'passou' : `${dias}d`}
                  </span>
                  <button onClick={() => irEstudarComFoco()} style={{ padding: '6px 12px', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    Focar
                  </button>
                  <button onClick={() => p.id && remover(p.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer' }}>
                    ×
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Pagina>
  )
}
