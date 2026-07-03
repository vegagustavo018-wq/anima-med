import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useUIStore } from '@core/store/uiStore'

interface ItemNav {
  to: string
  label: string
  icon: string
  end?: boolean
}

// Navegação AGRUPADA — antes 10 páginas ricas (Grafo, Diário, Síntese, Clínica,
// Calculadora, Lacunas, Tutoria, Provas, Enfermaria, Respirar) não tinham entrada
// visual: só existiam na paleta de comando. Agora toda rota tem casa.
const GRUPOS: { titulo: string | null; itens: ItemNav[] }[] = [
  {
    titulo: 'Estudar',
    itens: [
      { to: '/', label: 'Início', icon: '✦', end: true },
      { to: '/explorar', label: 'Explorar', icon: '◎' },
      { to: '/estudar', label: 'Estudar', icon: '⬡' },
      { to: '/questoes', label: 'Questões', icon: '✎' },
      { to: '/provas', label: 'Provas', icon: '⏱' },
    ],
  },
  {
    titulo: 'Ferramentas',
    itens: [
      { to: '/clinica', label: 'Raciocínio Clínico', icon: '⚕' },
      { to: '/calculadora', label: 'Bancada de Cálculo', icon: '∑' },
      { to: '/tutoria', label: 'Tutoria', icon: '☯' },
      { to: '/lacunas', label: 'Detector de Lacunas', icon: '◌' },
      { to: '/sintese', label: 'Canvas de Síntese', icon: '✎' },
    ],
  },
  {
    titulo: 'Organismo',
    itens: [
      { to: '/corpo', label: 'Corpo', icon: '☉' },
      { to: '/jardim', label: 'Jardim', icon: '❁' },
      { to: '/progresso', label: 'Progresso', icon: '◈' },
      { to: '/sinais', label: 'Sinais Vitais', icon: '◉' },
      { to: '/memoria', label: 'Memória & Prontidão', icon: '◔' },
      { to: '/eu-passado', label: 'Eu-Passado', icon: '🕰' },
      { to: '/grafo', label: 'Grafo', icon: '✳' },
      { to: '/diario', label: 'Diário', icon: '❧' },
      { to: '/leech', label: 'Enfermaria', icon: '✚' },
    ],
  },
  {
    titulo: null,
    itens: [
      { to: '/respirar', label: 'Respirar', icon: '◯' },
      { to: '/studio', label: 'Studio', icon: '⚙' },
      { to: '/config', label: 'Ajustes', icon: '⋯' },
    ],
  },
]

const MOBILE: ItemNav[] = [
  { to: '/', label: 'Início', icon: '✦', end: true },
  { to: '/explorar', label: 'Explorar', icon: '◎' },
  { to: '/estudar', label: 'Estudar', icon: '⬡' },
  { to: '/corpo', label: 'Corpo', icon: '☉' },
]

function abrirBusca() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
}

function useEstreito(): boolean {
  const [estreito, setEstreito] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const fn = () => setEstreito(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return estreito
}

function CarregandoConteudo() {
  return (
    <div style={{ padding: 48, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)' }}>
      <span className="anima-respira" style={{ fontSize: 18, color: 'var(--color-accent-dim)' }}>✦</span>
      <span style={{ fontSize: 13 }}>abrindo…</span>
    </div>
  )
}

export function AppShell() {
  const { sidebarAberta, toggleSidebar, modoFoco, setUltimo } = useUIStore()
  const location = useLocation()
  const estreito = useEstreito()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!location.pathname.startsWith('/estudar')) {
      setUltimo(useUIStore.getState().ultimoBloco, location.pathname)
    }
    // a11y: leva o foco ao conteúdo novo em cada troca de rota (SPA)
    mainRef.current?.focus()
  }, [location.pathname, setUltimo])

  const conteudo = (
    <Suspense fallback={<CarregandoConteudo />}>
      <Outlet />
    </Suspense>
  )

  if (modoFoco) {
    return (
      <div style={{ minHeight: '100svh', background: 'var(--color-bg-base)' }}>
        <main ref={mainRef} id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
          {conteudo}
        </main>
      </div>
    )
  }

  // ── Mobile: conteúdo full-width + navegação inferior ──────────────────────
  if (estreito) {
    return (
      <div style={{ minHeight: '100svh', background: 'var(--color-bg-base)', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        <a href="#conteudo" className="anima-skip-link">Pular para o conteúdo</a>
        <main ref={mainRef} id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
          {conteudo}
        </main>
        <nav
          aria-label="Navegação principal"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 'calc(64px + env(safe-area-inset-bottom))',
            paddingBottom: 'env(safe-area-inset-bottom)',
            display: 'grid',
            gridTemplateColumns: `repeat(${MOBILE.length + 1}, 1fr)`,
            background: 'var(--color-bg-elevated)',
            borderTop: '1px solid var(--color-border)',
            zIndex: 30,
          }}
        >
          {MOBILE.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: 10,
              })}
            >
              <span aria-hidden="true" style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
          <button
            onClick={abrirBusca}
            aria-label="Buscar e mais opções"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18 }}>⌕</span>
            Mais
          </button>
        </nav>
      </div>
    )
  }

  // ── Desktop: sidebar agrupada + conteúdo ──────────────────────────────────
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: sidebarAberta ? '236px 1fr' : '64px 1fr',
        gridTemplateRows: '100svh',
        transition: 'grid-template-columns 0.24s cubic-bezier(0.4,0,0.2,1)',
        background: 'transparent',
      }}
    >
      <a href="#conteudo" className="anima-skip-link">Pular para o conteúdo</a>
      <aside
        style={{
          background: 'var(--color-bg-elevated)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 0',
          overflow: 'hidden auto',
        }}
      >
        <div style={{ padding: '0 18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span aria-hidden="true" style={{ fontSize: 22, color: 'var(--color-accent)' }}>✦</span>
          {sidebarAberta && (
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}>
              ANIMA <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>Med</span>
            </span>
          )}
        </div>

        <div style={{ padding: '0 14px 14px' }}>
          <button
            onClick={abrirBusca}
            aria-label="Buscar blocos ou comandos"
            title="Buscar blocos ou comandos ( / )"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-muted)',
              fontSize: 12,
              cursor: 'pointer',
              justifyContent: sidebarAberta ? 'flex-start' : 'center',
            }}
          >
            <span aria-hidden="true">⌕</span>
            {sidebarAberta && <span style={{ flex: 1, textAlign: 'left' }}>Buscar...</span>}
            {sidebarAberta && <span style={{ fontSize: 10, opacity: 0.7 }}>/</span>}
          </button>
        </div>

        <nav aria-label="Navegação principal" style={{ flex: 1 }}>
          {GRUPOS.map((grupo, gi) => (
            <div key={gi} style={{ marginBottom: 6 }}>
              {sidebarAberta && grupo.titulo && (
                <p style={{ margin: '10px 20px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  {grupo.titulo}
                </p>
              )}
              {!sidebarAberta && gi > 0 && <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 14px', opacity: 0.5 }} />}
              {grupo.itens.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  title={sidebarAberta ? undefined : label}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 18px',
                    textDecoration: 'none',
                    background: isActive ? 'var(--color-accent-glow)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'background 0.15s ease, color 0.15s ease',
                    justifyContent: sidebarAberta ? 'flex-start' : 'center',
                  })}
                >
                  <span aria-hidden="true" style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{icon}</span>
                  {sidebarAberta && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
          style={{
            margin: '8px 14px 0',
            padding: '8px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: 12,
          }}
          title={sidebarAberta ? 'Recolher' : 'Expandir'}
        >
          {sidebarAberta ? '← Recolher' : '→'}
        </button>
      </aside>

      <main ref={mainRef} id="conteudo" tabIndex={-1} style={{ overflow: 'hidden auto', background: 'var(--color-bg-base)', outline: 'none' }}>
        {conteudo}
      </main>
    </div>
  )
}
