import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { useSinteseStore } from '@core/store/sinteseStore';
/** Lista de canvases de síntese (bloco 9). */
export function SintesePage() {
    const navigate = useNavigate();
    const { lista, carregarLista, criar, remover } = useSinteseStore();
    const [titulo, setTitulo] = useState('');
    useEffect(() => {
        carregarLista();
    }, [carregarLista]);
    const nova = async () => {
        const t = titulo.trim() || 'Síntese sem título';
        const id = await criar(t);
        navigate(`/sintese/${id}`);
    };
    return (_jsxs(Pagina, { largura: 820, children: [_jsx(CabecalhoPagina, { titulo: "Canvas de S\u00EDntese", subtitulo: "Um espa\u00E7o livre para amarrar ideias com suas pr\u00F3prias palavras." }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 32 }, children: [_jsx("input", { value: titulo, onChange: (e) => setTitulo(e.target.value), onKeyDown: (e) => e.key === 'Enter' && nova(), placeholder: "Nome da s\u00EDntese (ex: Ciclo de Krebs)", style: { flex: 1, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 } }), _jsx("button", { onClick: nova, style: { padding: '10px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }, children: "Criar" })] }), lista.length === 0 ? (_jsx(EstadoVazio, { children: _jsx(FalaAnima, { texto: "Nenhuma s\u00EDntese ainda. Comece uma quando quiser conectar ideias com as pr\u00F3prias m\u00E3os." }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: lista.map((s) => (_jsxs("div", { style: {
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }, onClick: () => navigate(`/sintese/${s.id}`), children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }, children: s.titulo }), _jsxs("p", { style: { margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }, children: [s.nos.length, " n\u00F3s \u00B7 ", s.arestas.length, " conex\u00F5es"] })] }), _jsx("button", { onClick: (e) => {
                                e.stopPropagation();
                                s.id && remover(s.id);
                            }, style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer' }, children: "\u00D7" })] }, s.id))) }))] }));
}
