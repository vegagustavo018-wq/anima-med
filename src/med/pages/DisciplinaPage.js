import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, Breadcrumb, Cartao, Grade, Badge } from '@core/components/ui/primitivos';
import { getSemestre, getDisciplina } from '@med/data/curriculo';
import { db } from '@core/db/database';
export function DisciplinaPage() {
    const { num, disc } = useParams();
    const navigate = useNavigate();
    const sem = getSemestre(Number(num));
    const disciplina = getDisciplina(Number(num), disc ?? '');
    const [contagens, setContagens] = useState({});
    useEffect(() => {
        if (!disciplina)
            return;
        Promise.all(disciplina.temas.map(async (t) => {
            const n = await db.blocos.where('resumo_id').startsWith(t.prefixo).count();
            return [t.id, n];
        })).then((pares) => setContagens(Object.fromEntries(pares)));
    }, [disciplina]);
    if (!sem || !disciplina)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-danger)' }, children: "Disciplina n\u00E3o encontrada." }) });
    return (_jsxs(Pagina, { children: [_jsx(Breadcrumb, { itens: [
                    { label: 'Explorar', to: '/explorar' },
                    { label: `Semestre ${sem.numero}`, to: `/explorar/${sem.numero}` },
                    { label: disciplina.titulo },
                ] }), _jsx(CabecalhoPagina, { titulo: disciplina.titulo }), _jsx(Grade, { min: 260, children: disciplina.temas.map((t) => {
                    const n = contagens[t.id] ?? 0;
                    const temConteudo = n > 0;
                    return (_jsxs(Cartao, { onClick: () => navigate(`/explorar/${sem.numero}/${disciplina.id}/${t.id}`), cor: disciplina.cor, style: { opacity: temConteudo ? 1 : 0.6 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }, children: [_jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }, children: t.titulo }), _jsx(Badge, { cor: temConteudo ? disciplina.cor : undefined, children: temConteudo ? `${n}` : '—' })] }), t.descricao && (_jsx("p", { style: { margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }, children: t.descricao })), !temConteudo && (_jsx("p", { style: { margin: '8px 0 0', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "ainda n\u00E3o nasceu" }))] }, t.id));
                }) })] }));
}
