import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina } from '@core/components/ui/primitivos';
import { construirGrafoGlobal } from '@core/anima/grafo';
import { useUIStore } from '@core/store/uiStore';
const CORES = ['#9f7aea', '#4fd1c5', '#68d391', '#f6ad55', '#fc8181', '#63b3ed', '#76e4f7', '#e05f8f'];
function corDisciplina(disciplina, disciplinas) {
    const i = disciplinas.indexOf(disciplina);
    return CORES[i % CORES.length];
}
const COR_STATUS = { dominado: 1, revisando: 0.85, aprendendo: 0.6, novo: 0.3 };
export function GrafoPage() {
    const navigate = useNavigate();
    const { reduzirMovimento } = useUIStore();
    const [grafo, setGrafo] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [discFiltro, setDiscFiltro] = useState(null);
    const [hoverId, setHoverId] = useState(null);
    useEffect(() => {
        construirGrafoGlobal().then(setGrafo);
    }, []);
    const nosVisiveis = useMemo(() => {
        if (!grafo)
            return [];
        return discFiltro ? grafo.nos.filter((n) => n.disciplina === discFiltro) : grafo.nos;
    }, [grafo, discFiltro]);
    if (!grafo)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Mapeando o organismo..." }) });
    const idsVisiveis = new Set(nosVisiveis.map((n) => n.id));
    const arestasVisiveis = grafo.arestas.filter((a) => idsVisiveis.has(a.de) && idsVisiveis.has(a.para));
    const noPorId = new Map(grafo.nos.map((n) => [n.id, n]));
    const W = 700;
    const H = 700;
    return (_jsxs(Pagina, { largura: 1100, children: [_jsx(CabecalhoPagina, { titulo: "Grafo Global", subtitulo: "A constela\u00E7\u00E3o do que voc\u00EA j\u00E1 sabe \u2014 e do que ainda \u00E9 escuro." }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => setDiscFiltro(null), style: {
                            padding: '5px 12px',
                            borderRadius: 99,
                            border: `1px solid ${!discFiltro ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: !discFiltro ? 'var(--color-accent-glow)' : 'transparent',
                            color: !discFiltro ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            fontSize: 11,
                            cursor: 'pointer',
                        }, children: "Tudo" }), grafo.disciplinas.map((d) => (_jsx("button", { onClick: () => setDiscFiltro(discFiltro === d ? null : d), style: {
                            padding: '5px 12px',
                            borderRadius: 99,
                            border: `1px solid ${discFiltro === d ? corDisciplina(d, grafo.disciplinas) : 'var(--color-border)'}`,
                            background: discFiltro === d ? `${corDisciplina(d, grafo.disciplinas)}22` : 'transparent',
                            color: discFiltro === d ? corDisciplina(d, grafo.disciplinas) : 'var(--color-text-muted)',
                            fontSize: 11,
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                        }, children: d }, d)))] }), _jsxs("div", { style: { background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'auto', position: 'relative' }, children: [_jsxs("div", { style: { position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6 }, children: [_jsx("button", { onClick: () => setZoom((z) => Math.max(0.5, z - 0.15)), style: zoomBtn, children: "\u2212" }), _jsx("button", { onClick: () => setZoom(1), style: zoomBtn, children: "\u27F2" }), _jsx("button", { onClick: () => setZoom((z) => Math.min(2, z + 0.15)), style: zoomBtn, children: "+" })] }), _jsxs("svg", { viewBox: `${-W / 2} ${-H / 2} ${W} ${H}`, width: W * zoom, height: H * zoom, role: "img", "aria-label": "Grafo global de dom\u00EDnio", children: [_jsx("defs", { children: _jsxs("filter", { id: "grafoGlow", x: "-80%", y: "-80%", width: "260%", height: "260%", children: [_jsx("feGaussianBlur", { stdDeviation: "3", result: "b" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "b" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }) }), [70, 150, 220, 290].map((r) => (_jsx("circle", { cx: 0, cy: 0, r: r, fill: "none", stroke: "var(--color-border)", strokeOpacity: 0.3, strokeDasharray: "2 4" }, r))), arestasVisiveis.map((a, i) => {
                                const de = noPorId.get(a.de);
                                const para = noPorId.get(a.para);
                                if (!de || !para)
                                    return null;
                                return (_jsx("line", { x1: de.x, y1: de.y, x2: para.x, y2: para.y, stroke: a.tipo === 'arvore' ? 'var(--color-border-accent)' : 'var(--color-accent)', strokeWidth: a.tipo === 'arvore' ? 1 : 0.6, strokeOpacity: a.tipo === 'arvore' ? 0.35 : 0.2 }, i));
                            }), nosVisiveis.map((n) => {
                                const cor = corDisciplina(n.disciplina, grafo.disciplinas);
                                const brilho = COR_STATUS[n.status] ?? 0.3;
                                const raio = 4 + Math.min(6, n.grau);
                                const emFoco = hoverId === n.id;
                                return (_jsxs("g", { transform: `translate(${n.x}, ${n.y})`, style: { cursor: 'pointer' }, onMouseEnter: () => setHoverId(n.id), onMouseLeave: () => setHoverId((h) => (h === n.id ? null : h)), onClick: () => navigate(`/bloco/${n.id}`), children: [emFoco && (_jsx("circle", { r: raio + 6, fill: "none", stroke: cor, strokeWidth: 1, opacity: 0.6, children: !reduzirMovimento && _jsx("animate", { attributeName: "r", values: `${raio + 4};${raio + 9};${raio + 4}`, dur: "1.6s", repeatCount: "indefinite" }) })), _jsx("circle", { r: raio, fill: cor, fillOpacity: brilho, stroke: cor, strokeWidth: 1, filter: brilho > 0.7 ? 'url(#grafoGlow)' : undefined }), emFoco && (_jsx("text", { y: -raio - 8, textAnchor: "middle", style: { font: '10px Inter, sans-serif', fill: 'var(--color-text-primary)' }, children: n.titulo.length > 30 ? n.titulo.slice(0, 29) + '…' : n.titulo }))] }, n.id));
                            })] })] }), _jsx("p", { style: { marginTop: 12, fontSize: 11, color: 'var(--color-text-muted)' }, children: "Tamanho = conex\u00F5es \u00B7 brilho = dom\u00EDnio real \u00B7 zonas escuras revelam o que ainda falta explorar" })] }));
}
const zoomBtn = {
    width: 30,
    height: 30,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontSize: 14,
};
