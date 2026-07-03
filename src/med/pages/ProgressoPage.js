import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Pagina, CabecalhoPagina, Grade } from '@core/components/ui/primitivos';
import { calcularMetricas } from '@core/anima/metricas';
export function ProgressoPage() {
    const [m, setM] = useState(null);
    useEffect(() => {
        calcularMetricas().then(setM);
    }, []);
    if (!m)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Calculando..." }) });
    return (_jsxs(Pagina, { largura: 900, children: [_jsx(CabecalhoPagina, { titulo: "Progresso", subtitulo: "Dom\u00EDnio real \u2014 n\u00E3o blocos vistos, blocos que ficaram." }), _jsxs(Grade, { min: 150, children: [_jsx(Kpi, { valor: `${m.percentualDominio}%`, rotulo: "do acervo em dom\u00EDnio", cor: "var(--color-accent)" }), _jsx(Kpi, { valor: m.streak, rotulo: m.streak === 1 ? 'dia seguido' : 'dias seguidos' }), _jsx(Kpi, { valor: m.vencidos, rotulo: "vencidos hoje", cor: m.vencidos > 0 ? 'var(--color-warning)' : 'var(--color-success)' }), _jsx(Kpi, { valor: m.calibracao != null ? `${m.calibracao}%` : '—', rotulo: "calibra\u00E7\u00E3o (confian\u00E7a \u00D7 acerto)", cor: m.calibracao != null && m.calibracao < 70 ? 'var(--color-warning)' : 'var(--color-success)' })] }), _jsxs("section", { style: { marginTop: 40 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }, children: "Por disciplina" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: m.porDisciplina.map((d) => (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: 14, color: 'var(--color-text-primary)', textTransform: 'capitalize' }, children: d.disciplina }), _jsxs("span", { style: { fontSize: 13, color: 'var(--color-text-muted)' }, children: [d.dominados, "/", d.total, " \u00B7 ", d.percentual, "%"] })] }), _jsx("div", { style: { height: 8, background: 'var(--color-bg-card)', borderRadius: 4, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${d.percentual}%`, background: 'var(--color-accent)', transition: 'width 0.4s' } }) })] }, d.disciplina))) })] }), m.iniciados === 0 && (_jsx("p", { style: { marginTop: 32, fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }, children: "Voc\u00EA ainda n\u00E3o come\u00E7ou a estudar por mim. Quando come\u00E7ar, \u00E9 aqui que vejo voc\u00EA crescer." }))] }));
}
function Kpi({ valor, rotulo, cor }) {
    return (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 18 }, children: [_jsx("p", { style: { margin: 0, fontSize: 28, fontWeight: 700, color: cor ?? 'var(--color-accent)' }, children: valor }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }, children: rotulo })] }));
}
