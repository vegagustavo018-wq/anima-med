import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressoStore } from '@core/store/progressoStore';
import { CardDigitar } from './CardDigitar';
import { backlinksDe } from '@core/anima/backlinks';
import { VINHETAS_SEED } from '@core/anima/vinhetasSeed';
const ROTULO_TIPO_BACKLINK = {
    prerequisito: 'depende disto',
    lateral: 'relacionado',
    futura: 'retoma no futuro',
    filho: 'sub-tópico',
    pai: 'tópico-mãe',
};
const COR_TIPO = {
    por_que: 'var(--color-accent)',
    mecanismo: 'var(--color-info)',
    contrafactual: 'var(--color-warning)',
    clinico: 'var(--color-success)',
    comparacao: 'var(--color-disc-anatomia)',
    armadilha: 'var(--color-danger)',
    sintese_transdisciplinar: 'var(--color-disc-histologia)',
    etimologia: 'var(--color-disc-bioquimica)',
    cloze: 'var(--color-accent-dim)',
};
const QUALIDADES = [
    { q: 0, label: 'Errei', cor: 'var(--color-danger)' },
    { q: 2, label: 'Difícil', cor: 'var(--color-warning)' },
    { q: 4, label: 'Bom', cor: 'var(--color-success)' },
    { q: 5, label: 'Fácil', cor: 'var(--color-accent)' },
];
// ── Flashcards ────────────────────────────────────────────────────────────────
function FlashcardItem({ fc, resumo_id }) {
    const [aberto, setAberto] = useState(false);
    const [revelado, setRevelado] = useState(false);
    const [avaliado, setAvaliado] = useState(false);
    const { revisarCard } = useProgressoStore();
    const cor = COR_TIPO[fc.tipo] ?? 'var(--color-accent)';
    const ehDigitar = fc.formato === 'digitar' && !!fc.resposta_curta;
    const avaliar = async (q) => {
        await revisarCard(resumo_id, fc.card_id, q);
        setAvaliado(true);
    };
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${cor}`,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
        }, children: [_jsxs("button", { onClick: () => setAberto((v) => !v), style: {
                    width: '100%',
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("span", { style: {
                                    display: 'inline-block',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.07em',
                                    textTransform: 'uppercase',
                                    color: cor,
                                    marginBottom: 6,
                                }, children: [fc.tipo.replace(/_/g, ' '), " \u00B7 n\u00EDvel ", fc.nivel_alvo, ehDigitar && ' · digitar'] }), _jsx("p", { style: { margin: 0, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5 }, children: fc.pergunta })] }), _jsx("span", { style: { fontSize: 16, color: 'var(--color-text-muted)', transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }, children: "\u2193" })] }), aberto && (_jsx("div", { style: { padding: '0 16px 16px', borderTop: '1px solid var(--color-border)', paddingTop: 14 }, children: ehDigitar && !revelado ? (_jsx(CardDigitar, { respostaCorreta: fc.resposta_curta, onAvaliar: (exato) => {
                        setRevelado(true);
                        if (exato)
                            avaliar(4);
                    } })) : (_jsxs(_Fragment, { children: [_jsx("p", { style: { margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }, children: fc.resposta }), !avaliado && (_jsx("div", { style: { display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }, children: QUALIDADES.map(({ q, label, cor: c }) => (_jsx("button", { onClick: () => avaliar(q), style: {
                                    padding: '5px 11px',
                                    border: `1px solid ${c}`,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'transparent',
                                    color: c,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }, children: label }, q))) })), avaliado && _jsx("p", { style: { margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }, children: "\u2713 registrado na mem\u00F3ria" })] })) }))] }));
}
export function FlashcardsAba({ cards, resumo_id }) {
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: cards.map((fc) => (_jsx(FlashcardItem, { fc: fc, resumo_id: resumo_id }, fc.card_id))) }));
}
// ── Casos clínicos ────────────────────────────────────────────────────────────
function CasoItem({ caso }) {
    const [revelar, setRevelar] = useState(false);
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 16,
        }, children: [_jsxs("div", { style: { padding: '20px 20px 0' }, children: [_jsx("p", { style: { margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-warning)' }, children: "Caso Cl\u00EDnico" }), _jsx("p", { style: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }, children: caso.titulo }), _jsx("p", { style: { margin: '0 0 20px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }, children: caso.apresentacao })] }), _jsxs("div", { style: { padding: '0 20px 20px' }, children: [_jsx("p", { style: { margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }, children: "Cascata causal" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: caso.cascata.map((etapa, i) => (_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'flex-start' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 20, paddingTop: 3 }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 } }), i < caso.cascata.length - 1 && (_jsx("div", { style: { width: 1, flex: 1, minHeight: 16, background: 'var(--color-border)', marginTop: 4 } }))] }), _jsxs("div", { style: { paddingBottom: 8 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }, children: etapa.etapa }), _jsx("p", { style: { margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: etapa.descricao })] })] }, i))) })] }), _jsx("div", { style: { borderTop: '1px solid var(--color-border)', padding: '16px 20px' }, children: !revelar ? (_jsx("button", { onClick: () => setRevelar(true), style: {
                        border: '1px solid var(--color-success)',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        color: 'var(--color-success)',
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                    }, children: "Revelar diagn\u00F3stico e tratamento" })) : (_jsxs("div", { children: [_jsxs("p", { style: { margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }, children: ["\u2713 ", caso.diagnostico_revelado] }), _jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: caso.tratamento_resumido })] })) })] }));
}
export function CasosAba({ casos, resumo_id }) {
    const navigate = useNavigate();
    const vinhetas = VINHETAS_SEED.filter((v) => v.bloco_id === resumo_id);
    return (_jsxs("div", { children: [vinhetas.length > 0 && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }, children: vinhetas.map((v) => (_jsxs("button", { onClick: () => navigate(`/clinica/${v.vinheta_id}`), style: {
                        textAlign: 'left',
                        padding: '14px 18px',
                        border: '1px solid var(--color-border-accent)',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-accent-glow)',
                        cursor: 'pointer',
                    }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }, children: "\u2695 Vinheta ramificada" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }, children: v.titulo })] }, v.vinheta_id))) })), casos.map((c) => (_jsx(CasoItem, { caso: c }, c.caso_id)))] }));
}
// ── Conexões ──────────────────────────────────────────────────────────────────
export function ConexoesAba({ bloco }) {
    const navigate = useNavigate();
    const { prerequisitos, futuras, laterais } = bloco.conexoes;
    const [backlinks, setBacklinks] = useState([]);
    useEffect(() => {
        let vivo = true;
        backlinksDe(bloco.resumo_id).then((b) => vivo && setBacklinks(b));
        return () => {
            vivo = false;
        };
    }, [bloco.resumo_id]);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [backlinks.length > 0 && (_jsx(Secao, { titulo: "Quem chega at\u00E9 aqui (backlinks)", children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: backlinks.map((b, i) => (_jsxs("button", { onClick: () => navigate(`/bloco/${b.resumo_id}`), style: {
                            textAlign: 'left',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            display: 'flex',
                            gap: 12,
                            cursor: 'pointer',
                            alignItems: 'baseline',
                        }, children: [_jsx("span", { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)', minWidth: 90 }, children: ROTULO_TIPO_BACKLINK[b.tipo] }), _jsx("span", { style: { fontSize: 13, color: 'var(--color-text-primary)' }, children: b.titulo })] }, i))) }) })), prerequisitos.length > 0 && (_jsx(Secao, { titulo: "Precisa de (pr\u00E9-requisitos)", children: prerequisitos.map((p, i) => (_jsx(LinhaConexao, { rotulo: `sem ${p.semestre}`, titulo: p.titulo, texto: p.explicacao, cor: "var(--color-text-muted)" }, i))) })), futuras.length > 0 && (_jsx(Secao, { titulo: "Volta no futuro (espiral)", children: futuras.map((f, i) => (_jsx(LinhaConexao, { rotulo: `sem ${f.semestre_futuro}`, titulo: f.topico, texto: f.mecanismo_conexao, cor: "var(--color-info)" }, i))) })), laterais.length > 0 && (_jsx(Secao, { titulo: "Conex\u00F5es laterais", children: laterais.map((l, i) => (_jsx(LinhaConexao, { rotulo: l.tipo_relacao.toLowerCase(), titulo: l.bloco_id, texto: l.explicacao, cor: "var(--color-disc-anatomia)" }, i))) }))] }));
}
function Secao({ titulo, children }) {
    return (_jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }, children: titulo }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: children })] }));
}
function LinhaConexao({ rotulo, titulo, texto, cor }) {
    return (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 12 }, children: [_jsx("span", { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: cor, minWidth: 52, paddingTop: 2 }, children: rotulo }), _jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }, children: titulo }), _jsx("p", { style: { margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }, children: texto })] })] }));
}
