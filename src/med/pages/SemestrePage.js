import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, Breadcrumb, Cartao, Grade, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { getSemestre } from '@med/data/curriculo';
export function SemestrePage() {
    const { num } = useParams();
    const navigate = useNavigate();
    const sem = getSemestre(Number(num));
    if (!sem)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-danger)' }, children: "Semestre n\u00E3o encontrado." }) });
    return (_jsxs(Pagina, { children: [_jsx(Breadcrumb, { itens: [{ label: 'Explorar', to: '/explorar' }, { label: `Semestre ${sem.numero}` }] }), _jsx(CabecalhoPagina, { titulo: sem.titulo, subtitulo: `Semestre ${sem.numero}` }), sem.disciplinas.length === 0 ? (_jsx(EstadoVazio, { children: _jsx(FalaAnima, { texto: `O semestre ${sem.numero} tem seu lugar aqui. Ainda estou construindo este pedaço de mim.` }) })) : (_jsx(Grade, { min: 240, children: sem.disciplinas.map((d) => (_jsxs(Cartao, { onClick: () => navigate(`/explorar/${sem.numero}/${d.id}`), cor: d.cor, children: [_jsx("p", { style: { margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: d.titulo }), _jsxs("p", { style: { margin: '6px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: [d.temas.length, " ", d.temas.length === 1 ? 'tema' : 'temas'] })] }, d.id))) }))] }));
}
