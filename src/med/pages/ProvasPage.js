import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { useProvasStore, diasAte } from '@core/store/provasStore';
import { useSessaoConfigStore } from '@core/store/sessaoConfigStore';
/** Contagem regressiva de prova com plano vivo (bloco 6). */
export function ProvasPage() {
    const navigate = useNavigate();
    const { provas, carregar, criar, remover } = useProvasStore();
    const { aplicarPreset } = useSessaoConfigStore();
    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    useEffect(() => {
        carregar();
    }, [carregar]);
    const salvar = async () => {
        if (!titulo.trim() || !data)
            return;
        await criar(titulo.trim(), data, []);
        setTitulo('');
        setData('');
    };
    const irEstudarComFoco = async () => {
        await aplicarPreset('prova');
        navigate('/estudar');
    };
    return (_jsxs(Pagina, { largura: 720, children: [_jsx(CabecalhoPagina, { titulo: "Provas", subtitulo: "Contagem serena, plano vivo \u2014 n\u00E3o p\u00E2nico de v\u00E9spera." }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }, children: [_jsx("input", { value: titulo, onChange: (e) => setTitulo(e.target.value), placeholder: "Nome da prova", style: { flex: 2, minWidth: 160, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 } }), _jsx("input", { type: "date", value: data, onChange: (e) => setData(e.target.value), style: { flex: 1, minWidth: 140, padding: '10px 12px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 } }), _jsx("button", { onClick: salvar, style: { padding: '10px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }, children: "Adicionar" })] }), provas.length === 0 ? (_jsx(EstadoVazio, { children: _jsx(FalaAnima, { texto: "Nenhuma prova marcada. Quando marcar, eu ajusto o ritmo das revis\u00F5es para voc\u00EA." }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: provas.map((p) => {
                    const dias = diasAte(p.data);
                    return (_jsxs("div", { style: {
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 16,
                        }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }, children: p.titulo }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) })] }), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 22, fontWeight: 700, color: dias <= 3 ? 'var(--color-warning)' : 'var(--color-accent)', fontFamily: 'var(--font-mono)' }, children: dias === 0 ? 'hoje' : dias < 0 ? 'passou' : `${dias}d` }), _jsx("button", { onClick: () => irEstudarComFoco(), style: { padding: '6px 12px', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }, children: "Focar" }), _jsx("button", { onClick: () => p.id && remover(p.id), style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 16, cursor: 'pointer' }, children: "\u00D7" })] })] }, p.id));
                }) }))] }));
}
