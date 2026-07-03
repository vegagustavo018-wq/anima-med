import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLiveQuery } from 'dexie-react-hooks';
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos';
import { montarPainelMemoria } from '@core/anima/memoria';
export function MemoriaPage() {
    // uma única leitura das tabelas → os três painéis (evita 3 varreduras concorrentes)
    const painel = useLiveQuery(() => montarPainelMemoria(30), []);
    const carga = painel?.carga;
    const massa = painel?.massa;
    const prontidao = painel?.prontidao;
    const maxCarga = carga ? Math.max(1, ...carga.map((d) => d.total)) : 1;
    return (_jsxs(Pagina, { largura: 920, children: [_jsx(CabecalhoPagina, { titulo: "Mem\u00F3ria & Prontid\u00E3o", subtitulo: "A massa viva do que voc\u00EA sabe, a carga que vem pela frente, e o quanto voc\u00EA est\u00E1 pronto." }), prontidao && (_jsxs("div", { style: {
                    display: 'flex',
                    gap: 24,
                    alignItems: 'center',
                    padding: '22px 24px',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 20,
                    flexWrap: 'wrap',
                }, children: [_jsx(Gauge, { score: prontidao.score }), _jsxs("div", { style: { flex: 1, minWidth: 260 }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }, children: [_jsx("p", { style: { margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }, children: "Prontid\u00E3o para a prova" }), prontidao.diasAteProva != null && (_jsxs("span", { style: { fontSize: 12, color: 'var(--color-warning)', fontWeight: 700 }, children: [prontidao.provaTitulo, " em ", prontidao.diasAteProva, "d"] }))] }), _jsx("p", { style: { margin: '0 0 12px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }, children: prontidao.veredito }), _jsxs("div", { style: { display: 'flex', gap: 18, flexWrap: 'wrap' }, children: [_jsx(SubScore, { label: "dom\u00EDnio", pct: prontidao.dominioPct }), _jsx(SubScore, { label: "acerto em quest\u00F5es", pct: prontidao.acertoQuestoesPct }), _jsx(SubScore, { label: "backlog vencido", pct: prontidao.vencidosPct, invertido: true })] })] })] })), massa && (_jsxs("div", { style: { display: 'flex', gap: 18, marginBottom: 26, flexWrap: 'wrap' }, children: [_jsx(Metrica, { valor: massa.massa, rotulo: "massa de mem\u00F3ria (dias-item)" }), _jsx(Metrica, { valor: massa.itensVivos, rotulo: "itens vivos" }), _jsx(Metrica, { valor: `${Math.round(massa.retencaoEstim * 100)}%`, rotulo: "reten\u00E7\u00E3o estimada", cor: "var(--color-success)" }), _jsx(Metrica, { valor: massa.vencidos, rotulo: "vencidos agora", cor: massa.vencidos ? 'var(--color-warning)' : undefined })] })), _jsxs("section", { children: [_jsx("p", { style: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }, children: "Carga dos pr\u00F3ximos 30 dias" }), carga && carga.every((d) => d.total === 0) ? (_jsx(FalaAnima, { texto: "Nada agendado ainda. Conforme voc\u00EA estuda e resolve quest\u00F5es, eu distribuo as revis\u00F5es aqui \u2014 para voc\u00EA nunca ver tudo vencer de uma vez." })) : (carga && (_jsx("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 130, padding: '0 2px' }, children: carga.map((d, i) => {
                            const h = Math.round((d.total / maxCarga) * 110);
                            const dia = new Date(d.data);
                            const hoje = i === 0;
                            return (_jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }, title: `${d.data}: ${d.blocos} blocos + ${d.questoes} questões`, children: [_jsx("div", { style: {
                                            width: '100%',
                                            height: Math.max(2, h),
                                            borderRadius: 3,
                                            background: hoje
                                                ? 'var(--color-warning)'
                                                : d.total === 0
                                                    ? 'var(--color-border)'
                                                    : `color-mix(in srgb, var(--color-accent) ${40 + (d.total / maxCarga) * 60}%, transparent)`,
                                        } }), i % 5 === 0 && (_jsx("span", { style: { fontSize: 9, color: 'var(--color-text-muted)' }, children: dia.getDate() }))] }, d.data));
                        }) })))] })] }));
}
function Gauge({ score }) {
    const cor = score >= 75 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    const r = 44;
    const circ = 2 * Math.PI * r;
    const off = circ * (1 - score / 100);
    return (_jsxs("div", { style: { position: 'relative', width: 108, height: 108, flexShrink: 0 }, children: [_jsxs("svg", { width: "108", height: "108", style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: "54", cy: "54", r: r, fill: "none", stroke: "var(--color-bg-hover)", strokeWidth: "8" }), _jsx("circle", { cx: "54", cy: "54", r: r, fill: "none", stroke: cor, strokeWidth: "8", strokeLinecap: "round", strokeDasharray: circ, strokeDashoffset: off, style: { transition: 'stroke-dashoffset 0.6s ease' } })] }), _jsxs("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, children: [_jsx("span", { style: { fontSize: 28, fontWeight: 800, color: cor }, children: score }), _jsx("span", { style: { fontSize: 10, color: 'var(--color-text-muted)' }, children: "/ 100" })] })] }));
}
function SubScore({ label, pct, invertido }) {
    const v = Math.round(pct * 100);
    const bom = invertido ? v <= 20 : v >= 60;
    return (_jsxs("div", { children: [_jsxs("div", { style: { fontSize: 18, fontWeight: 700, color: bom ? 'var(--color-success)' : 'var(--color-text-secondary)' }, children: [v, "%"] }), _jsx("div", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: label })] }));
}
function Metrica({ valor, rotulo, cor }) {
    return (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', minWidth: 130 }, children: [_jsx("div", { style: { fontSize: 24, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }, children: valor }), _jsx("div", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: rotulo })] }));
}
