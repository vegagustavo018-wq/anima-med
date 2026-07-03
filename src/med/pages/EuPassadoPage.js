import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos';
import { compararComPassado } from '@core/anima/euPassado';
function tempoRelativo(dias) {
    if (dias <= 0)
        return 'hoje';
    if (dias === 1)
        return 'ontem';
    if (dias < 30)
        return `há ${dias} dias`;
    const meses = Math.round(dias / 30);
    return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;
}
export function EuPassadoPage() {
    const navigate = useNavigate();
    const dados = useLiveQuery(() => compararComPassado(), []);
    return (_jsxs(Pagina, { largura: 820, children: [_jsx(CabecalhoPagina, { titulo: "C\u00E2mara do Eu-Passado", subtitulo: "O \u00FAnico ranking justo: voc\u00EA contra quem voc\u00EA era. Seus palpites de ontem, o seu dom\u00EDnio de hoje." }), !dados ? (_jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Revirando a mem\u00F3ria\u2026" })) : dados.totalPalpites === 0 ? (_jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 40, marginBottom: 16 }, children: "\uD83D\uDD70" }), _jsx(FalaAnima, { texto: dados.narrativa })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { marginBottom: 24 }, children: _jsx(FalaAnima, { texto: dados.narrativa, grande: true }) }), _jsxs("div", { style: { display: 'flex', gap: 22, marginBottom: 24, flexWrap: 'wrap' }, children: [_jsx(Metrica, { n: dados.viradas, label: "chutes que viraram dom\u00EDnio", cor: "var(--color-success)" }), _jsx(Metrica, { n: dados.totalPalpites, label: "palpites guardados" }), dados.primeiroDia && (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }, children: tempoRelativo(Math.floor((Date.now() - new Date(dados.primeiroDia).getTime()) / 86400000)) }), _jsx("div", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: "seu primeiro palpite" })] }))] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: dados.confrontos.map((c) => (_jsx(ConfrontoCard, { c: c, onIr: () => navigate(`/bloco/${c.resumo_id}`) }, c.resumo_id))) })] }))] }));
}
function ConfrontoCard({ c, onIr }) {
    return (_jsxs("button", { onClick: onIr, className: "anima-lift", style: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '14px 16px',
            border: `1px solid ${c.dominadoAgora ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderLeft: `3px solid ${c.dominadoAgora ? 'var(--color-success)' : 'var(--color-border-accent)'}`,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg-card)',
            cursor: 'pointer',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }, children: [_jsx("p", { style: { margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--color-text-primary)' }, children: c.titulo }), _jsx("span", { style: { fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0 }, children: c.disciplina })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginTop: 10 }, children: [_jsxs("div", { children: [_jsxs("span", { style: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }, children: ["voc\u00EA, ", tempoRelativo(c.diasDesde)] }), _jsxs("p", { style: { margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }, children: ["\"", c.palpiteTexto.length > 120 ? c.palpiteTexto.slice(0, 120) + '…' : c.palpiteTexto, "\""] })] }), _jsx("span", { "aria-hidden": "true", style: { fontSize: 18, color: 'var(--color-accent)' }, children: "\u2192" }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("span", { style: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }, children: "hoje" }), _jsx("p", { style: { margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: c.dominadoAgora ? 'var(--color-success)' : 'var(--color-text-secondary)' }, children: c.dominadoAgora ? '✦ dominado' : c.statusAtual })] })] })] }));
}
function Metrica({ n, label, cor }) {
    return (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 26, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }, children: n }), _jsx("div", { style: { fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 140 }, children: label })] }));
}
