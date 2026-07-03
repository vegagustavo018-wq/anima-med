import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos';
import { useDiarioStore } from '@core/store/diarioStore';
import { useDuvidasStore } from '@core/store/duvidasStore';
function hoje() {
    return new Date().toISOString().slice(0, 10);
}
/** Diário do Organismo — daily note ligada às dúvidas capturadas (bloco 9). */
export function DiarioPage() {
    const { entradas, carregarTudo, salvar } = useDiarioStore();
    const { duvidas, carregar: carregarDuvidas, resolver } = useDuvidasStore();
    const [diaAtivo, setDiaAtivo] = useState(hoje());
    const [texto, setTexto] = useState('');
    const [salvo, setSalvo] = useState(true);
    useEffect(() => {
        carregarTudo();
        carregarDuvidas();
    }, [carregarTudo, carregarDuvidas]);
    useEffect(() => {
        setTexto(entradas.get(diaAtivo)?.texto ?? '');
        setSalvo(true);
    }, [diaAtivo, entradas]);
    const duvidasDoDia = useMemo(() => duvidas.filter((d) => d.criado_em.slice(0, 10) === diaAtivo), [duvidas, diaAtivo]);
    const diasComEntrada = useMemo(() => [...entradas.keys()].sort((a, b) => b.localeCompare(a)).slice(0, 14), [entradas]);
    const persistir = async (novoTexto) => {
        setTexto(novoTexto);
        setSalvo(false);
    };
    useEffect(() => {
        if (salvo)
            return;
        const t = setTimeout(async () => {
            await salvar(diaAtivo, texto, duvidasDoDia.map((d) => d.id).filter(Boolean));
            setSalvo(true);
        }, 600);
        return () => clearTimeout(t);
    }, [texto, salvo, diaAtivo, salvar, duvidasDoDia]);
    return (_jsxs(Pagina, { largura: 820, children: [_jsx(CabecalhoPagina, { titulo: "Di\u00E1rio do Organismo", subtitulo: "Um lugar para pensar em voz alta. Ningu\u00E9m corrige isso." }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("button", { onClick: () => setDiaAtivo(hoje()), style: {
                            padding: '6px 14px',
                            borderRadius: 99,
                            border: `1px solid ${diaAtivo === hoje() ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: diaAtivo === hoje() ? 'var(--color-accent-glow)' : 'transparent',
                            color: diaAtivo === hoje() ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }, children: "Hoje" }), diasComEntrada.filter((d) => d !== hoje()).map((d) => (_jsx("button", { onClick: () => setDiaAtivo(d), style: {
                            padding: '6px 12px',
                            borderRadius: 99,
                            border: `1px solid ${diaAtivo === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: diaAtivo === d ? 'var(--color-accent-glow)' : 'transparent',
                            color: diaAtivo === d ? 'var(--color-accent)' : 'var(--color-text-muted)',
                            fontSize: 11,
                            cursor: 'pointer',
                        }, children: new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }, d)))] }), _jsx("textarea", { value: texto, onChange: (e) => persistir(e.target.value), placeholder: "O que passou pela sua cabe\u00E7a estudando hoje?", rows: 10, style: {
                    width: '100%',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    color: 'var(--color-text-primary)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontFamily: 'var(--font-serif)',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                } }), _jsx("p", { style: { margin: '6px 0 0', fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right' }, children: salvo ? 'salvo' : 'salvando...' }), duvidasDoDia.length > 0 && (_jsxs("div", { style: { marginTop: 32 }, children: [_jsx("p", { style: { margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }, children: "D\u00FAvidas capturadas neste dia" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: duvidasDoDia.map((d) => (_jsxs("div", { style: {
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 12,
                                opacity: d.resolvida ? 0.5 : 1,
                            }, children: [_jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }, children: ["\"", d.trecho.slice(0, 100), "\""] }), !d.resolvida && (_jsx("button", { onClick: () => d.id && resolver(d.id), style: { flexShrink: 0, background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', fontSize: 11, padding: '4px 10px', cursor: 'pointer' }, children: "Resolvida" }))] }, d.id))) })] })), diasComEntrada.length === 0 && (_jsx("div", { style: { marginTop: 20 }, children: _jsx(FalaAnima, { texto: "Escreva livremente. Com o tempo, este di\u00E1rio vira um mapa de como voc\u00EA pensa." }) }))] }));
}
