import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pagina, CabecalhoPagina, Cartao, Grade, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos';
import { Botao } from '@core/components/ui/controles';
import { useQuestoesStore } from '@core/store/questoesStore';
import { ehMCQ } from '@core/types/questoes';
import { MCQPlayer } from '@med/components/questoes/MCQPlayer';
import { FlashcardPlayer } from '@med/components/questoes/FlashcardPlayer';
import { Cronometro } from '@med/components/questoes/Cronometro';
import { OclusaoDemo } from '@med/components/questoes/OclusaoDemo';
import { tocar } from '@core/anima/som';
import { anunciar } from '@core/store/anuncioStore';
const SEG_POR_QUESTAO = 90; // Modo Exame: ~1min30 por questão (ritmo Revalida)
export function QuestoesPage() {
    const store = useQuestoesStore();
    const [stats, setStats] = useState(null);
    const [especialidade, setEspecialidade] = useState('');
    const [quantidade, setQuantidade] = useState(10);
    const [fase, setFase] = useState('hub');
    const [oclusao, setOclusao] = useState(false);
    const [modo, setModo] = useState('treino');
    const [itens, setItens] = useState([]);
    const [indice, setIndice] = useState(0);
    const [escolhas, setEscolhas] = useState({});
    const [revelado, setRevelado] = useState(false);
    const [acertos, setAcertos] = useState(0);
    const [inicioItem, setInicioItem] = useState(0);
    const finalizandoRef = useRef(false); // trava de idempotência do Modo Exame
    const recarregarStats = () => store.estatisticas().then(setStats);
    useEffect(() => {
        store.carregarProgresso().then(recarregarStats);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const especialidades = useMemo(() => (stats?.porEspecialidade ?? []).filter((e) => e.total >= 3), [stats]);
    async function iniciar(m) {
        const esp = especialidade || undefined;
        let lista = [];
        if (m === 'revisao') {
            lista = await store.montarRevisao(quantidade);
        }
        else if (m === 'flashcards') {
            lista = await store.montarSessao({ tipo: 'flashcard', especialidade: esp, quantidade });
        }
        else {
            lista = await store.montarSessao({ tipo: 'mcq', especialidade: esp, quantidade });
        }
        if (lista.length === 0) {
            anunciar('Nada para essa seleção agora.', { tipo: 'info' });
            return;
        }
        finalizandoRef.current = false;
        setModo(m);
        setItens(lista);
        setIndice(0);
        setEscolhas({});
        setRevelado(false);
        setAcertos(0);
        setInicioItem(Date.now());
        setFase('jogando');
        tocar('transicao');
    }
    const atual = itens[indice];
    async function escolherMCQ(q, id) {
        setEscolhas((e) => ({ ...e, [q.id]: id }));
        if (modo === 'exame') {
            tocar('toque');
            return; // feedback só no fim
        }
        const ms = Date.now() - inicioItem;
        const r = await store.responderMCQ(q, id, modo === 'revisao' ? 'revisao' : 'treino', ms);
        tocar(r.acertou ? 'acerto' : 'erro');
        if (r.acertou)
            setAcertos((a) => a + 1);
        setRevelado(true);
    }
    async function avaliarFlash(q, nota) {
        await store.avaliarFlashcard(q, nota, 'treino');
        if (nota >= 3)
            setAcertos((a) => a + 1);
        avancar();
    }
    function avancar() {
        if (indice + 1 >= itens.length) {
            finalizar();
            return;
        }
        setIndice((i) => i + 1);
        setRevelado(false);
        setInicioItem(Date.now());
    }
    async function finalizar() {
        // trava de idempotência: o Modo Exame tem dois gatilhos (botão Finalizar e
        // Cronometro aoZerar) que poderiam correr juntos e persistir/pontuar 2×,
        // corrompendo o SRS. A fase muda ANTES do loop para desmontar o Cronometro.
        if (finalizandoRef.current)
            return;
        finalizandoRef.current = true;
        const eraExame = modo === 'exame';
        setFase('relatorio');
        if (eraExame) {
            let ok = 0;
            for (const it of itens) {
                if (!ehMCQ(it))
                    continue;
                const esc = escolhas[it.id];
                if (esc == null || esc === '')
                    continue; // não vista → não penaliza o SRS
                const r = await store.responderMCQ(it, esc, 'exame');
                if (r.acertou)
                    ok++;
            }
            setAcertos(ok);
        }
        await recarregarStats();
        tocar('sucesso');
    }
    function voltarHub() {
        setFase('hub');
        recarregarStats();
    }
    // ── Oclusão de imagem (demo autocontido) ────────────────────────────────────
    if (oclusao) {
        return (_jsx(Pagina, { largura: 640, children: _jsx(OclusaoDemo, { onSair: () => setOclusao(false) }) }));
    }
    // ── HUB ────────────────────────────────────────────────────────────────────
    if (fase === 'hub') {
        if (!stats) {
            return (_jsx(Pagina, { largura: 860, children: _jsx(CabecalhoPagina, { titulo: "Quest\u00F5es", subtitulo: "Carregando banco\u2026" }) }));
        }
        if (stats.totalMCQ === 0 && stats.totalFlashcards === 0) {
            return (_jsxs(Pagina, { largura: 860, children: [_jsx(CabecalhoPagina, { titulo: "Quest\u00F5es" }), _jsxs(EstadoVazio, { children: [_jsx("div", { style: { fontSize: 40, marginBottom: 14 }, children: "\u270E" }), _jsx(FalaAnima, { texto: "Ainda n\u00E3o tenho as quest\u00F5es comigo. Abra o app uma vez com internet que eu trago o banco inteiro pra voc\u00EA \u2014 e a\u00ED a gente treina." })] })] }));
        }
        // acerto = acertos / TENTATIVAS (não / questões distintas) — senão passa de 100%
        const pct = stats.tentativasTotais ? Math.round((stats.acertos / stats.tentativasTotais) * 100) : 0;
        return (_jsxs(Pagina, { largura: 860, children: [_jsx(CabecalhoPagina, { titulo: "Quest\u00F5es", subtitulo: `${stats.totalMCQ} questões de múltipla escolha + ${stats.totalFlashcards} flashcards · fonte: Revalida Clinical` }), _jsx("div", { style: { marginBottom: 24 }, children: _jsx(FalaAnima, { texto: "Aqui a gente testa o que j\u00E1 virou seu. Errar aqui \u00E9 barato \u2014 errar na prova, n\u00E3o. Vamos?" }) }), _jsxs(Grade, { min: 130, children: [_jsx(Metrica, { valor: stats.totalMCQ, rotulo: "MCQ no banco" }), _jsx(Metrica, { valor: stats.respondidas, rotulo: "respondidas" }), _jsx(Metrica, { valor: `${pct}%`, rotulo: "acerto", cor: "var(--color-success)" }), _jsx(Metrica, { valor: stats.vencidas, rotulo: "a revisar", cor: stats.vencidas ? 'var(--color-warning)' : undefined })] }), _jsxs("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', margin: '24px 0 16px' }, children: [_jsx("label", { htmlFor: "q-area", style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: "\u00C1rea:" }), _jsxs("select", { id: "q-area", value: especialidade, onChange: (e) => setEspecialidade(e.target.value), style: { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13, padding: '7px 10px' }, children: [_jsx("option", { value: "", children: "Todas as \u00E1reas" }), especialidades.map((e) => (_jsxs("option", { value: e.especialidade, children: [e.especialidade, " (", e.total, ")"] }, e.especialidade)))] }), _jsx("span", { id: "q-qtd-label", style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: "Quantidade:" }), _jsx("div", { role: "radiogroup", "aria-labelledby": "q-qtd-label", style: { display: 'flex', gap: 8 }, children: [10, 20, 30].map((n) => (_jsx("button", { role: "radio", "aria-checked": quantidade === n, onClick: () => setQuantidade(n), style: {
                                    padding: '6px 12px',
                                    borderRadius: 99,
                                    border: `1px solid ${quantidade === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    background: quantidade === n ? 'var(--color-accent-glow)' : 'transparent',
                                    color: quantidade === n ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }, children: n }, n))) })] }), _jsxs(Grade, { min: 240, children: [_jsx(Cartao, { onClick: () => iniciar('treino'), cor: "var(--color-accent)", children: _jsx(AcaoCartao, { icone: "\u2B21", titulo: "Treino livre", desc: "MCQ com feedback e coment\u00E1rio imediato a cada quest\u00E3o." }) }), _jsx(Cartao, { onClick: () => iniciar('exame'), cor: "var(--color-danger)", children: _jsx(AcaoCartao, { icone: "\u23F1", titulo: "Modo Exame", desc: `${quantidade} questões cronometradas (${Math.round((quantidade * SEG_POR_QUESTAO) / 60)} min), correção no fim.` }) }), _jsx(Cartao, { onClick: () => iniciar('flashcards'), cor: "var(--color-success)", children: _jsx(AcaoCartao, { icone: "\uD83C\uDCA0", titulo: "Flashcards", desc: "Recorda\u00E7\u00E3o ativa com autoavalia\u00E7\u00E3o (SRS)." }) }), _jsx(Cartao, { onClick: () => (stats.vencidas ? iniciar('revisao') : null), cor: "var(--color-warning)", children: _jsx(AcaoCartao, { icone: "\u21BB", titulo: "Revisar vencidas", desc: stats.vencidas ? `${stats.vencidas} questões pedindo revisão.` : 'Nada vencido — em dia.' }) }), _jsx(Cartao, { onClick: () => setOclusao(true), cor: "var(--color-accent-dim)", children: _jsx(AcaoCartao, { icone: "\u25EB", titulo: "Oclus\u00E3o de imagem", desc: "Recordar estruturas por regi\u00E3o oculta (demo: neur\u00F4nio)." }) })] })] }));
    }
    // ── RELATÓRIO ───────────────────────────────────────────────────────────────
    if (fase === 'relatorio') {
        const total = modo === 'exame' ? itens.filter(ehMCQ).length : itens.length;
        const pct = total ? Math.round((acertos / total) * 100) : 0;
        return (_jsxs(Pagina, { largura: 760, children: [_jsx(CabecalhoPagina, { titulo: modo === 'exame' ? 'Resultado do exame' : 'Sessão concluída' }), _jsxs("div", { style: { textAlign: 'center', padding: '24px 0 12px' }, children: [_jsxs("div", { style: { fontSize: 52, fontWeight: 800, color: pct >= 70 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }, children: [pct, "%"] }), _jsxs("p", { style: { fontSize: 14, color: 'var(--color-text-secondary)' }, children: [acertos, " de ", total, " corretas"] })] }), modo === 'exame' && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }, children: itens.filter(ehMCQ).map((q, i) => {
                        const esc = escolhas[q.id] ?? '';
                        const ok = esc === q.correta;
                        return (_jsxs("div", { style: { padding: '10px 14px', border: `1px solid ${ok ? 'var(--color-success)' : 'var(--color-danger)'}`, borderLeft: `3px solid ${ok ? 'var(--color-success)' : 'var(--color-danger)'}`, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-card)' }, children: [_jsxs("p", { style: { margin: 0, fontSize: 12.5, color: 'var(--color-text-primary)' }, children: [_jsxs("strong", { children: [ok ? '✓' : '✕', " ", i + 1, "."] }), " ", q.tema] }), !ok && (_jsxs("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }, children: ["Correta: ", q.alternativas.find((a) => a.id === q.correta)?.texto] }))] }, q.id));
                    }) })), _jsxs("div", { style: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }, children: [_jsx(Botao, { onClick: voltarHub, variante: "primario", children: "Voltar" }), modo === 'exame' && (_jsx(Botao, { onClick: () => iniciar('revisao'), variante: "secundario", children: "Revisar erradas" }))] })] }));
    }
    // ── JOGANDO ─────────────────────────────────────────────────────────────────
    const tempoTotal = quantidade * SEG_POR_QUESTAO;
    return (_jsxs(Pagina, { largura: 720, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, children: [_jsx("button", { onClick: voltarHub, style: { border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }, children: "\u2190 Sair" }), modo === 'exame' && _jsx(Cronometro, { segundos: tempoTotal, aoZerar: finalizar }), _jsx("div", { style: { flex: modo === 'exame' ? 0 : 1 } })] }), atual && ehMCQ(atual) ? (_jsxs(_Fragment, { children: [_jsx(MCQPlayer, { questao: atual, escolhida: escolhas[atual.id] ?? null, revelar: modo !== 'exame' && revelado, aoEscolher: (id) => escolherMCQ(atual, id), numero: indice + 1, total: itens.length }), _jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 22 }, children: modo === 'exame' ? (_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [indice > 0 && (_jsx(Botao, { variante: "fantasma", onClick: () => { setIndice((i) => i - 1); }, children: "Anterior" })), _jsx(Botao, { variante: "primario", onClick: () => (indice + 1 >= itens.length ? finalizar() : setIndice((i) => i + 1)), children: indice + 1 >= itens.length ? 'Finalizar' : 'Próxima' })] })) : (revelado && (_jsx(Botao, { variante: "primario", onClick: avancar, children: indice + 1 >= itens.length ? 'Concluir' : 'Próxima' }))) })] })) : atual ? (_jsx(FlashcardPlayer, { card: atual, aoAvaliar: (nota) => avaliarFlash(atual.id, nota), numero: indice + 1, total: itens.length })) : null] }));
}
function Metrica({ valor, rotulo, cor }) {
    return (_jsxs("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }, children: [_jsx("div", { style: { fontSize: 26, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }, children: valor }), _jsx("div", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: rotulo })] }));
}
function AcaoCartao({ icone, titulo, desc }) {
    return (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 24, marginBottom: 8 }, "aria-hidden": "true", children: icone }), _jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }, children: titulo }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.45 }, children: desc })] }));
}
