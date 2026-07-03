import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pagina, CabecalhoPagina, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos';
import { montarJardim } from '@core/anima/jardim';
import { calcularOnda, continuidadeAtual } from '@core/anima/ritmo';
const ICONE = {
    broto: '🌱',
    crescendo: '🌿',
    florida: '🌸',
    murchando: '🥀',
};
const ROTULO = {
    broto: 'brotando',
    crescendo: 'crescendo',
    florida: 'florida',
    murchando: 'precisa de água',
};
// Constância Compassiva (P30): ritmo médio de 30 dias, sem streak-culpa.
function mensagemConstancia(dias) {
    const ativos = dias.filter((d) => d.intensidade > 0).length;
    const continuidade = continuidadeAtual(dias);
    const retomouHoje = dias[dias.length - 1]?.ehRetomada;
    if (retomouHoje) {
        return { titulo: 'Você voltou', texto: 'Descansar faz parte do organismo. O importante é que você está aqui de novo — eu guardei tudo pra você.' };
    }
    if (ativos === 0) {
        return { titulo: 'Terra em repouso', texto: 'Nenhum dia ativo nos últimos 30. Sem cobrança — quando quiser, a gente rega o jardim junto.' };
    }
    if (continuidade >= 3) {
        return { titulo: `${continuidade} dias seguidos`, texto: `Seu ritmo médio foi de ${ativos} dias ativos no último mês. Constância não é nunca faltar — é sempre voltar.` };
    }
    return { titulo: `${ativos} dias ativos no mês`, texto: 'Ritmo é maré, não corrente contínua. Você está mantendo o organismo vivo — isso basta.' };
}
export function JardimPage() {
    const navigate = useNavigate();
    const jardim = useLiveQuery(() => montarJardim(), []);
    const [onda, setOnda] = useState(null);
    useEffect(() => {
        calcularOnda().then(setOnda);
    }, []);
    const constancia = onda ? mensagemConstancia(onda) : null;
    return (_jsxs(Pagina, { largura: 960, children: [_jsx(CabecalhoPagina, { titulo: "Jardim das Sementes", subtitulo: "Cada bloco que voc\u00EA estudou \u00E9 uma planta. O estado dela \u00E9 o estado da sua mem\u00F3ria." }), constancia && (_jsxs("div", { style: {
                    marginBottom: 24,
                    padding: '18px 22px',
                    background: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    gap: 18,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }, children: [onda && (_jsx("div", { style: { display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }, children: onda.slice(-14).map((d) => (_jsx("span", { title: `${d.data}${d.ehRetomada ? ' · retomada' : ''}`, style: {
                                width: 7,
                                height: `${20 + d.intensidade * 20}px`,
                                borderRadius: 2,
                                background: d.intensidade > 0 ? 'var(--color-accent)' : 'var(--color-border)',
                                opacity: d.ehHoje ? 1 : 0.55 + d.intensidade * 0.45,
                                outline: d.ehRetomada ? '1px solid var(--color-success)' : 'none',
                            } }, d.data))) })), _jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [_jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }, children: constancia.titulo }), _jsx("p", { style: { margin: '3px 0 0', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }, children: constancia.texto })] })] })), !jardim ? (_jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Cultivando\u2026" })) : jardim.totalPlantas === 0 ? (_jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 44, marginBottom: 16 }, children: "\uD83C\uDF31" }), _jsx(FalaAnima, { texto: "O jardim ainda est\u00E1 em terra nua. Cada bloco que voc\u00EA estudar planta uma semente aqui \u2014 e eu cuido para que nada se perca." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: 18, marginBottom: 22, flexWrap: 'wrap' }, children: [_jsx(Resumo, { icone: "\uD83C\uDF38", n: jardim.floridas, label: "floridas" }), _jsx(Resumo, { icone: "\uD83C\uDF3F", n: jardim.totalPlantas - jardim.floridas - jardim.murchando - jardim.brotos, label: "crescendo" }), _jsx(Resumo, { icone: "\uD83C\uDF31", n: jardim.brotos, label: "brotando" }), _jsx(Resumo, { icone: "\uD83E\uDD40", n: jardim.murchando, label: "pedindo \u00E1gua", cor: jardim.murchando ? 'var(--color-warning)' : undefined })] }), jardim.murchando > 0 && (_jsx("div", { style: { marginBottom: 24 }, children: _jsx(FalaAnima, { texto: `${jardim.murchando} ${jardim.murchando === 1 ? 'planta está murchando' : 'plantas estão murchando'} — toque nelas para regar (revisar). Nenhuma morre; só espera você.` }) })), jardim.canteiros.map((c) => (_jsxs("section", { style: { marginBottom: 28 }, children: [_jsxs("p", { style: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }, children: [c.disciplina, " \u00B7 ", c.floridas, "/", c.plantas.length, " floridas"] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 10 }, children: c.plantas.map((pl) => (_jsxs("button", { onClick: () => navigate(`/bloco/${pl.resumo_id}`), title: `${pl.titulo} — ${ROTULO[pl.estado]}`, className: pl.estado === 'murchando' ? 'anima-respira anima-lift' : 'anima-lift', style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '12px 6px',
                                        border: `1px solid ${pl.estado === 'murchando' ? 'var(--color-warning)' : 'var(--color-border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        background: pl.estado === 'florida' ? 'color-mix(in srgb, var(--color-success) 8%, transparent)' : 'var(--color-bg-card)',
                                        cursor: 'pointer',
                                    }, children: [_jsx("span", { style: { fontSize: 24, filter: pl.estado === 'murchando' ? 'grayscale(0.3)' : 'none' }, "aria-hidden": "true", children: ICONE[pl.estado] }), _jsx("span", { style: { fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: pl.titulo })] }, pl.resumo_id))) })] }, c.disciplina)))] }))] }));
}
function Resumo({ icone, n, label, cor }) {
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: 22 }, "aria-hidden": "true", children: icone }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }, children: n }), _jsx("div", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: label })] })] }));
}
