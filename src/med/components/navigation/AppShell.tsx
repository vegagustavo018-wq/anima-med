import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useUIStore } from '@core/store/uiStore'
import { IconeNav, LogoAnima } from './icones'

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
    titulo: null,
    itens: [
      { to: '/', label: 'Início', icon: 'inicio', end: true },
      { to: '/explorar', label: 'Explorar', icon: 'explorar' },
      { to: '/estudar', label: 'Estudar', icon: 'estudar' },
      { to: '/questoes', label: 'Questões', icon: 'questoes' },
      { to: '/provas', label: 'Provas', icon: 'provas' },
    ],
  },
  {
    titulo: 'Ferramentas',
    itens: [
      { to: '/clinica', label: 'Raciocínio Clínico', icon: 'clinica' },
      { to: '/calculadora', label: 'Bancada de Cálculo', icon: 'calculadora' },
      { to: '/tutoria', label: 'Tutoria', icon: 'tutoria' },
      { to: '/lacunas', label: 'Detector de Lacunas', icon: 'lacunas' },
      { to: '/sintese', label: 'Canvas de Síntese', icon: 'sintese' },
    ],
  },
  {
    titulo: 'Organismo',
    itens: [
      { to: '/corpo', label: 'Corpo', icon: 'corpo' },
      { to: '/jardim', label: 'Jardim', icon: 'jardim' },
      { to: '/progresso', label: 'Progresso', icon: 'progresso' },
      { to: '/sinais', label: 'Sinais Vitais', icon: 'sinais' },
      { to: '/memoria', label: 'Memória & Prontidão', icon: 'memoria' },
      { to: '/eu-passado', label: 'Eu-Passado', icon: 'eu-passado' },
      { to: '/grafo', label: 'Grafo', icon: 'grafo' },
      { to: '/diario', label: 'Diário', icon: 'diario' },
      { to: '/leech', label: 'Enfermaria', icon: 'leech' },
    ],
  },
  {
    titulo: null,
    itens: [
      { to: '/respirar', label: 'Respirar', icon: 'respirar' },
      { to: '/studio', label: 'Studio', icon: 'studio' },
      { to: '/config', label: 'Ajustes', icon: 'config' },
    ],
  },
]

const MOBILE: ItemNav[] = [
  { to: '/', label: 'Início', icon: 'inicio', end: true },
  { to: '/explorar', label: 'Explorar', icon: 'explorar' },
  { to: '/estudar', label: 'Estudar', icon: 'estudar' },
  { to: '/corpo', label: 'Corpo', icon: 'corpo' },
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
      // background transparente: o body já pinta bg-base + luz ambiente; um
      // container opaco aqui cobriria o FundoVivo (canvas em z-index -1)
      <div style={{ minHeight: '100svh', background: 'transparent' }}>
        <main ref={mainRef} id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
          {conteudo}
        </main>
      </div>
    )
  }

  // ── Mobile: conteúdo full-width + navegação inferior ──────────────────────
  if (estreito) {
    return (
      <div style={{ minHeight: '100svh', background: 'transparent', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
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
            background: 'color-mix(in srgb, var(--color-bg-elevated) 88%, transparent)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
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
                gap: 4,
                textDecoration: 'none',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: 10,
                transition: 'color 0.18s ease',
              })}
            >
              <IconeNav nome={icon} tamanho={19} />
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
              gap: 4,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            <IconeNav nome="busca" tamanho={19} />
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
        gridTemplateColumns: sidebarAberta ? '242px 1fr' : '64px 1fr',
        gridTemplateRows: '100svh',
        transition: 'grid-template-columns 0.24s cubic-bezier(0.4,0,0.2,1)',
        background: 'transparent',
      }}
    >
      <a href="#conteudo" className="anima-skip-link">Pular para o conteúdo</a>
      <aside
        style={{
          // Derivado dos tokens (não navy fixo) — acompanha temas claro/sepia/OLED
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-bg-elevated) 86%, transparent) 0%, color-mix(in srgb, var(--color-bg-base) 92%, transparent) 100%)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0 14px',
          overflow: 'hidden auto',
        }}
      >
        <div
          style={{
            padding: '0 18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            justifyContent: sidebarAberta ? 'flex-start' : 'center',
          }}
        >
          <span style={{ display: 'flex', filter: 'drop-shadow(0 0 10px var(--color-accent-glow))' }}>
            <LogoAnima tamanho={sidebarAberta ? 27 : 24} />
          </span>
          {sidebarAberta && (
            <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              ANIMA{' '}
              <span style={{ color: 'var(--color-accent)', fontWeight: 500, letterSpacing: '0.04em' }}>Med</span>
            </span>
          )}
        </div>

        <div style={{ padding: '0 14px 12px' }}>
          <button
            onClick={abrirBusca}
            aria-label="Buscar blocos ou comandos"
            title="Buscar blocos ou comandos ( / )"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 11px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'color-mix(in srgb, var(--color-bg-card) 62%, transparent)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.22)',
              color: 'var(--color-text-muted)',
              fontSize: 12.5,
              cursor: 'pointer',
              justifyContent: sidebarAberta ? 'flex-start' : 'center',
            }}
          >
            <IconeNav nome="busca" tamanho={14} />
            {sidebarAberta && <span style={{ flex: 1, textAlign: 'left' }}>Buscar…</span>}
            {sidebarAberta && (
              <kbd
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-faint)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  padding: '1px 5px',
                  lineHeight: 1.4,
                }}
              >
                /
              </kbd>
            )}
          </button>
        </div>

        <nav aria-label="Navegação principal" style={{ flex: 1 }}>
          {GRUPOS.map((grupo, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              {sidebarAberta && grupo.titulo && (
                <p style={{ margin: '12px 21px 5px', fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}>
                  {grupo.titulo}
                </p>
              )}
              {(!sidebarAberta || !grupo.titulo) && gi > 0 && (
                <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 16px', opacity: 0.7 }} />
              )}
              {grupo.itens.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  title={sidebarAberta ? undefined : label}
                  className={({ isActive }) => `anima-nav-item${isActive ? ' ativo' : ''}`}
                  style={{ justifyContent: sidebarAberta ? 'flex-start' : 'center' }}
                >
                  <span className="nav-icone" style={{ display: 'flex' }}>
                    <IconeNav nome={icon} />
                  </span>
                  {sidebarAberta && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <NavLink
          to="/progresso"
          aria-label="Ver perfil"
          title="Ver perfil"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '10px 10px 0',
            padding: '9px 10px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: 'color-mix(in srgb, var(--color-bg-card) 62%, transparent)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            textDecoration: 'none',
            justifyContent: sidebarAberta ? 'flex-start' : 'center',
            transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-accent)'
            e.currentTarget.style.boxShadow = '0 0 16px var(--color-accent-glow), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))',
              boxShadow: '0 0 12px var(--color-accent-glow)',
              color: 'var(--color-bg-base)',
              fontSize: 12.5,
              fontWeight: 800,
            }}
          >
            G
          </span>
          {sidebarAberta && (
            <span style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>Gustavo</p>
              <p style={{ margin: 0, fontSize: 10.5, color: 'var(--color-text-muted)' }}>Ver perfil</p>
            </span>
          )}
        </NavLink>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
          style={{
            margin: '8px 14px 0',
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: '1px solid transparent',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-faint)',
            cursor: 'pointer',
            fontSize: 11.5,
            transition: 'color 0.18s ease, border-color 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-faint)'
            e.currentTarget.style.borderColor = 'transparent'
          }}
          title={sidebarAberta ? 'Recolher' : 'Expandir'}
        >
          <IconeNav nome={sidebarAberta ? 'seta-esq' : 'seta-dir'} tamanho={14} />
          {sidebarAberta && 'Recolher'}
        </button>
      </aside>

      <main ref={mainRef} id="conteudo" tabIndex={-1} style={{ overflow: 'hidden auto', background: 'transparent', outline: 'none' }}>
        {conteudo}
      </main>
    </div>
  )
}
