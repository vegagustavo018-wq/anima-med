import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Botao } from '@core/components/ui/controles';
import { useQuestoesStore } from '@core/store/questoesStore';
const MASCARAS = [
    { id: 'dendritos', x: 6, y: 40, w: 70, h: 120, rotulo: 'Dendritos', descricao: 'Recebem sinais de outros neurônios e conduzem ao corpo celular.' },
    { id: 'soma', x: 78, y: 68, w: 74, h: 74, rotulo: 'Corpo celular (soma)', descricao: 'Contém o núcleo; integra os sinais recebidos.' },
    { id: 'mielina', x: 210, y: 88, w: 60, h: 34, rotulo: 'Bainha de mielina', descricao: 'Isola o axônio e acelera a condução saltatória.' },
    { id: 'terminais', x: 340, y: 60, w: 56, h: 90, rotulo: 'Terminais axônicos', descricao: 'Liberam neurotransmissores na sinapse.' },
];
const NOTAS = [
    { q: 1, label: 'Errei', cor: 'var(--color-danger)' },
    { q: 3, label: 'Difícil', cor: 'var(--color-warning)' },
    { q: 5, label: 'Acertei', cor: 'var(--color-success)' },
];
export function OclusaoDemo({ onSair }) {
    const { avaliarFlashcard } = useQuestoesStore();
    const [idx, setIdx] = useState(0);
    const [revelado, setRevelado] = useState(false);
    const [feitos, setFeitos] = useState(0);
    const alvo = MASCARAS[idx];
    const fim = idx >= MASCARAS.length;
    async function avaliar(q) {
        await avaliarFlashcard(`q-ocl-neuronio-${alvo.id}`, q, 'treino');
        setFeitos((f) => f + 1);
        setRevelado(false);
        setIdx((i) => i + 1);
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [_jsx("button", { onClick: onSair, style: { border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }, children: "\u2190 Sair" }), _jsxs("span", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: ["Oclus\u00E3o \u00B7 Neur\u00F4nio \u00B7 ", Math.min(idx + 1, MASCARAS.length), "/", MASCARAS.length] })] }), fim ? (_jsxs("div", { style: { textAlign: 'center', padding: '40px 0' }, children: [_jsx("div", { style: { fontSize: 40, color: 'var(--color-success)' }, children: "\u2713" }), _jsxs("p", { style: { fontSize: 15, color: 'var(--color-text-primary)' }, children: ["Voc\u00EA revisou ", feitos, " estruturas."] }), _jsx(Botao, { variante: "primario", onClick: onSair, children: "Voltar" })] })) : (_jsxs(_Fragment, { children: [_jsx("p", { style: { fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 14 }, children: revelado ? alvo.rotulo : 'Que estrutura está oculta?' }), _jsx("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }, children: _jsxs("svg", { viewBox: "0 0 400 200", style: { width: '100%', height: 'auto' }, role: "img", "aria-label": "Esquema de um neur\u00F4nio", children: [_jsxs("g", { stroke: "var(--color-text-secondary)", strokeWidth: "2.5", fill: "none", strokeLinecap: "round", children: [_jsx("path", { d: "M115 100 L60 55 M78 48 L48 60 M60 55 L30 45" }), _jsx("path", { d: "M115 100 L58 145 M58 145 L30 155 M58 145 L42 170" }), _jsx("path", { d: "M115 100 L50 100 M50 100 L20 90 M50 100 L20 110" })] }), _jsx("circle", { cx: "115", cy: "105", r: "34", fill: "color-mix(in srgb, var(--color-accent) 22%, transparent)", stroke: "var(--color-accent)", strokeWidth: "2.5" }), _jsx("circle", { cx: "115", cy: "105", r: "12", fill: "var(--color-accent)" }), _jsx("line", { x1: "149", y1: "105", x2: "360", y2: "105", stroke: "var(--color-text-secondary)", strokeWidth: "3" }), [175, 240, 305].map((x) => (_jsx("rect", { x: x, y: "96", width: "34", height: "18", rx: "9", fill: "color-mix(in srgb, var(--color-accent-dim) 40%, transparent)", stroke: "var(--color-accent-dim)", strokeWidth: "1.5" }, x))), _jsx("g", { stroke: "var(--color-text-secondary)", strokeWidth: "2.5", fill: "none", strokeLinecap: "round", children: _jsx("path", { d: "M360 105 L388 80 M360 105 L392 105 M360 105 L388 130" }) }), !revelado && (_jsx("rect", { x: alvo.x, y: alvo.y, width: alvo.w, height: alvo.h, rx: "8", fill: "var(--color-bg-elevated)", stroke: "var(--color-accent)", strokeWidth: "2", strokeDasharray: "5 4", className: "anima-pulso-luz" })), !revelado && (_jsx("text", { x: alvo.x + alvo.w / 2, y: alvo.y + alvo.h / 2 + 6, textAnchor: "middle", fontSize: "22", fill: "var(--color-accent)", children: "?" }))] }) }), revelado ? (_jsxs("div", { className: "anima-surge", style: { marginTop: 16 }, children: [_jsx("p", { style: { fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 12, fontFamily: 'var(--font-serif)' }, children: alvo.descricao }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: NOTAS.map((n) => (_jsx("button", { onClick: () => avaliar(n.q), className: "anima-lift", style: { flex: 1, padding: '10px', border: `1px solid ${n.cor}`, borderRadius: 'var(--radius-md)', background: 'transparent', color: n.cor, fontSize: 13, fontWeight: 700, cursor: 'pointer' }, children: n.label }, n.q))) })] })) : (_jsx("div", { style: { marginTop: 16 }, children: _jsx(Botao, { variante: "primario", som: "revelar", onClick: () => setRevelado(true), children: "Revelar" }) }))] }))] }));
}
