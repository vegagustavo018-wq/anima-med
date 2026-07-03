import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function pct(zonas, id) {
    return zonas.find((z) => z.id === id)?.percentual ?? 0;
}
function corPorPercentual(p) {
    if (p === 0)
        return { cor: '#3a4a63', opac: 0.35 };
    if (p < 30)
        return { cor: '#2c7a7b', opac: 0.5 };
    if (p < 70)
        return { cor: '#4fd1c5', opac: 0.75 };
    return { cor: '#4fd1c5', opac: 1 };
}
/**
 * O Corpo que se Ilumina (bloco 8) — silhueta anatômica bioluminescente.
 * Cada zona acende conforme DOMÍNIO REAL da disciplina correspondente,
 * não por tempo estudado. Um órgão apagado deve doer mais que um número.
 */
export function CorpoIluminado({ zonas, reduzirMovimento, zonaFoco, onZonaClick }) {
    const pele = corPorPercentual(pct(zonas, 'pele'));
    const cranio = corPorPercentual(pct(zonas, 'cranio'));
    const coracao = corPorPercentual(pct(zonas, 'coracao'));
    const nucleo = corPorPercentual(pct(zonas, 'nucleo'));
    const esqueleto = corPorPercentual(pct(zonas, 'esqueleto'));
    const pulmoes = corPorPercentual(pct(zonas, 'pulmoes'));
    const abdome = corPorPercentual(pct(zonas, 'abdome'));
    const auraPct = pct(zonas, 'aura');
    const animCoracao = reduzirMovimento ? undefined : 'brilhar 2.2s ease-in-out infinite';
    const animNucleo = reduzirMovimento ? undefined : 'pulso 3.4s ease-in-out infinite';
    const animAura = reduzirMovimento ? undefined : 'respirar 5s ease-in-out infinite';
    const clicavel = (id) => ({
        cursor: onZonaClick ? 'pointer' : 'default',
        opacity: zonaFoco && zonaFoco !== id ? 0.35 : 1,
        transition: 'opacity 0.25s ease',
    });
    return (_jsxs("svg", { viewBox: "0 0 320 520", width: "100%", height: "100%", style: { maxWidth: 340, margin: '0 auto', display: 'block' }, role: "img", "aria-label": "Corpo bioluminescente \u2014 dom\u00EDnio por sistema", children: [_jsxs("defs", { children: [_jsxs("radialGradient", { id: "auraGrad", cx: "50%", cy: "42%", r: "60%", children: [_jsx("stop", { offset: "0%", stopColor: "#4fd1c5", stopOpacity: 0.05 + (auraPct / 100) * 0.15 }), _jsx("stop", { offset: "100%", stopColor: "#4fd1c5", stopOpacity: "0" })] }), _jsxs("filter", { id: "glowSoft", x: "-60%", y: "-60%", width: "220%", height: "220%", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "b" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "b" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), _jsx("ellipse", { cx: "160", cy: "230", rx: "150", ry: "230", fill: "url(#auraGrad)", style: { animation: animAura } }), _jsx("g", { style: clicavel('pele'), onClick: () => onZonaClick?.('pele'), children: _jsx("path", { d: "M160,20\n             C185,20 200,38 200,62\n             C200,80 195,90 195,100\n             C230,110 250,140 252,180\n             L260,280 C262,300 255,310 245,312\n             L235,400 C233,420 225,430 210,432\n             L205,480 C204,495 195,502 180,502\n             L140,502 C125,502 116,495 115,480\n             L110,432 C95,430 87,420 85,400\n             L75,312 C65,310 58,300 60,280\n             L68,180 C70,140 90,110 125,100\n             C125,90 120,80 120,62\n             C120,38 135,20 160,20 Z", fill: "none", stroke: pele.cor, strokeWidth: 2.2, strokeOpacity: pele.opac, filter: "url(#glowSoft)" }) }), _jsxs("g", { style: clicavel('cranio'), onClick: () => onZonaClick?.('cranio'), children: [_jsx("circle", { cx: "160", cy: "58", r: "32", fill: cranio.cor, fillOpacity: cranio.opac * 0.22, stroke: cranio.cor, strokeOpacity: cranio.opac, strokeWidth: 1.6 }), _jsx("path", { d: "M140,50 Q160,42 180,50", stroke: cranio.cor, strokeOpacity: cranio.opac * 0.7, strokeWidth: 1, fill: "none" })] }), _jsxs("g", { style: clicavel('esqueleto'), onClick: () => onZonaClick?.('esqueleto'), stroke: esqueleto.cor, strokeOpacity: esqueleto.opac, strokeWidth: 2, strokeLinecap: "round", fill: "none", children: [_jsx("line", { x1: "160", y1: "105", x2: "160", y2: "290" }), _jsx("line", { x1: "128", y1: "130", x2: "70", y2: "220" }), _jsx("line", { x1: "70", y1: "220", x2: "62", y2: "290" }), _jsx("line", { x1: "192", y1: "130", x2: "250", y2: "220" }), _jsx("line", { x1: "250", y1: "220", x2: "258", y2: "290" }), _jsx("line", { x1: "140", y1: "300", x2: "128", y2: "410" }), _jsx("line", { x1: "128", y1: "410", x2: "122", y2: "495" }), _jsx("line", { x1: "180", y1: "300", x2: "192", y2: "410" }), _jsx("line", { x1: "192", y1: "410", x2: "198", y2: "495" })] }), _jsxs("g", { style: clicavel('pulmoes'), onClick: () => onZonaClick?.('pulmoes'), children: [_jsx("ellipse", { cx: "135", cy: "175", rx: "22", ry: "38", fill: pulmoes.cor, fillOpacity: pulmoes.opac * 0.28, stroke: pulmoes.cor, strokeOpacity: pulmoes.opac, strokeWidth: 1.3 }), _jsx("ellipse", { cx: "185", cy: "175", rx: "22", ry: "38", fill: pulmoes.cor, fillOpacity: pulmoes.opac * 0.28, stroke: pulmoes.cor, strokeOpacity: pulmoes.opac, strokeWidth: 1.3 })] }), _jsx("g", { style: clicavel('coracao'), onClick: () => onZonaClick?.('coracao'), children: _jsx("path", { d: "M160,165 C150,150 128,152 124,172 C120,192 140,208 160,222 C180,208 200,192 196,172 C192,152 170,150 160,165 Z", fill: coracao.cor, fillOpacity: coracao.opac * 0.55, stroke: coracao.cor, strokeOpacity: coracao.opac, strokeWidth: 1.6, filter: "url(#glowSoft)", style: { animation: animCoracao, transformOrigin: '160px 185px' } }) }), _jsx("g", { style: clicavel('abdome'), onClick: () => onZonaClick?.('abdome'), children: _jsx("ellipse", { cx: "160", cy: "255", rx: "46", ry: "32", fill: abdome.cor, fillOpacity: abdome.opac * 0.2, stroke: abdome.cor, strokeOpacity: abdome.opac, strokeWidth: 1.2 }) }), _jsx("g", { style: clicavel('nucleo'), onClick: () => onZonaClick?.('nucleo'), children: _jsx("circle", { cx: "160", cy: "255", r: "12", fill: nucleo.cor, fillOpacity: nucleo.opac * 0.85, filter: "url(#glowSoft)", style: { animation: animNucleo, transformOrigin: '160px 255px' } }) })] }));
}
