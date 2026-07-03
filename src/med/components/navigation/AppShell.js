import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@core/store/uiStore';
// Navegação AGRUPADA — antes 10 páginas ricas (Grafo, Diário, Síntese, Clínica,
// Calculadora, Lacunas, Tutoria, Provas, Enfermaria, Respirar) não tinham entrada
// visual: só existiam na paleta de comando. Agora toda rota tem casa.
const GRUPOS = [
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
];
const MOBILE = [
    { to: '/', label: 'Início', icon: '✦', end: true },
    { to: '/explorar', label: 'Explorar', icon: '◎' },
    { to: '/estudar', label: 'Estudar', icon: '⬡' },
    { to: '/corpo', label: 'Corpo', icon: '☉' },
];
function abrirBusca() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
}
function useEstreito() {
    const [estreito, setEstreito] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const fn = () => setEstreito(mq.matches);
        mq.addEventListener('change', fn);
        return () => mq.removeEventListener('change', fn);
    }, []);
    return estreito;
}
function CarregandoConteudo() {
    return (_jsxs("div", { style: { padding: 48, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)' }, children: [_jsx("span", { className: "anima-respira", style: { fontSize: 18, color: 'var(--color-accent-dim)' }, children: "\u2726" }), _jsx("span", { style: { fontSize: 13 }, children: "abrindo\u2026" })] }));
}
export function AppShell() {
    const { sidebarAberta, toggleSidebar, modoFoco, setUltimo } = useUIStore();
    const location = useLocation();
    const estreito = useEstreito();
    const mainRef = useRef(null);
    useEffect(() => {
        if (!location.pathname.startsWith('/estudar')) {
            setUltimo(useUIStore.getState().ultimoBloco, location.pathname);
        }
        // a11y: leva o foco ao conteúdo novo em cada troca de rota (SPA)
        mainRef.current?.focus();
    }, [location.pathname, setUltimo]);
    const conteudo = (_jsx(Suspense, { fallback: _jsx(CarregandoConteudo, {}), children: _jsx(Outlet, {}) }));
    if (modoFoco) {
        return (_jsx("div", { style: { minHeight: '100svh', background: 'var(--color-bg-base)' }, children: _jsx("main", { ref: mainRef, id: "conteudo", tabIndex: -1, style: { outline: 'none' }, children: conteudo }) }));
    }
    // ── Mobile: conteúdo full-width + navegação inferior ──────────────────────
    if (estreito) {
        return (_jsxs("div", { style: { minHeight: '100svh', background: 'var(--color-bg-base)', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }, children: [_jsx("a", { href: "#conteudo", className: "anima-skip-link", children: "Pular para o conte\u00FAdo" }), _jsx("main", { ref: mainRef, id: "conteudo", tabIndex: -1, style: { outline: 'none' }, children: conteudo }), _jsxs("nav", { "aria-label": "Navega\u00E7\u00E3o principal", style: {
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
                    }, children: [MOBILE.map(({ to, label, icon, end }) => (_jsxs(NavLink, { to: to, end: end, "aria-label": label, style: ({ isActive }) => ({
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3,
                                textDecoration: 'none',
                                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 10,
                            }), children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 18 }, children: icon }), label] }, to))), _jsxs("button", { onClick: abrirBusca, "aria-label": "Buscar e mais op\u00E7\u00F5es", style: {
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
                            }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 18 }, children: "\u2315" }), "Mais"] })] })] }));
    }
    // ── Desktop: sidebar agrupada + conteúdo ──────────────────────────────────
    return (_jsxs("div", { style: {
            display: 'grid',
            gridTemplateColumns: sidebarAberta ? '236px 1fr' : '64px 1fr',
            gridTemplateRows: '100svh',
            transition: 'grid-template-columns 0.24s cubic-bezier(0.4,0,0.2,1)',
            background: 'transparent',
        }, children: [_jsx("a", { href: "#conteudo", className: "anima-skip-link", children: "Pular para o conte\u00FAdo" }), _jsxs("aside", { style: {
                    background: 'var(--color-bg-elevated)',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '18px 0',
                    overflow: 'hidden auto',
                }, children: [_jsxs("div", { style: { padding: '0 18px 22px', display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 22, color: 'var(--color-accent)' }, children: "\u2726" }), sidebarAberta && (_jsxs("span", { style: { fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)' }, children: ["ANIMA ", _jsx("span", { style: { color: 'var(--color-text-muted)', fontWeight: 400 }, children: "Med" })] }))] }), _jsx("div", { style: { padding: '0 14px 14px' }, children: _jsxs("button", { onClick: abrirBusca, "aria-label": "Buscar blocos ou comandos", title: "Buscar blocos ou comandos ( / )", style: {
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
                            }, children: [_jsx("span", { "aria-hidden": "true", children: "\u2315" }), sidebarAberta && _jsx("span", { style: { flex: 1, textAlign: 'left' }, children: "Buscar..." }), sidebarAberta && _jsx("span", { style: { fontSize: 10, opacity: 0.7 }, children: "/" })] }) }), _jsx("nav", { "aria-label": "Navega\u00E7\u00E3o principal", style: { flex: 1 }, children: GRUPOS.map((grupo, gi) => (_jsxs("div", { style: { marginBottom: 6 }, children: [sidebarAberta && grupo.titulo && (_jsx("p", { style: { margin: '10px 20px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }, children: grupo.titulo })), !sidebarAberta && gi > 0 && _jsx("div", { style: { height: 1, background: 'var(--color-border)', margin: '8px 14px', opacity: 0.5 } }), grupo.itens.map(({ to, label, icon, end }) => (_jsxs(NavLink, { to: to, end: end, "aria-label": label, title: sidebarAberta ? undefined : label, style: ({ isActive }) => ({
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
                                    }), children: [_jsx("span", { "aria-hidden": "true", style: { fontSize: 16, width: 18, textAlign: 'center' }, children: icon }), sidebarAberta && _jsx("span", { children: label })] }, to)))] }, gi))) }), _jsx("button", { onClick: toggleSidebar, "aria-label": sidebarAberta ? 'Recolher menu' : 'Expandir menu', style: {
                            margin: '8px 14px 0',
                            padding: '8px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            fontSize: 12,
                        }, title: sidebarAberta ? 'Recolher' : 'Expandir', children: sidebarAberta ? '← Recolher' : '→' })] }), _jsx("main", { ref: mainRef, id: "conteudo", tabIndex: -1, style: { overflow: 'hidden auto', background: 'var(--color-bg-base)', outline: 'none' }, children: conteudo })] }));
}
