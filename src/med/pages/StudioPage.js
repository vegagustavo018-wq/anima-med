import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@core/db/database';
import { Pagina, CabecalhoPagina, Badge } from '@core/components/ui/primitivos';
import { checar8Etapas, validarSchema, checarIntegridade } from '@core/autoria/validador';
import { baixarBackup, importarProgresso } from '@core/db/backup';
import { garantirPersistencia } from '@core/db/storage';
import { CURRICULO } from '@med/data/curriculo';
export function StudioPage() {
    const navigate = useNavigate();
    const [linhas, setLinhas] = useState([]);
    const [integridade, setIntegridade] = useState([]);
    const [armazenamento, setArmazenamento] = useState(null);
    const [msg, setMsg] = useState(null);
    const [estados, setEstados] = useState({});
    const [backlog, setBacklog] = useState([]);
    useEffect(() => {
        ;
        (async () => {
            const blocos = await db.blocos.toArray();
            setLinhas(blocos
                .map((b) => {
                const c = checar8Etapas(b);
                return {
                    bloco: b,
                    score: c.score,
                    erros: validarSchema(b).filter((p) => p.gravidade === 'erro').length,
                    antiPadroes: c.antiPadroes.length,
                };
            })
                .sort((a, b) => a.score - b.score));
            setIntegridade(checarIntegridade(blocos));
            setArmazenamento(await garantirPersistencia());
            // distribuição por estado de ciclo de vida
            const est = {};
            for (const b of blocos)
                est[b.estado_ciclo_vida] = (est[b.estado_ciclo_vida] ?? 0) + 1;
            setEstados(est);
            // backlog: temas do currículo sem nenhum bloco
            const faltando = [];
            for (const s of CURRICULO) {
                for (const d of s.disciplinas) {
                    for (const t of d.temas) {
                        const n = await db.blocos.where('resumo_id').startsWith(t.prefixo).count();
                        if (n === 0)
                            faltando.push({ sem: s.numero, disc: d.titulo, tema: t.titulo });
                    }
                }
            }
            setBacklog(faltando);
        })();
    }, []);
    const totalBlocos = linhas.length;
    const scoreMedia = totalBlocos ? Math.round(linhas.reduce((s, l) => s + l.score, 0) / totalBlocos) : 0;
    const comErro = linhas.filter((l) => l.erros > 0).length;
    const onImport = (e) => {
        const f = e.target.files?.[0];
        if (!f)
            return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const json = JSON.parse(reader.result);
                const r = await importarProgresso(json);
                setMsg(r.mensagem);
            }
            catch {
                setMsg('Arquivo inválido.');
            }
        };
        reader.readAsText(f);
    };
    return (_jsxs(Pagina, { largura: 1100, children: [_jsx(CabecalhoPagina, { titulo: "ANIMA Studio", subtitulo: "Autoria, governan\u00E7a e sa\u00FAde do organismo." }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }, children: [_jsx(Painel, { valor: totalBlocos, rotulo: "blocos no acervo" }), _jsx(Painel, { valor: `${scoreMedia}%`, rotulo: "score m\u00E9dio 8 etapas", cor: scoreMedia >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }), _jsx(Painel, { valor: comErro, rotulo: "blocos com erro", cor: comErro > 0 ? 'var(--color-danger)' : 'var(--color-success)' }), _jsx(Painel, { valor: integridade.length, rotulo: "problemas de integridade", cor: integridade.length > 0 ? 'var(--color-warning)' : 'var(--color-success)' })] }), _jsx(Secao, { titulo: "Dados & backup", children: _jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("button", { onClick: () => baixarBackup(), style: botao, children: "\u2193 Exportar progresso" }), _jsxs("label", { style: { ...botao, cursor: 'pointer' }, children: ["\u2191 Importar progresso", _jsx("input", { type: "file", accept: "application/json", onChange: onImport, style: { display: 'none' } })] }), armazenamento && (_jsxs("span", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: ["Persist\u00EAncia: ", armazenamento.persistente ? '✓ garantida' : '⚠ não garantida', armazenamento.usoMB != null && ` · ${armazenamento.usoMB} MB usados`] })), msg && _jsx("span", { style: { fontSize: 12, color: 'var(--color-accent)' }, children: msg })] }) }), _jsx(Secao, { titulo: "Ciclo de vida dos blocos", children: _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: ESTADOS_ORDEM.map((e) => (_jsxs("div", { style: {
                            background: 'var(--color-bg-card)',
                            border: `1px solid ${CICLO_COR[e]}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 14px',
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                        }, children: [_jsx("span", { style: { width: 8, height: 8, borderRadius: '50%', background: CICLO_COR[e] } }), _jsx("span", { style: { fontSize: 12, color: 'var(--color-text-secondary)' }, children: e.replace(/_/g, ' ') }), _jsx("span", { style: { fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }, children: estados[e] ?? 0 })] }, e))) }) }), backlog.length > 0 && (_jsx(Secao, { titulo: `Backlog de produção — temas a nascer (${backlog.length})`, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [backlog.slice(0, 30).map((b, i) => (_jsxs("div", { style: { display: 'flex', gap: 10, fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--color-border)' }, children: [_jsxs(Badge, { children: ["sem ", b.sem] }), _jsx("span", { style: { color: 'var(--color-text-muted)', minWidth: 160 }, children: b.disc }), _jsx("span", { style: { color: 'var(--color-text-secondary)' }, children: b.tema })] }, i))), backlog.length > 30 && (_jsxs("p", { style: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }, children: ["+ ", backlog.length - 30, " outros temas"] }))] }) })), integridade.length > 0 && (_jsx(Secao, { titulo: `Integridade referencial (${integridade.length})`, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: integridade.slice(0, 20).map((p, i) => (_jsxs("div", { style: { fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 8 }, children: [_jsx(Badge, { cor: "var(--color-warning)", children: p.tipo.replace(/_/g, ' ') }), _jsx("code", { style: { color: 'var(--color-text-muted)' }, children: p.resumo_id }), _jsx("span", { children: "\u2192" }), _jsx("code", { style: { color: 'var(--color-danger)' }, children: p.alvo })] }, i))) }) })), _jsx(Secao, { titulo: "Invent\u00E1rio de blocos (piores scores primeiro)", children: _jsx("div", { style: { border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }, children: linhas.map((l) => (_jsxs("button", { onClick: () => navigate(`/bloco/${l.bloco.resumo_id}`), style: {
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            textAlign: 'left',
                        }, children: [_jsxs("span", { style: { width: 44, fontSize: 13, fontWeight: 700, color: corScore(l.score) }, children: [l.score, "%"] }), _jsx("span", { style: { flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }, children: l.bloco.metadata.titulo }), l.erros > 0 && _jsxs(Badge, { cor: "var(--color-danger)", children: [l.erros, " erro"] }), l.antiPadroes > 0 && _jsxs(Badge, { cor: "var(--color-warning)", children: [l.antiPadroes, " anti-padr\u00E3o"] }), _jsx(Badge, { children: l.bloco.estado_ciclo_vida })] }, l.bloco.resumo_id))) }) })] }));
}
const ESTADOS_ORDEM = [
    'rascunho',
    'revisado_pelo_autor',
    'validado_cross_fonte',
    'em_uso_clinico',
    'em_revisao',
    'obsoleto',
];
const CICLO_COR = {
    rascunho: 'var(--color-text-muted)',
    revisado_pelo_autor: 'var(--color-warning)',
    validado_cross_fonte: 'var(--color-info)',
    em_uso_clinico: 'var(--color-success)',
    em_revisao: 'var(--color-disc-bioquimica)',
    obsoleto: 'var(--color-danger)',
};
function corScore(s) {
    if (s >= 90)
        return 'var(--color-success)';
    if (s >= 70)
        return 'var(--color-warning)';
    return 'var(--color-danger)';
}
function Painel({ valor, rotulo, cor }) {
    return (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }, children: [_jsx("p", { style: { margin: 0, fontSize: 24, fontWeight: 700, color: cor ?? 'var(--color-accent)' }, children: valor }), _jsx("p", { style: { margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }, children: rotulo })] }));
}
function Secao({ titulo, children }) {
    return (_jsxs("section", { style: { marginBottom: 32 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }, children: titulo }), children] }));
}
const botao = {
    padding: '9px 16px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
};
