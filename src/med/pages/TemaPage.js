import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, Breadcrumb, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { getSemestre, getDisciplina, getTema } from '@med/data/curriculo';
import { useBlocoStore } from '@core/store/blocoStore';
import { useProgressoStore } from '@core/store/progressoStore';
import { useUIStore } from '@core/store/uiStore';
import { montarArvore } from '@med/components/flowchart/arvore';
import { Flowchart } from '@med/components/flowchart/Flowchart';
import { noVazio } from '@core/anima/voz';
export function TemaPage() {
    const { num, disc, tema } = useParams();
    const navigate = useNavigate();
    const { previewsPorPrefixo } = useBlocoStore();
    const { carregarVarios } = useProgressoStore();
    const { filtroNivel, toggleNivel, reduzirMovimento } = useUIStore();
    const sem = getSemestre(Number(num));
    const disciplina = getDisciplina(Number(num), disc ?? '');
    const temaObj = getTema(Number(num), disc ?? '', tema ?? '');
    const [previews, setPreviews] = useState(null);
    const [statusPorId, setStatusPorId] = useState({});
    useEffect(() => {
        if (!temaObj)
            return;
        let vivo = true;
        previewsPorPrefixo(temaObj.prefixo).then((prevs) => {
            if (!vivo)
                return;
            setPreviews(prevs);
            // só o progresso destes blocos, não a tabela inteira
            carregarVarios(prevs.map((p) => p.resumo_id)).then((porId) => {
                if (!vivo)
                    return;
                const map = {};
                for (const prev of prevs) {
                    const p = porId[prev.resumo_id];
                    map[prev.resumo_id] = p && p.vezes_lido > 0 ? p.srs.status : 'novo';
                }
                setStatusPorId(map);
            });
        });
        return () => {
            vivo = false;
        };
    }, [temaObj, previewsPorPrefixo, carregarVarios]);
    if (!sem || !disciplina || !temaObj)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-danger)' }, children: "Tema n\u00E3o encontrado." }) });
    const raizes = previews ? montarArvore(previews) : [];
    const vazio = previews !== null && previews.length === 0;
    // Filtro de nível: realça só os blocos cujo nível está ativo.
    const todosAtivos = filtroNivel.CORE && filtroNivel.EXPANSAO && filtroNivel.APROFUNDAMENTO;
    const idsRealcados = todosAtivos || !previews
        ? null
        : new Set(previews
            .filter((p) => {
            const n = p.metadata.nivel ?? 'CORE';
            return filtroNivel[n];
        })
            .map((p) => p.resumo_id));
    const niveis = ['CORE', 'EXPANSAO', 'APROFUNDAMENTO'];
    return (_jsxs(Pagina, { largura: 1400, children: [_jsx(Breadcrumb, { itens: [
                    { label: 'Explorar', to: '/explorar' },
                    { label: `Semestre ${sem.numero}`, to: `/explorar/${sem.numero}` },
                    { label: disciplina.titulo, to: `/explorar/${sem.numero}/${disciplina.id}` },
                    { label: temaObj.titulo },
                ] }), _jsx(CabecalhoPagina, { titulo: temaObj.titulo, subtitulo: temaObj.descricao }), vazio ? (_jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 40, marginBottom: 16, color: 'var(--color-accent)' }, children: "\u2726" }), _jsx(FalaAnima, { texto: noVazio(temaObj.titulo) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 16 }, children: niveis.map((n) => (_jsx("button", { onClick: () => toggleNivel(n), style: {
                                padding: '5px 12px',
                                borderRadius: 99,
                                border: `1px solid ${filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                background: filtroNivel[n] ? 'var(--color-accent-glow)' : 'transparent',
                                color: filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                cursor: 'pointer',
                            }, children: n }, n))) }), _jsx("div", { style: { height: 'calc(100svh - 270px)', minHeight: 400 }, children: _jsx(Flowchart, { raizes: raizes, statusPorId: statusPorId, atualId: null, reduzirMovimento: reduzirMovimento, onSelecionar: (id) => navigate(`/bloco/${id}`), idsRealcados: idsRealcados }) })] }))] }));
}
