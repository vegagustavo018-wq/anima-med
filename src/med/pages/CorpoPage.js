import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos';
import { calcularMetricas } from '@core/anima/metricas';
import { calcularZonas } from '@core/anima/corpo';
import { calcularOnda, continuidadeAtual } from '@core/anima/ritmo';
import { distribuir, NOME_NIVEL, ICONE_NIVEL } from '@core/anima/maestria';
import { db } from '@core/db/database';
import { useUIStore } from '@core/store/uiStore';
import { useDescobertasStore } from '@core/store/descobertasStore';
import { CorpoIluminado } from '@med/components/corpo/CorpoIluminado';
import { RitmoOnda } from '@med/components/corpo/RitmoOnda';
export function CorpoPage() {
    const { reduzirMovimento } = useUIStore();
    const { descobertas, carregar: carregarDescobertas } = useDescobertasStore();
    const [zonas, setZonas] = useState([]);
    const [zonaFoco, setZonaFoco] = useState(null);
    const [dias, setDias] = useState([]);
    const [distMaestria, setDistMaestria] = useState(null);
    useEffect(() => {
        calcularMetricas().then((m) => setZonas(calcularZonas(m.porDisciplina)));
        calcularOnda().then(setDias);
        db.progresso.toArray().then((p) => setDistMaestria(distribuir(p)));
        carregarDescobertas();
    }, [carregarDescobertas]);
    const zonaSelecionada = zonaFoco ? zonas.find((z) => z.id === zonaFoco) : null;
    const ritmo = dias.length ? continuidadeAtual(dias) : 0;
    return (_jsxs(Pagina, { largura: 880, children: [_jsx(CabecalhoPagina, { titulo: "O Corpo", subtitulo: "Cada zona acende por dom\u00EDnio real \u2014 n\u00E3o por tempo estudado." }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start', marginBottom: 40 }, children: [_jsx("div", { style: {
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-xl)',
                            padding: 24,
                        }, children: _jsx(CorpoIluminado, { zonas: zonas, reduzirMovimento: reduzirMovimento, zonaFoco: zonaFoco, onZonaClick: (id) => setZonaFoco((z) => (z === id ? null : id)) }) }), _jsxs("div", { children: [zonaSelecionada ? (_jsxs("div", { style: { animation: 'entrarBaixo 0.2s ease' }, children: [_jsx("p", { style: { margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }, children: zonaSelecionada.rotulo }), _jsxs("p", { style: { margin: '0 0 12px', fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)' }, children: [zonaSelecionada.percentual, "%"] }), _jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: [zonaSelecionada.totalBlocos, " blocos nesta regi\u00E3o \u00B7 disciplinas: ", zonaSelecionada.disciplinas.join(', ') || '—'] })] })) : (_jsx(FalaAnima, { texto: "Toque numa zona do corpo para ver o que ela sabe de voc\u00EA." })), _jsx("div", { style: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }, children: zonas
                                    .slice()
                                    .sort((a, b) => b.percentual - a.percentual)
                                    .map((z) => (_jsxs("button", { onClick: () => setZonaFoco((cur) => (cur === z.id ? null : z.id)), style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        background: zonaFoco === z.id ? 'var(--color-accent-glow)' : 'transparent',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }, children: [_jsx("span", { style: { fontSize: 11, color: 'var(--color-text-secondary)', flex: 1 }, children: z.rotulo }), _jsxs("span", { style: { fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }, children: [z.percentual, "%"] })] }, z.id))) })] })] }), distMaestria && distMaestria.total > 0 && (_jsxs("section", { style: { marginBottom: 40 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }, children: "\u00C1rvore de Maestria" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10 }, children: [1, 2, 3, 4, 5].map((n) => {
                            const c = distMaestria.contagem[n];
                            const p = distMaestria.total ? Math.round((c / distMaestria.total) * 100) : 0;
                            return (_jsxs("div", { style: {
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '16px 10px',
                                    textAlign: 'center',
                                }, children: [_jsx("div", { style: { fontSize: 22, color: n === 5 ? 'var(--color-accent)' : 'var(--color-text-secondary)', marginBottom: 6 }, children: ICONE_NIVEL[n] }), _jsx("p", { style: { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }, children: c }), _jsx("p", { style: { margin: '2px 0 0', fontSize: 10, color: 'var(--color-text-muted)' }, children: NOME_NIVEL[n] }), _jsx("div", { style: { height: 3, background: 'var(--color-bg-hover)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${p}%`, background: 'var(--color-accent)' } }) })] }, n));
                        }) })] })), _jsxs("section", { style: { marginBottom: 40 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }, children: "Ritmo \u2014 30 dias" }), _jsxs("span", { style: { fontSize: 12, color: 'var(--color-text-secondary)' }, children: [ritmo, " ", ritmo === 1 ? 'dia seguido' : 'dias seguidos'] })] }), _jsx("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }, children: dias.length > 0 ? (_jsx(RitmoOnda, { dias: dias, reduzirMovimento: reduzirMovimento })) : (_jsx("p", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: "Ainda sem ritmo registrado." })) })] }), descobertas.length > 0 && (_jsxs("section", { children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }, children: "Marcos de Descoberta" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: descobertas.slice(0, 8).map((d) => (_jsxs("div", { style: {
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderLeft: '2px solid var(--color-accent)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 16px',
                            }, children: [_jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }, children: ["\"", d.narrativa, "\""] }), _jsx("p", { style: { margin: '6px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }, children: new Date(d.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) })] }, d.id))) })] }))] }));
}
