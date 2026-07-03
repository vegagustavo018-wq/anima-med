import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@core/db/database';
import {} from '@core/srs/sm2';
import { montarFilaEstudo } from '@core/anima/fila';
import { useProgressoStore } from '@core/store/progressoStore';
import { useSessaoConfigStore, PRESETS } from '@core/store/sessaoConfigStore';
import { Pagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos';
import { filaVazia, fimDeSessao, acertoDificil } from '@core/anima/voz';
const CONFIANCAS = [
    { v: 1, label: 'Chute' },
    { v: 2, label: 'Dúvida' },
    { v: 3, label: 'Confiante' },
    { v: 4, label: 'Certeza' },
];
const QUALIDADES = [
    { q: 0, label: 'Errei', cor: 'var(--color-danger)' },
    { q: 2, label: 'Difícil', cor: 'var(--color-warning)' },
    { q: 4, label: 'Bom', cor: 'var(--color-success)' },
    { q: 5, label: 'Fácil', cor: 'var(--color-accent)' },
];
export function EstudarPage() {
    const navigate = useNavigate();
    const { revisarBloco } = useProgressoStore();
    const { config, carregar: carregarConfigSessao, aplicarPreset } = useSessaoConfigStore();
    const [todos, setTodos] = useState(null);
    const [fila, setFila] = useState([]);
    const [idx, setIdx] = useState(0);
    const [fase, setFase] = useState('intro');
    const [confianca, setConfianca] = useState(null);
    const [producao, setProducao] = useState('');
    const [revisados, setRevisados] = useState(0);
    const [flashAnima, setFlashAnima] = useState(null);
    useEffect(() => {
        ;
        (async () => {
            // fila unificada e priorizada (atraso + leech + marcado), não mais um
            // filtro plano — os blocos mais urgentes vêm primeiro.
            const fila = await montarFilaEstudo();
            const blocos = (await db.blocos.bulkGet(fila.map((f) => f.resumo_id))).filter((b) => !!b);
            setTodos(blocos);
        })();
        carregarConfigSessao();
    }, [carregarConfigSessao]);
    if (todos === null)
        return _jsx(Pagina, { largura: 720, children: _jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Montando a fila..." }) });
    if (todos.length === 0)
        return (_jsx(Pagina, { largura: 720, children: _jsx("div", { style: { paddingTop: 40 }, children: _jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 44, marginBottom: 20, color: 'var(--color-accent)' }, children: "\u2726" }), _jsx(FalaAnima, { texto: filaVazia() })] }) }) }));
    // ── Intro: escolher tamanho da sessão (micro-sessão de resgate) ──
    if (fase === 'intro') {
        const teto = config?.teto_cards_dia;
        const listaComTeto = teto ? todos.slice(0, teto) : todos;
        return (_jsx(Pagina, { largura: 720, children: _jsxs("div", { style: { paddingTop: 40, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 40, marginBottom: 20, color: 'var(--color-accent)' }, children: "\u2B21" }), _jsxs("p", { style: { fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 8 }, children: [todos.length, " ", todos.length === 1 ? 'bloco vencido' : 'blocos vencidos'] }), _jsx("p", { style: { fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }, children: "Sem pressa. At\u00E9 uma dose pequena mant\u00E9m a corrente." }), _jsx("div", { style: { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }, children: Object.keys(PRESETS).map((p) => (_jsx("button", { onClick: () => aplicarPreset(p), title: PRESETS[p].descricao, style: {
                                padding: '5px 12px',
                                borderRadius: 99,
                                border: `1px solid ${config?.preset === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                background: config?.preset === p ? 'var(--color-accent-glow)' : 'transparent',
                                color: config?.preset === p ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }, children: PRESETS[p].label }, p))) }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }, children: [_jsxs("button", { onClick: () => iniciar(listaComTeto), style: botaoPrimario, children: ["Revisar ", teto && teto < todos.length ? `até o teto (${teto})` : `tudo (${todos.length})`] }), todos.length > 3 && (_jsx("button", { onClick: () => iniciar(todos.slice(0, 3)), style: botaoSecundario, children: "S\u00F3 5 min (3)" }))] }), _jsx("button", { onClick: () => navigate('/leech'), style: { marginTop: 24, background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }, children: "Ver enfermaria de sanguessugas" })] }) }));
    }
    if (fase === 'fim')
        return (_jsx(Pagina, { largura: 720, children: _jsxs("div", { style: { paddingTop: 40 }, children: [_jsx(FalaAnima, { texto: fimDeSessao(revisados), grande: true }), _jsx("p", { style: { margin: '20px 0 0', fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Voc\u00EA fez o suficiente. Pode parar tranquilo." }), _jsxs("div", { style: { display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => navigate('/'), style: botaoPrimario, children: "Voltar ao in\u00EDcio" }), _jsx("button", { onClick: () => navigate('/explorar'), style: botaoSecundario, children: "Explorar mais" }), _jsx("button", { onClick: () => navigate('/respirar'), style: botaoSecundario, children: "Respirar antes de sair" })] })] }) }));
    const b = fila[idx];
    if (!b)
        return null;
    function iniciar(lista) {
        setFila(lista);
        setIdx(0);
        setFase('confianca');
        setConfianca(null);
        setProducao('');
    }
    const responder = async (q) => {
        await revisarBloco(b.resumo_id, q, confianca ?? undefined);
        setRevisados((n) => n + 1);
        if (q >= 4 && (confianca ?? 4) <= 2) {
            setFlashAnima(acertoDificil());
            setTimeout(() => setFlashAnima(null), 2200);
        }
        const prox = idx + 1;
        if (prox >= fila.length)
            setFase('fim');
        else {
            setIdx(prox);
            setFase('confianca');
            setConfianca(null);
            setProducao('');
        }
    };
    // nível-alvo do bloco: se tem flashcards de nível 2+, exige produção
    const exigeProducao = b.flashcards.some((f) => f.nivel_alvo >= 3);
    const pergunta = b.metadata.subtitulo?.trim().endsWith('?')
        ? b.metadata.subtitulo.trim()
        : `Recorde: o que você sabe sobre ${b.metadata.titulo.toLowerCase()}?`;
    return (_jsxs(Pagina, { largura: 720, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 12 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20, color: 'var(--color-text-primary)' }, children: "Revis\u00E3o" }), _jsxs("span", { style: { fontSize: 13, color: 'var(--color-text-muted)' }, children: [idx + 1, " / ", fila.length] })] }), _jsx("div", { style: { height: 4, background: 'var(--color-bg-card)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${((idx + 1) / fila.length) * 100}%`, background: 'var(--color-accent)', transition: 'width 0.3s' } }) }), flashAnima && _jsx("div", { style: { marginBottom: 20 }, children: _jsx(FalaAnima, { texto: flashAnima }) }), _jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 32, marginBottom: 24 }, children: [_jsx("p", { style: { margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }, children: b.metadata.titulo }), fase === 'confianca' && (_jsxs(_Fragment, { children: [_jsx("p", { style: { margin: '12px 0 0', fontSize: 17, color: 'var(--color-text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }, children: pergunta }), _jsx("p", { style: { margin: '20px 0 10px', fontSize: 13, color: 'var(--color-text-muted)' }, children: "Antes de revelar \u2014 qu\u00E3o confiante voc\u00EA est\u00E1?" }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: CONFIANCAS.map((c) => (_jsx("button", { onClick: () => {
                                        setConfianca(c.v);
                                        setFase(exigeProducao ? 'produzir' : 'revelado');
                                    }, style: botaoConfianca, children: c.label }, c.v))) })] })), fase === 'produzir' && (_jsxs(_Fragment, { children: [_jsx("p", { style: { margin: '12px 0 12px', fontSize: 16, color: 'var(--color-text-primary)', lineHeight: 1.6, fontFamily: 'var(--font-serif)' }, children: pergunta }), _jsx("p", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-muted)' }, children: "Escreva o que voc\u00EA lembra \u2014 recuperar da mem\u00F3ria \u00E9 o que fixa." }), _jsx("textarea", { autoFocus: true, value: producao, onChange: (e) => setProducao(e.target.value), rows: 4, placeholder: "Do que voc\u00EA lembra?", style: {
                                    width: '100%',
                                    background: 'var(--color-bg-base)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '10px 12px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 14,
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                } }), _jsx("button", { onClick: () => setFase('revelado'), style: { ...botaoPrimario, marginTop: 12 }, children: "Comparar com a resposta \u2192" })] })), fase === 'revelado' && (_jsxs(_Fragment, { children: [producao.trim() && (_jsxs("div", { style: { margin: '12px 0', padding: '10px 14px', background: 'var(--color-bg-base)', borderLeft: '2px solid var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }, children: [_jsx("p", { style: { margin: '0 0 4px', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }, children: "Voc\u00EA escreveu" }), _jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }, children: producao })] })), _jsx("p", { style: { margin: '16px 0 0', fontSize: 16, color: 'var(--color-text-primary)', lineHeight: 1.7 }, children: b.resumo_conciso }), _jsx("button", { onClick: () => navigate(`/bloco/${b.resumo_id}`), style: { marginTop: 14, background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 13, padding: 0 }, children: "Abrir bloco completo \u2192" })] }))] }), fase === 'revelado' && (_jsx("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap' }, children: QUALIDADES.map(({ q, label, cor }) => (_jsx("button", { onClick: () => responder(q), style: { ...botaoQualidade, borderColor: cor, color: cor }, children: label }, q))) }))] }));
}
const botaoPrimario = {
    padding: '11px 22px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-accent)',
    color: 'var(--color-bg-base)',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
};
const botaoSecundario = {
    padding: '11px 22px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    cursor: 'pointer',
};
const botaoConfianca = {
    flex: 1,
    minWidth: 90,
    padding: '10px 12px',
    border: '1px solid var(--color-border-accent)',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
};
const botaoQualidade = {
    flex: 1,
    minWidth: 100,
    padding: '12px 16px',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
};
