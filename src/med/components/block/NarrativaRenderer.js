import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ImagemBloco } from '@med/components/block/ImagemBloco';
function md(text) {
    return DOMPurify.sanitize(marked.parse(text));
}
// ── Tipos individuais ────────────────────────────────────────────────────────
function Texto({ conteudo }) {
    return (_jsx("div", { className: "narrativa", dangerouslySetInnerHTML: { __html: md(conteudo) }, style: { marginBottom: '1rem' } }));
}
function Secao({ titulo }) {
    return (_jsx("h2", { style: {
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginTop: '2.5rem',
            marginBottom: '1rem',
            paddingBottom: 6,
            borderBottom: '1px solid var(--color-border)',
        }, children: titulo }));
}
function Pausa({ conteudo }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-accent)',
            borderLeft: '3px solid var(--color-accent-dim)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            margin: '1.5rem 0',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
        }, children: ["\u23F8 ", conteudo] }));
}
function Highlight({ conteudo }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-accent-glow)',
            border: '1px solid var(--color-accent-dim)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            margin: '1.5rem 0',
            fontSize: 14,
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            lineHeight: 1.6,
        }, children: [_jsx("span", { style: { color: 'var(--color-accent)', marginRight: 8 }, children: "\u2726" }), conteudo] }));
}
function Contrafactual({ pergunta, resposta }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            margin: '1.5rem 0',
        }, children: [_jsxs("p", { style: {
                    margin: '0 0 12px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-warning)',
                }, children: ["\uD83E\uDD14 ", pergunta] }), _jsx("div", { className: "narrativa", dangerouslySetInnerHTML: { __html: md(resposta) }, style: { fontSize: 14 } })] }));
}
function Analogia({ icone, conteudo }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            margin: '1.5rem 0',
            display: 'flex',
            gap: 14,
        }, children: [_jsx("span", { style: { fontSize: 28, lineHeight: 1 }, children: icone }), _jsx("div", { className: "narrativa", dangerouslySetInnerHTML: { __html: md(conteudo) }, style: { flex: 1, fontSize: 14 } })] }));
}
function Etimologia({ termo, origem, significado, explicacao, }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid var(--color-disc-histologia)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            margin: '1.5rem 0',
        }, children: [_jsx("p", { style: {
                    margin: '0 0 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-disc-histologia)',
                }, children: "Etimologia" }), _jsx("p", { style: { margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }, children: termo }), _jsx("p", { style: { margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-secondary)' }, children: _jsx("em", { children: origem }) }), _jsxs("p", { style: { margin: '0 0 12px', fontSize: 13, color: 'var(--color-accent)', fontWeight: 500 }, children: ["\"", significado, "\""] }), _jsx("div", { className: "narrativa", dangerouslySetInnerHTML: { __html: md(explicacao) }, style: { fontSize: 14 } })] }));
}
function PassoAPasso({ titulo, passos, }) {
    return (_jsxs("div", { style: { margin: '1.5rem 0' }, children: [_jsx("p", { style: {
                    margin: '0 0 14px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                }, children: titulo }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: passos.map((p) => (_jsxs("div", { style: {
                        display: 'flex',
                        gap: 14,
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                    }, children: [_jsx("span", { style: {
                                width: 26,
                                height: 26,
                                minWidth: 26,
                                borderRadius: '50%',
                                background: 'var(--color-accent-glow)',
                                border: '1px solid var(--color-accent-dim)',
                                color: 'var(--color-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                            }, children: p.numero }), _jsxs("div", { children: [_jsx("p", { style: {
                                        margin: '0 0 4px',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                    }, children: p.titulo }), _jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: p.explicacao })] })] }, p.numero))) })] }));
}
function TabelaComparativa({ titulo, colunas, linhas, }) {
    return (_jsxs("div", { style: { margin: '1.5rem 0' }, children: [_jsx("p", { style: { margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }, children: titulo }), _jsx("div", { style: { overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }, children: _jsxs("table", { style: { borderCollapse: 'collapse', width: '100%', fontSize: 13 }, children: [_jsx("thead", { children: _jsx("tr", { children: colunas.map((c) => (_jsx("th", { style: {
                                        textAlign: 'left',
                                        padding: '10px 14px',
                                        background: 'var(--color-bg-elevated)',
                                        color: 'var(--color-accent)',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--color-border)',
                                    }, children: c }, c))) }) }), _jsx("tbody", { children: linhas.map((linha, i) => (_jsx("tr", { children: colunas.map((c) => (_jsx("td", { style: {
                                        padding: '10px 14px',
                                        color: 'var(--color-text-secondary)',
                                        borderBottom: '1px solid var(--color-border)',
                                        lineHeight: 1.5,
                                        verticalAlign: 'top',
                                    }, children: linha[c] ?? '' }, c))) }, i))) })] }) })] }));
}
// ── Dispatcher ───────────────────────────────────────────────────────────────
// Nível de profundidade de cada tipo — usado pelo zoom ELI5⇄aprofundar (bloco 2)
const PROFUNDIDADE_TIPO = {
    texto: 1,
    secao: 1,
    highlight: 1,
    analogia: 1,
    pausa: 2,
    passo_a_passo: 2,
    contrafactual: 2,
    imagem: 2,
    tabela_comparativa: 3,
    etimologia: 3,
};
export function NarrativaRenderer({ items, itemAtivoIndex, nivelZoom }) {
    return (_jsx(_Fragment, { children: items.map((item, i) => {
            if (nivelZoom && PROFUNDIDADE_TIPO[item.tipo] > nivelZoom)
                return null;
            const conteudo = (() => {
                switch (item.tipo) {
                    case 'texto':
                        return _jsx(Texto, { conteudo: item.conteudo });
                    case 'secao':
                        return _jsx(Secao, { titulo: item.titulo });
                    case 'pausa':
                        return _jsx(Pausa, { conteudo: item.conteudo });
                    case 'highlight':
                        return _jsx(Highlight, { conteudo: item.conteudo });
                    case 'contrafactual':
                        return _jsx(Contrafactual, { pergunta: item.pergunta, resposta: item.resposta });
                    case 'analogia':
                        return _jsx(Analogia, { icone: item.icone, conteudo: item.conteudo });
                    case 'etimologia':
                        return _jsx(Etimologia, { ...item });
                    case 'imagem':
                        return (_jsx(ImagemBloco, { titulo: item.titulo, descricao: item.descricao, origem: item.origem ?? 'ia', url: item.url ?? null }));
                    case 'passo_a_passo':
                        return _jsx(PassoAPasso, { titulo: item.titulo, passos: item.passos });
                    case 'tabela_comparativa':
                        return _jsx(TabelaComparativa, { titulo: item.titulo, colunas: item.colunas, linhas: item.linhas });
                    default:
                        return null;
                }
            })();
            if (!conteudo)
                return null;
            return (_jsx("div", { style: itemAtivoIndex === i
                    ? { outline: '2px solid var(--color-accent)', outlineOffset: 6, borderRadius: 8, transition: 'outline-color 0.2s' }
                    : undefined, children: conteudo }, i));
        }) }));
}
