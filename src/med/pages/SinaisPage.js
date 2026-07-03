import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Pagina, CabecalhoPagina, FalaAnima } from '@core/components/ui/primitivos';
import { calcularMetricas } from '@core/anima/metricas';
import { diagnosticarErros } from '@core/anima/erros';
import { calcularCircadiano, melhorFaixa, DIAS } from '@core/anima/circadiano';
import { gerarRetrospectiva } from '@core/anima/retrospectiva';
import { db } from '@core/db/database';
import { baixarBackup } from '@core/db/backup';
const FAIXAS_HORA = [
    { label: '00–04h', ini: 0, fim: 4 },
    { label: '04–08h', ini: 4, fim: 8 },
    { label: '08–12h', ini: 8, fim: 12 },
    { label: '12–16h', ini: 12, fim: 16 },
    { label: '16–20h', ini: 16, fim: 20 },
    { label: '20–24h', ini: 20, fim: 24 },
];
export function SinaisPage() {
    const [m, setM] = useState(null);
    const [erros, setErros] = useState(null);
    const [circadiano, setCircadiano] = useState([]);
    const [retro, setRetro] = useState(null);
    const [periodo, setPeriodo] = useState('semana');
    const [saturacaoConexoes, setSaturacaoConexoes] = useState(0);
    useEffect(() => {
        calcularMetricas().then(setM);
        diagnosticarErros().then(setErros);
        calcularCircadiano().then(setCircadiano);
        db.blocos.toArray().then((blocos) => {
            if (!blocos.length)
                return;
            const comConexao = blocos.filter((b) => b.conexoes.prerequisitos.length + b.conexoes.futuras.length + b.conexoes.laterais.length > 0).length;
            setSaturacaoConexoes(Math.round((comConexao / blocos.length) * 100));
        });
    }, []);
    useEffect(() => {
        gerarRetrospectiva(periodo).then(setRetro);
    }, [periodo]);
    if (!m)
        return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Lendo os sinais..." }) });
    const faixaBoa = melhorFaixa(circadiano);
    const maxContagem = Math.max(1, ...circadiano.map((c) => c.contagem));
    return (_jsxs(Pagina, { largura: 980, children: [_jsx(CabecalhoPagina, { titulo: "Sinais Vitais", subtitulo: "A linguagem cl\u00EDnica que voc\u00EA j\u00E1 domina, aplicada a voc\u00EA mesmo.", acao: _jsx("button", { onClick: () => baixarBackup(), style: botaoLeve, children: "\u2193 Prontu\u00E1rio do organismo" }) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }, children: [_jsx(SinalVital, { rotulo: "Frequ\u00EAncia de reten\u00E7\u00E3o", valor: `${m.percentualDominio}%`, status: m.percentualDominio >= 70 ? 'normal' : m.percentualDominio >= 40 ? 'atencao' : 'alerta', descricao: "blocos em dom\u00EDnio \u2265 revisando" }), _jsx(SinalVital, { rotulo: "Press\u00E3o de calibra\u00E7\u00E3o", valor: m.calibracao != null ? `${m.calibracao}%` : '—', status: m.calibracao == null ? 'sem-dados' : m.calibracao >= 75 ? 'normal' : m.calibracao >= 50 ? 'atencao' : 'alerta', descricao: "confian\u00E7a alta que se confirmou" }), _jsx(SinalVital, { rotulo: "Satura\u00E7\u00E3o de conex\u00F5es", valor: `${saturacaoConexoes}%`, status: saturacaoConexoes >= 60 ? 'normal' : saturacaoConexoes >= 30 ? 'atencao' : 'alerta', descricao: "do acervo j\u00E1 tem conex\u00F5es declaradas" }), _jsx(SinalVital, { rotulo: "Cards vencidos", valor: m.vencidos, status: m.vencidos === 0 ? 'normal' : m.vencidos <= 10 ? 'atencao' : 'alerta', descricao: "aguardando revis\u00E3o agora" })] }), _jsxs("section", { style: { marginBottom: 40 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: 0 }, children: "Retrospectiva" }), _jsx("div", { style: { display: 'flex', gap: 6 }, children: ['semana', 'mes'].map((p) => (_jsx("button", { onClick: () => setPeriodo(p), style: {
                                        padding: '4px 10px',
                                        borderRadius: 99,
                                        border: `1px solid ${periodo === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                        background: periodo === p ? 'var(--color-accent-glow)' : 'transparent',
                                        color: periodo === p ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                        fontSize: 11,
                                        cursor: 'pointer',
                                    }, children: p === 'semana' ? 'Semana' : 'Mês' }, p))) })] }), retro && _jsx(FalaAnima, { texto: retro.narrativa, grande: true })] }), erros && erros.totalErros > 0 && (_jsxs("section", { style: { marginBottom: 40 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }, children: "Di\u00E1rio de Erros Diagn\u00F3sticos" }), erros.fraseDiagnostico && (_jsx("div", { style: { marginBottom: 16 }, children: _jsx(FalaAnima, { texto: erros.fraseDiagnostico }) })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }, children: "Por disciplina" }), erros.porDisciplina.map((p) => (_jsx(BarraPadrao, { rotulo: p.rotulo, percentual: p.percentual, contagem: p.contagem }, p.chave)))] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }, children: "Por tipo de racioc\u00EDnio" }), erros.porTipoCard.map((p) => (_jsx(BarraPadrao, { rotulo: p.rotulo.replace(/_/g, ' '), percentual: p.percentual, contagem: p.contagem }, p.chave))), erros.porTipoCard.length === 0 && (_jsx("p", { style: { fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Ainda sem dados por tipo." }))] })] })] })), _jsxs("section", { children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }, children: "Ritmo Circadiano" }), faixaBoa && (_jsx("div", { style: { marginBottom: 16 }, children: _jsx(FalaAnima, { texto: faixaBoa }) })), circadiano.length > 0 ? (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { borderCollapse: 'collapse', fontSize: 11 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { padding: 4 } }), FAIXAS_HORA.map((f) => (_jsx("th", { style: { padding: 4, color: 'var(--color-text-muted)', fontWeight: 400 }, children: f.label }, f.label)))] }) }), _jsx("tbody", { children: DIAS.map((dia, diaIdx) => (_jsxs("tr", { children: [_jsx("td", { style: { padding: 4, color: 'var(--color-text-muted)', textAlign: 'right', paddingRight: 8 }, children: dia }), FAIXAS_HORA.map((f) => {
                                                const cels = circadiano.filter((c) => c.diaSemana === diaIdx && c.hora >= f.ini && c.hora < f.fim);
                                                const contagem = cels.reduce((s, c) => s + c.contagem, 0);
                                                const acertos = cels.reduce((s, c) => s + c.acertos, 0);
                                                const intensidade = contagem / maxContagem;
                                                const taxa = contagem ? acertos / contagem : 0;
                                                return (_jsx("td", { style: { padding: 3 }, children: _jsx("div", { title: contagem ? `${contagem} revisões, ${Math.round(taxa * 100)}% acerto` : 'sem dados', style: {
                                                            width: 32,
                                                            height: 20,
                                                            borderRadius: 4,
                                                            background: contagem === 0 ? 'var(--color-bg-card)' : `rgba(79, 209, 197, ${0.15 + intensidade * 0.7})`,
                                                            border: '1px solid var(--color-border)',
                                                        } }) }, f.label));
                                            })] }, dia))) })] }) })) : (_jsx("p", { style: { fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Ainda sem dados suficientes de hor\u00E1rio." }))] })] }));
}
function SinalVital({ rotulo, valor, status, descricao, }) {
    const cor = {
        normal: 'var(--color-success)',
        atencao: 'var(--color-warning)',
        alerta: 'var(--color-danger)',
        'sem-dados': 'var(--color-text-muted)',
    }[status];
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: `1px solid ${status === 'alerta' ? cor : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: 18,
            position: 'relative',
            overflow: 'hidden',
        }, children: [_jsx("div", { style: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: cor } }), _jsx("p", { style: { margin: 0, fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }, children: rotulo }), _jsx("p", { style: { margin: '6px 0 2px', fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }, children: valor }), _jsx("p", { style: { margin: 0, fontSize: 11, color: 'var(--color-text-secondary)' }, children: descricao })] }));
}
function BarraPadrao({ rotulo, percentual, contagem }) {
    return (_jsxs("div", { style: { marginBottom: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }, children: [_jsx("span", { style: { color: 'var(--color-text-secondary)', textTransform: 'capitalize' }, children: rotulo }), _jsx("span", { style: { color: 'var(--color-text-muted)' }, children: contagem })] }), _jsx("div", { style: { height: 5, background: 'var(--color-bg-hover)', borderRadius: 3, overflow: 'hidden' }, children: _jsx("div", { style: { height: '100%', width: `${percentual}%`, background: 'var(--color-warning)' } }) })] }));
}
const botaoLeve = {
    padding: '8px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    cursor: 'pointer',
};
