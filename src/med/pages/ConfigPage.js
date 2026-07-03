import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Pagina, CabecalhoPagina, Badge } from '@core/components/ui/primitivos';
import { useUIStore } from '@core/store/uiStore';
import { useDuvidasStore } from '@core/store/duvidasStore';
import { garantirPersistencia } from '@core/db/storage';
import { baixarBackup } from '@core/db/backup';
import { anunciar } from '@core/store/anuncioStore';
import { tocar } from '@core/anima/som';
export function ConfigPage() {
    const { reduzirMovimento, setReduzirMovimento, som, setSom, tema, setTema, filtroNivel, toggleNivel, fonte, setFonte, tamanhoFonte, setTamanhoFonte, larguraColuna, setLarguraColuna, paleta, setPaleta, perfilSessao, setPerfilSessao, } = useUIStore();
    const { duvidas, carregar, resolver, remover } = useDuvidasStore();
    const [armazenamento, setArmazenamento] = useState(null);
    useEffect(() => {
        carregar();
        garantirPersistencia().then(setArmazenamento);
    }, [carregar]);
    const abertas = duvidas.filter((d) => !d.resolvida);
    return (_jsxs(Pagina, { largura: 760, children: [_jsx(CabecalhoPagina, { titulo: "Ajustes" }), _jsx(Secao, { titulo: "Estudo", children: _jsx(Linha, { rotulo: "Filtro de n\u00EDvel", desc: "O que aparece por padr\u00E3o nos temas.", children: _jsx("div", { style: { display: 'flex', gap: 8 }, children: ['CORE', 'EXPANSAO', 'APROFUNDAMENTO'].map((n) => (_jsx("button", { onClick: () => toggleNivel(n), style: {
                                padding: '6px 12px',
                                borderRadius: 99,
                                border: `1px solid ${filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                background: filtroNivel[n] ? 'var(--color-accent-glow)' : 'transparent',
                                color: filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                            }, children: n }, n))) }) }) }), _jsx(Secao, { titulo: "Perfil de sess\u00E3o", children: _jsx(Linha, { rotulo: "Como voc\u00EA est\u00E1 agora", desc: "Ajusta densidade, quantidade e tom da ANIMA.", children: _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [
                            { v: 'pico', l: 'Pico', icone: '↑' },
                            { v: 'manutencao', l: 'Manutenção', icone: '→' },
                            { v: 'exausto', l: 'Exausto', icone: '↓' },
                            { v: 'padrao', l: 'Padrão', icone: '·' },
                        ].map((p) => (_jsxs("button", { onClick: () => setPerfilSessao(p.v), style: {
                                padding: '6px 12px',
                                borderRadius: 99,
                                border: `1px solid ${perfilSessao === p.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                background: perfilSessao === p.v ? 'var(--color-accent-glow)' : 'transparent',
                                color: perfilSessao === p.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                            }, children: [p.icone, " ", p.l] }, p.v))) }) }) }), _jsxs(Secao, { titulo: "Apar\u00EAncia", children: [_jsx(Linha, { rotulo: "Tema", desc: "A pele do organismo.", children: _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [
                                { v: 'escuro', l: 'Deep Ocean' },
                                { v: 'oled', l: 'OLED' },
                                { v: 'sepia', l: 'Sépia' },
                                { v: 'claro', l: 'Claro' },
                            ].map((t) => (_jsx("button", { onClick: () => {
                                    setTema(t.v);
                                    tocar('transicao');
                                }, style: {
                                    padding: '6px 12px',
                                    borderRadius: 99,
                                    border: `1px solid ${tema === t.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    background: tema === t.v ? 'var(--color-accent-glow)' : 'transparent',
                                    color: tema === t.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }, children: t.l }, t.v))) }) }), _jsx(Linha, { rotulo: "Som", desc: "Toques sutis ao revelar, acertar e firmar dom\u00EDnio.", children: _jsx(Toggle, { ativo: som, onClick: () => {
                                const novo = !som;
                                setSom(novo);
                                if (novo)
                                    tocar('sucesso');
                            } }) })] }), _jsxs(Secao, { titulo: "Central de Acessibilidade", children: [_jsx(Linha, { rotulo: "Reduzir movimento", desc: "Desliga pulsos e anima\u00E7\u00F5es do fluxograma.", children: _jsx(Toggle, { ativo: reduzirMovimento, onClick: () => setReduzirMovimento(!reduzirMovimento) }) }), _jsx(Linha, { rotulo: "Tipografia", desc: "Fonte de leitura da narrativa.", children: _jsx("div", { style: { display: 'flex', gap: 8 }, children: [
                                { v: 'padrao', l: 'Padrão' },
                                { v: 'dislexia', l: 'Dislexia' },
                                { v: 'serifada', l: 'Serifada' },
                            ].map((f) => (_jsx("button", { onClick: () => setFonte(f.v), style: {
                                    padding: '6px 12px',
                                    borderRadius: 99,
                                    border: `1px solid ${fonte === f.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    background: fonte === f.v ? 'var(--color-accent-glow)' : 'transparent',
                                    color: fonte === f.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }, children: f.l }, f.v))) }) }), _jsx(Linha, { rotulo: "Tamanho da fonte", desc: `${Math.round(tamanhoFonte * 100)}%`, children: _jsx("input", { type: "range", min: 0.85, max: 1.4, step: 0.05, value: tamanhoFonte, onChange: (e) => setTamanhoFonte(Number(e.target.value)), style: { width: 140, accentColor: 'var(--color-accent)' } }) }), _jsx(Linha, { rotulo: "Largura de coluna", desc: "Regula quanto texto cabe por linha.", children: _jsx("div", { style: { display: 'flex', gap: 8 }, children: [
                                { v: 'estreita', l: 'Estreita' },
                                { v: 'normal', l: 'Normal' },
                                { v: 'larga', l: 'Larga' },
                            ].map((l) => (_jsx("button", { onClick: () => setLarguraColuna(l.v), style: {
                                    padding: '6px 12px',
                                    borderRadius: 99,
                                    border: `1px solid ${larguraColuna === l.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    background: larguraColuna === l.v ? 'var(--color-accent-glow)' : 'transparent',
                                    color: larguraColuna === l.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }, children: l.l }, l.v))) }) }), _jsx(Linha, { rotulo: "Paleta de cores", desc: "Alternativas para daltonismo e alto contraste.", children: _jsxs("select", { value: paleta, onChange: (e) => setPaleta(e.target.value), style: {
                                background: 'var(--color-bg-elevated)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: 12,
                                padding: '6px 10px',
                            }, children: [_jsx("option", { value: "padrao", children: "Deep Ocean (padr\u00E3o)" }), _jsx("option", { value: "protanopia", children: "Protanopia" }), _jsx("option", { value: "deuteranopia", children: "Deuteranopia" }), _jsx("option", { value: "tritanopia", children: "Tritanopia" }), _jsx("option", { value: "alto-contraste", children: "Alto contraste" })] }) }), _jsx(Linha, { rotulo: "Navega\u00E7\u00E3o por teclado", desc: "Paleta de comandos completa.", children: _jsxs("span", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: [_jsx("code", { children: "/" }), " ou ", _jsx("code", { children: "Cmd+K" }), " em qualquer lugar"] }) })] }), _jsxs(Secao, { titulo: "Meus dados", children: [_jsx(Linha, { rotulo: "Backup do progresso", desc: "Seu estudo \u00E9 sagrado \u2014 leve uma c\u00F3pia.", children: _jsx("button", { onClick: async () => {
                                await baixarBackup();
                                anunciar('Backup exportado — seu progresso está seguro.', { tipo: 'sucesso' });
                            }, style: botao, children: "\u2193 Exportar" }) }), armazenamento && (_jsx(Linha, { rotulo: "Armazenamento", desc: "Persist\u00EAncia protege contra perda de dados.", children: _jsxs("span", { style: { fontSize: 12, color: armazenamento.persistente ? 'var(--color-success)' : 'var(--color-warning)' }, children: [armazenamento.persistente ? '✓ garantido' : '⚠ não garantido', armazenamento.usoMB != null && ` · ${armazenamento.usoMB} MB`] }) }))] }), _jsx(Secao, { titulo: `Minhas dúvidas (${abertas.length})`, children: abertas.length === 0 ? (_jsxs("p", { style: { fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: ["Nenhuma d\u00FAvida guardada. Selecione um trecho e aperte ", _jsx("code", { children: "q" }), " para capturar."] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: abertas.map((d) => (_jsxs("div", { style: {
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                        }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }, children: d.trecho }), d.contexto && d.contexto !== d.trecho && (_jsx("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: d.contexto })), d.resumo_id && _jsx(Badge, { children: d.resumo_id })] }), _jsx("button", { onClick: () => d.id && resolver(d.id), title: "Resolver", style: iconBtn, children: "\u2713" }), _jsx("button", { onClick: () => d.id && remover(d.id), title: "Remover", style: iconBtn, children: "\u00D7" })] }, d.id))) })) })] }));
}
function Secao({ titulo, children }) {
    return (_jsxs("section", { style: { marginBottom: 32 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }, children: titulo }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: children })] }));
}
function Linha({ rotulo, desc, children }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
        }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 14, color: 'var(--color-text-primary)' }, children: rotulo }), desc && _jsx("p", { style: { margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: desc })] }), children] }));
}
function Toggle({ ativo, onClick }) {
    return (_jsx("button", { onClick: onClick, style: {
            width: 44,
            height: 24,
            borderRadius: 99,
            border: 'none',
            background: ativo ? 'var(--color-accent)' : 'var(--color-bg-hover)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.15s',
        }, children: _jsx("span", { style: {
                position: 'absolute',
                top: 3,
                left: ativo ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.15s',
            } }) }));
}
const botao = {
    padding: '8px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
};
const iconBtn = {
    width: 28,
    height: 28,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontSize: 14,
    flexShrink: 0,
};
