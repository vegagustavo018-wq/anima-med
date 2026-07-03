import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos';
import { db } from '@core/db/database';
import { ehLeech } from '@core/srs/sm2';
import { useProgressoStore } from '@core/store/progressoStore';
import { explicarErro } from '@core/anima/explicarErro';
/**
 * Enfermaria de Sanguessugas (bloco 1) — conceitos que resistem ao SRS
 * repetidamente NÃO são punidos. A dificuldade é tratada como falha do
 * ensino, não do estudante.
 */
export function LeechWardPage() {
    const navigate = useNavigate();
    const { reformularParaLeech } = useProgressoStore();
    const [linhas, setLinhas] = useState([]);
    const [expandido, setExpandido] = useState(null);
    const [explicacoes, setExplicacoes] = useState({});
    useEffect(() => {
        ;
        (async () => {
            const progresso = await db.progresso.toArray();
            const leeches = progresso.filter((p) => ehLeech(p.srs));
            const blocos = await Promise.all(leeches.map((p) => db.blocos.get(p.resumo_id)));
            setLinhas(leeches
                .map((p, i) => ({ bloco: blocos[i], progresso: p }))
                .filter((l) => !!l.bloco)
                .sort((a, b) => b.progresso.srs.lapsos - a.progresso.srs.lapsos));
        })();
    }, []);
    const alternarExplicacao = async (bloco) => {
        if (expandido === bloco.resumo_id) {
            setExpandido(null);
            return;
        }
        setExpandido(bloco.resumo_id);
        if (!explicacoes[bloco.resumo_id]) {
            const exp = await explicarErro(bloco);
            setExplicacoes((e) => ({ ...e, [bloco.resumo_id]: exp }));
        }
    };
    return (_jsxs(Pagina, { largura: 800, children: [_jsx(CabecalhoPagina, { titulo: "Enfermaria de Sanguessugas", subtitulo: "Blocos que resistiram muitas vezes. Aqui, resistir \u00E9 dado \u2014 n\u00E3o culpa." }), linhas.length === 0 ? (_jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 40, marginBottom: 16, color: 'var(--color-accent)' }, children: "\u2726" }), _jsx(FalaAnima, { texto: "Nada aqui precisa de cuidado especial agora. Isso \u00E9 bom sinal." })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: linhas.map(({ bloco, progresso }) => (_jsxs("div", { style: {
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-danger)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 20px',
                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }, children: bloco.metadata.titulo }), _jsxs("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: [progresso.srs.lapsos, " reca\u00EDdas \u00B7 ", bloco.metadata.disciplina] })] }), _jsxs("div", { style: { display: 'flex', gap: 8, flexShrink: 0 }, children: [_jsx("button", { onClick: () => alternarExplicacao(bloco), style: { padding: '7px 14px', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer' }, children: "Por que isso resiste?" }), _jsx("button", { onClick: () => navigate(`/bloco/${bloco.resumo_id}`), style: { padding: '7px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer' }, children: "Reler" }), _jsx("button", { onClick: () => reformularParaLeech(bloco.resumo_id), style: { padding: '7px 14px', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }, children: "Reiniciar suave" })] })] }), expandido === bloco.resumo_id && (_jsx("div", { style: { marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }, children: explicacoes[bloco.resumo_id] ? (_jsxs(_Fragment, { children: [_jsx("p", { style: { margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }, children: explicacoes[bloco.resumo_id].titulo }), _jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: explicacoes[bloco.resumo_id].explicacao }), explicacoes[bloco.resumo_id].bloco_alvo_id && (_jsx("button", { onClick: () => navigate(`/bloco/${explicacoes[bloco.resumo_id].bloco_alvo_id}`), style: { marginTop: 10, background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer', padding: 0 }, children: "Ir para o pr\u00E9-requisito \u2192" }))] })) : (_jsx("p", { style: { margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }, children: "Analisando..." })) }))] }, bloco.resumo_id))) }))] }));
}
