import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBlocoStore } from '@core/store/blocoStore'
import { useUIStore } from '@core/store/uiStore'
import type { BlocoPreview } from '@core/types/schema'

interface Comando {
  id: string
  label: string
  grupo: string
  icone: string
  run: () => void
  palavrasChave?: string
}

/**
 * Central de Comando — busca de blocos + ações do app, invocada por `/` ou
 * Ctrl/Cmd+K de qualquer lugar. Evolução da busca simples para paleta completa
 * (Superhuman/Linear/Raycast) — bloco 10.
 */
export function BuscaGlobal() {
  const navigate = useNavigate()
  const { buscar } = useBlocoStore()
  const { toggleFoco, toggleSidebar, setReduzirMovimento, reduzirMovimento, setPerfilSessao } =
    useUIStore()
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<BlocoPreview[]>([])
  const [sel, setSel] = useState(0)

  const abrir = useCallback(() => {
    setTermo('')
    setResultados([])
    setSel(0)
    setAberto(true)
  }, [])

  const comandos: Comando[] = useMemo(
    () => [
      { id: 'nav-inicio', label: 'Ir para Início', grupo: 'Navegar', icone: '✦', run: () => navigate('/') },
      { id: 'nav-explorar', label: 'Ir para Explorar', grupo: 'Navegar', icone: '◎', run: () => navigate('/explorar') },
      { id: 'nav-estudar', label: 'Ir para Estudar', grupo: 'Navegar', icone: '⬡', run: () => navigate('/estudar') },
      { id: 'nav-questoes', label: 'Ir para Questões (MCQ + Modo Exame)', grupo: 'Navegar', icone: '✎', run: () => navigate('/questoes'), palavrasChave: 'prova simulado revalida mcq flashcard exame' },
      { id: 'nav-progresso', label: 'Ir para Progresso', grupo: 'Navegar', icone: '◈', run: () => navigate('/progresso') },
      { id: 'nav-corpo', label: 'Ir para o Corpo (mapa de domínio)', grupo: 'Navegar', icone: '☉', run: () => navigate('/corpo') },
      { id: 'nav-jardim', label: 'Ir para o Jardim das Sementes', grupo: 'Navegar', icone: '❁', run: () => navigate('/jardim'), palavrasChave: 'plantas srs memoria constancia ritmo' },
      { id: 'nav-eupassado', label: 'Ir para a Câmara do Eu-Passado', grupo: 'Navegar', icone: '🕰', run: () => navigate('/eu-passado'), palavrasChave: 'palpite antes progresso comparar' },
      { id: 'nav-grafo', label: 'Ir para o Grafo Global', grupo: 'Navegar', icone: '✳', run: () => navigate('/grafo') },
      { id: 'nav-analytics', label: 'Ir para Sinais Vitais', grupo: 'Navegar', icone: '◉', run: () => navigate('/sinais') },
      { id: 'nav-diario', label: 'Ir para o Diário do Organismo', grupo: 'Navegar', icone: '❧', run: () => navigate('/diario') },
      { id: 'nav-sintese', label: 'Ir para Canvas de Síntese', grupo: 'Navegar', icone: '✎', run: () => navigate('/sintese') },
      { id: 'nav-clinica', label: 'Ir para Raciocínio Clínico', grupo: 'Navegar', icone: '⚕', run: () => navigate('/clinica') },
      { id: 'nav-calculadora', label: 'Ir para Bancada de Cálculo', grupo: 'Navegar', icone: '∑', run: () => navigate('/calculadora') },
      { id: 'nav-lacunas', label: 'Ir para Detector de Lacunas', grupo: 'Navegar', icone: '◌', run: () => navigate('/lacunas') },
      { id: 'nav-tutoria', label: 'Ir para Tutoria', grupo: 'Navegar', icone: '☯', run: () => navigate('/tutoria') },
      { id: 'nav-provas', label: 'Ir para Provas', grupo: 'Navegar', icone: '⏱', run: () => navigate('/provas') },
      { id: 'nav-leech', label: 'Ir para a Enfermaria de Sanguessugas', grupo: 'Navegar', icone: '✚', run: () => navigate('/leech') },
      { id: 'nav-respirar', label: 'Respirar um pouco', grupo: 'Navegar', icone: '◯', run: () => navigate('/respirar') },
      { id: 'nav-studio', label: 'Ir para o Studio', grupo: 'Navegar', icone: '⚙', run: () => navigate('/studio') },
      { id: 'nav-config', label: 'Ir para Ajustes', grupo: 'Navegar', icone: '⋯', run: () => navigate('/config') },
      { id: 'act-foco', label: 'Alternar Modo Foco', grupo: 'Ações', icone: '◇', run: toggleFoco },
      { id: 'act-sidebar', label: 'Recolher/Expandir menu', grupo: 'Ações', icone: '☰', run: toggleSidebar },
      {
        id: 'act-movimento',
        label: reduzirMovimento ? 'Restaurar animações' : 'Reduzir movimento',
        grupo: 'Ações',
        icone: '≈',
        run: () => setReduzirMovimento(!reduzirMovimento),
      },
      { id: 'perfil-pico', label: 'Perfil de sessão: Pico', grupo: 'Perfil', icone: '↑', run: () => setPerfilSessao('pico'), palavrasChave: 'energia alta' },
      { id: 'perfil-manutencao', label: 'Perfil de sessão: Manutenção', grupo: 'Perfil', icone: '→', run: () => setPerfilSessao('manutencao') },
      { id: 'perfil-exausto', label: 'Perfil de sessão: Exausto', grupo: 'Perfil', icone: '↓', run: () => setPerfilSessao('exausto'), palavrasChave: 'cansado descanso plantão' },
    ],
    [navigate, toggleFoco, toggleSidebar, setReduzirMovimento, reduzirMovimento, setPerfilSessao]
  )

  const comandosFiltrados = useMemo(() => {
    if (!termo.trim()) return comandos
    const t = termo.toLowerCase()
    return comandos.filter(
      (c) => c.label.toLowerCase().includes(t) || c.palavrasChave?.toLowerCase().includes(t)
    )
  }, [termo, comandos])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const emCampo = tag === 'INPUT' || tag === 'TEXTAREA'
      if ((e.key === '/' && !emCampo) || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        abrir()
      }
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abrir])

  useEffect(() => {
    if (!termo.trim()) {
      setResultados([])
      return
    }
    let vivo = true
    // debounce 160ms: não dispara busca a cada tecla numa digitação rápida
    const timer = setTimeout(() => {
      buscar(termo).then((r) => {
        if (vivo) {
          setResultados(r)
          setSel(0)
        }
      })
    }, 160)
    return () => {
      vivo = false
      clearTimeout(timer)
    }
  }, [termo, buscar])

  const irBloco = (id: string) => {
    setAberto(false)
    navigate(`/bloco/${id}`)
  }

  const executar = (c: Comando) => {
    setAberto(false)
    c.run()
  }

  // Lista unificada: comandos primeiro (poucos, previsíveis), depois blocos
  const totalItens = comandosFiltrados.length + resultados.length

  if (!aberto) return null

  return (
    <div
      onClick={() => setAberto(false)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 60,
        padding: '10vh 24px 24px',
        animation: 'entrarSuave 0.15s ease',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Central de comando: buscar blocos ou executar ações"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-accent)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'entrarBaixo 0.18s ease',
        }}
      >
        <input
          autoFocus
          value={termo}
          aria-label="Buscar blocos ou comandos"
          role="combobox"
          aria-expanded={totalItens > 0}
          aria-controls="busca-resultados"
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setSel((s) => Math.min(totalItens - 1, s + 1))
            if (e.key === 'ArrowUp') setSel((s) => Math.max(0, s - 1))
            if (e.key === 'Enter') {
              if (sel < comandosFiltrados.length) executar(comandosFiltrados[sel])
              else {
                const b = resultados[sel - comandosFiltrados.length]
                if (b) irBloco(b.resumo_id)
              }
            }
          }}
          placeholder="Buscar blocos ou comandos…"
          style={{
            width: '100%',
            padding: '18px 20px',
            border: 'none',
            borderBottom: totalItens ? '1px solid var(--color-border)' : 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 16,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div
          aria-live="polite"
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
        >
          {termo.trim() ? `${totalItens} resultado${totalItens === 1 ? '' : 's'}` : ''}
        </div>
        {totalItens > 0 && (
          <div id="busca-resultados" role="listbox" aria-label="Resultados" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            {comandosFiltrados.length > 0 && (
              <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Comandos
              </div>
            )}
            {comandosFiltrados.map((c, i) => (
              <button
                key={c.id}
                onClick={() => executar(c)}
                onMouseEnter={() => setSel(i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  padding: '10px 20px',
                  border: 'none',
                  background: i === sel ? 'var(--color-accent-glow)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 15, color: 'var(--color-accent)', width: 18 }}>{c.icone}</span>
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{c.label}</span>
              </button>
            ))}
            {resultados.length > 0 && (
              <div style={{ padding: '10px 20px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', borderTop: comandosFiltrados.length ? '1px solid var(--color-border)' : 'none', marginTop: comandosFiltrados.length ? 4 : 0 }}>
                Blocos
              </div>
            )}
            {resultados.map((r, idx) => {
              const i = comandosFiltrados.length + idx
              return (
                <button
                  key={r.resumo_id}
                  onClick={() => irBloco(r.resumo_id)}
                  onMouseEnter={() => setSel(i)}
                  style={{
                    width: '100%',
                    display: 'block',
                    textAlign: 'left',
                    padding: '12px 20px',
                    border: 'none',
                    background: i === sel ? 'var(--color-accent-glow)' : 'transparent',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600 }}>
                    {r.metadata.titulo}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {r.metadata.disciplina} · sem {r.metadata.semestre} · {r.resumo_id}
                  </p>
                </button>
              )
            })}
          </div>
        )}
        {termo.trim() && totalItens === 0 && (
          <p style={{ padding: '16px 20px', margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
            Nada encontrado para "{termo}".
          </p>
        )}
        <div style={{ padding: '8px 20px', display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  )
}
