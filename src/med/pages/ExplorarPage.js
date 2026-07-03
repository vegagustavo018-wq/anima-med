import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, Cartao, Grade, Badge } from '@core/components/ui/primitivos';
import { CURRICULO } from '@med/data/curriculo';
import { db } from '@core/db/database';
export function ExplorarPage() {
    const navigate = useNavigate();
    const [contagens, setContagens] = useState({});
    useEffect(() => {
        // conta blocos por semestre (prefixo sN-)
        db.blocos.toArray().then((blocos) => {
            const c = {};
            for (const b of blocos) {
                const sem = b.metadata.semestre;
                c[sem] = (c[sem] ?? 0) + 1;
            }
            setContagens(c);
        });
    }, []);
    return (_jsxs(Pagina, { children: [_jsx(CabecalhoPagina, { titulo: "Explorar", subtitulo: "Doze semestres. O curr\u00EDculo inteiro, do primeiro tecido \u00E0 cl\u00EDnica." }), _jsx(Grade, { min: 200, children: CURRICULO.map((sem) => {
                    const n = contagens[sem.numero] ?? 0;
                    const temConteudo = sem.disciplinas.length > 0;
                    return (_jsxs(Cartao, { onClick: () => temConteudo && navigate(`/explorar/${sem.numero}`), cor: temConteudo ? 'var(--color-accent)' : undefined, style: { opacity: temConteudo ? 1 : 0.55 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsx("span", { style: {
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: temConteudo ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                            fontFamily: 'var(--font-serif)',
                                        }, children: sem.numero }), n > 0 && _jsxs(Badge, { cor: "var(--color-accent-dim)", children: [n, " blocos"] })] }), _jsx("p", { style: { margin: '10px 0 2px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }, children: sem.titulo }), _jsx("p", { style: { margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }, children: temConteudo ? `${sem.disciplinas.length} disciplinas` : 'em breve' })] }, sem.numero));
                }) })] }));
}
