import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { detectarLacunas } from '@core/anima/lacunas';
/** Detector de Lacunas (bloco 4) — bases que ficaram para trás. */
export function LacunasPage() {
    const navigate = useNavigate();
    const [lacunas, setLacunas] = useState(null);
    useEffect(() => {
        detectarLacunas().then(setLacunas);
    }, []);
    return (_jsxs(Pagina, { largura: 800, children: [_jsx(CabecalhoPagina, { titulo: "Detector de Lacunas", subtitulo: "Onde voc\u00EA avan\u00E7ou sem a base \u2014 n\u00E3o \u00E9 IA, \u00E9 aritm\u00E9tica sobre o seu pr\u00F3prio hist\u00F3rico." }), lacunas === null ? (_jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Analisando..." })) : lacunas.length === 0 ? (_jsx(EstadoVazio, { children: _jsx(FalaAnima, { texto: "Nenhuma lacuna detectada por enquanto. Suas bases parecem s\u00F3lidas at\u00E9 aqui." }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: lacunas.map((l, i) => (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { children: [_jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }, children: ["Voc\u00EA estudou ", _jsx("strong", { children: l.bloco_titulo }), " mas a base ", _jsx("strong", { children: l.prereq_titulo }), " ", l.motivo === 'nunca_estudado' ? 'nunca foi estudada' : 'ainda está frágil', "."] }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }, children: l.bloco_disciplina })] }), _jsx("button", { onClick: () => navigate(`/bloco/${l.prereq_id}`), style: { flexShrink: 0, padding: '7px 14px', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }, children: "Fechar a base" })] }, i))) }))] }));
}
