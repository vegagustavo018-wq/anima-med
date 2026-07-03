import { useEffect, useMemo, useState } from 'react'
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos'
import { useDiarioStore } from '@core/store/diarioStore'
import { useDuvidasStore } from '@core/store/duvidasStore'

function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Diário do Organismo — daily note ligada às dúvidas capturadas (bloco 9). */
export function DiarioPage() {
  const { entradas, carregarTudo, salvar } = useDiarioStore()
  const { duvidas, carregar: carregarDuvidas, resolver } = useDuvidasStore()
  const [diaAtivo, setDiaAtivo] = useState(hoje())
  const [texto, setTexto] = useState('')
  const [salvo, setSalvo] = useState(true)

  useEffect(() => {
    carregarTudo()
    carregarDuvidas()
  }, [carregarTudo, carregarDuvidas])

  useEffect(() => {
    setTexto(entradas.get(diaAtivo)?.texto ?? '')
    setSalvo(true)
  }, [diaAtivo, entradas])

  const duvidasDoDia = useMemo(
    () => duvidas.filter((d) => d.criado_em.slice(0, 10) === diaAtivo),
    [duvidas, diaAtivo]
  )

  const diasComEntrada = useMemo(
    () => [...entradas.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 14),
    [entradas]
  )

  const persistir = async (novoTexto: string) => {
    setTexto(novoTexto)
    setSalvo(false)
  }

  useEffect(() => {
    if (salvo) return
    const t = setTimeout(async () => {
      await salvar(diaAtivo, texto, duvidasDoDia.map((d) => d.id!).filter(Boolean))
      setSalvo(true)
    }, 600)
    return () => clearTimeout(t)
  }, [texto, salvo, diaAtivo, salvar, duvidasDoDia])

  return (
    <Pagina largura={820}>
      <CabecalhoPagina titulo="Diário do Organismo" subtitulo="Um lugar para pensar em voz alta. Ninguém corrige isso." />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setDiaAtivo(hoje())}
          style={{
            padding: '6px 14px',
            borderRadius: 99,
            border: `1px solid ${diaAtivo === hoje() ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: diaAtivo === hoje() ? 'var(--color-accent-glow)' : 'transparent',
            color: diaAtivo === hoje() ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Hoje
        </button>
        {diasComEntrada.filter((d) => d !== hoje()).map((d) => (
          <button
            key={d}
            onClick={() => setDiaAtivo(d)}
            style={{
              padding: '6px 12px',
              borderRadius: 99,
              border: `1px solid ${diaAtivo === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: diaAtivo === d ? 'var(--color-accent-glow)' : 'transparent',
              color: diaAtivo === d ? 'var(--color-accent)' : 'var(--color-text-muted)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </button>
        ))}
      </div>

      <textarea
        value={texto}
        onChange={(e) => persistir(e.target.value)}
        placeholder="O que passou pela sua cabeça estudando hoje?"
        rows={10}
        style={{
          width: '100%',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          color: 'var(--color-text-primary)',
          fontSize: 15,
          lineHeight: 1.7,
          fontFamily: 'var(--font-serif)',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right' }}>
        {salvo ? 'salvo' : 'salvando...'}
      </p>

      {duvidasDoDia.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Dúvidas capturadas neste dia
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {duvidasDoDia.map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  opacity: d.resolvida ? 0.5 : 1,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  "{d.trecho.slice(0, 100)}"
                </p>
                {!d.resolvida && (
                  <button
                    onClick={() => d.id && resolver(d.id)}
                    style={{ flexShrink: 0, background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}
                  >
                    Resolvida
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {diasComEntrada.length === 0 && (
        <div style={{ marginTop: 20 }}>
          <FalaAnima texto="Escreva livremente. Com o tempo, este diário vira um mapa de como você pensa." />
        </div>
      )}
    </Pagina>
  )
}
