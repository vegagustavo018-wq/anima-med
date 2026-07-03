import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlocoStore } from '@core/store/blocoStore';
import { useProgressoStore } from '@core/store/progressoStore';
import { useUIStore } from '@core/store/uiStore';
import { NarrativaRenderer } from '@med/components/block/NarrativaRenderer';
import { CurvaEsquecimento } from '@med/components/block/CurvaEsquecimento';
import { ModoPalpite } from '@med/components/block/ModoPalpite';
import { FlashcardsAba, CasosAba, ConexoesAba } from '@med/components/block/Abas';
import { ImagensAba } from '@med/components/block/ImagemBloco';
import { FalaAnima, Badge } from '@core/components/ui/primitivos';
import { conclusaoBloco } from '@core/anima/voz';
import { tocar } from '@core/anima/som';
import { ehLeech } from '@core/srs/sm2';
import { SelecaoDestaque } from '@med/components/autoria/SelecaoDestaque';
import { RapidReview } from '@med/components/block/RapidReview';
import { VozDoOrganismo } from '@med/components/block/VozDoOrganismo';
import { ZoomProfundidade } from '@med/components/block/ZoomProfundidade';
import { VINHETAS_SEED } from '@core/anima/vinhetasSeed';
import { ModoEnsinar } from '@med/components/ia/ModoEnsinar';
const COR_DESTAQUE_HEX = {
    amarelo: '#f6e05e',
    vermelho: '#fc8181',
    roxo: '#b794f4',
    verde: '#68d391',
};
// Internato — a "pele" de cada formato de bloco (rótulo, ícone, cor, nota do que virá)
const FORMATO_INTERNATO = {
    caso_paradigmatico: { rotulo: 'Caso paradigmático', icone: '❖', cor: 'var(--color-accent)', nota: 'Vai virar uma vinheta clínica ramificada — decisão sob o relógio.' },
    integrador: { rotulo: 'Caso integrador', icone: '⧉', cor: 'var(--color-info)', nota: 'Cruza ≥2 problemas concorrentes — priorização explícita.' },
    competencia_epa: { rotulo: 'Competência (EPA)', icone: '↥', cor: 'var(--color-disc-histologia)', nota: 'Escada de confiabilidade: onde você se sente vs. o que os registros mostram.' },
    procedimento: { rotulo: 'Procedimento', icone: '✚', cor: 'var(--color-success)', nota: 'Guia passo a passo + logbook com micro-reflexão a cada registro.' },
    reflexao: { rotulo: 'Reflexão guiada', icone: '❧', cor: 'var(--color-accent-dim)', nota: 'Ciclo de Gibbs, ancorado num evento vivido.' },
    analise_erro: { rotulo: 'Análise de erro', icone: '⚠', cor: 'var(--color-warning)', nota: 'Sala de M&M — erro sem culpa, foco no sistema.' },
    avaliacao: { rotulo: 'Como você será avaliado', icone: '◉', cor: 'var(--color-text-secondary)', nota: 'mini-CEX, DOPS, MSF/360, portfólio, prova de saída.' },
    visao_geral: { rotulo: 'Visão geral do estágio', icone: '☉', cor: 'var(--color-accent)', nota: 'Objetivos e o que se espera de você na rotação.' },
};
export function BlocoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { blocoAtual, carregando, carregarBloco } = useBlocoStore();
    const { carregar, registrarLeitura, registrarPalpite, toggleMarcado, cache, desfazerUltimaRevisao, reformularParaLeech, adicionarDestaque, } = useProgressoStore();
    const { setUltimo, toggleFoco, modoFoco } = useUIStore();
    const [revelado, setRevelado] = useState(false);
    const [aba, setAba] = useState(null);
    const [itemAtivoFala, setItemAtivoFala] = useState(null);
    const [nivelZoom, setNivelZoom] = useState(2);
    useEffect(() => {
        if (!id)
            return;
        setRevelado(false);
        setAba(null);
        carregarBloco(id);
        carregar(id);
        setUltimo(id, `/bloco/${id}`);
        window.scrollTo(0, 0);
    }, [id, carregarBloco, carregar, setUltimo]);
    if (carregando || !blocoAtual) {
        return (_jsx("div", { style: { padding: 48, color: 'var(--color-text-muted)', fontSize: 14 }, children: carregando ? 'Carregando...' : id ? `Bloco não encontrado: ${id}` : '' }));
    }
    const b = blocoAtual;
    // Bloco-esqueleto: existe no mapa do currículo mas ainda sem conteúdo escrito
    const emProducao = b.metadata.status === 'esqueleto' ||
        (b.narrativa.length === 0 && b.flashcards.length === 0 && b.casos_clinicos.length === 0);
    // Palpite explícito, ou derivado do subtítulo-pergunta (a maioria dos blocos já tem)
    const palpite = b.palpite ??
        (b.metadata.subtitulo?.trim().endsWith('?')
            ? { pergunta: b.metadata.subtitulo.trim() }
            : undefined);
    const temPalpite = !!palpite && !revelado;
    const progresso = id ? cache[id] : undefined;
    const marcado = progresso?.marcado_para_revisao ?? false;
    const revelar = (resposta) => {
        if (id) {
            if (resposta.trim())
                registrarPalpite(id, resposta);
            // esqueleto (em produção) não vira leitura real: não infla métricas nem agenda SRS
            if (!emProducao)
                registrarLeitura(id);
        }
        tocar('revelar');
        setRevelado(true);
    };
    // Se não há palpite, considera revelado ao entrar
    const mostrarNarrativa = revelado || !palpite;
    const abas = [
        { id: 'flashcards', label: 'Flashcards', n: b.flashcards.length },
        { id: 'casos', label: 'Casos', n: b.casos_clinicos.length + VINHETAS_SEED.filter((v) => v.bloco_id === b.resumo_id).length },
        {
            id: 'conexoes',
            label: 'Conexões',
            n: b.conexoes.prerequisitos.length + b.conexoes.futuras.length + b.conexoes.laterais.length,
        },
        { id: 'imagens', label: 'Imagens & Resumos', n: b.narrativa.filter((n) => n.tipo === 'imagem').length },
        { id: 'ensinar', label: 'Ensinar', n: 1 },
    ].filter((a) => a.n > 0);
    return (_jsxs("article", { style: { padding: modoFoco ? '32px 24px' : '32px 48px', maxWidth: 860, margin: '0 auto' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }, children: [_jsx("button", { onClick: () => navigate(-1), style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 13, padding: 0 }, children: "\u2190 Voltar" }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx(IconBtn, { ativo: marcado, onClick: () => id && toggleMarcado(id), title: "Marcar para revis\u00E3o", children: marcado ? '★' : '☆' }), _jsx(IconBtn, { ativo: modoFoco, onClick: toggleFoco, title: "Modo foco", children: "\u25C7" })] })] }), _jsxs("header", { style: { marginBottom: 32 }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Badge, { cor: "var(--color-accent)", children: b.metadata.disciplina }), b.metadata.nivel && _jsx(Badge, { cor: "var(--color-accent-dim)", children: b.metadata.nivel }), _jsx("span", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: b.resumo_id })] }), _jsx("h1", { style: { margin: '0 0 8px', fontSize: 30, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }, children: b.metadata.titulo }), b.metadata.subtitulo && (_jsx("p", { style: { margin: '0 0 12px', fontSize: 14, color: 'var(--color-accent-dim)', fontStyle: 'italic' }, children: b.metadata.subtitulo })), _jsx("p", { style: { margin: 0, fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }, children: b.resumo_conciso })] }), temPalpite && palpite && (_jsx(ModoPalpite, { pergunta: palpite.pergunta, dica: palpite.dica, onRevelar: revelar })), progresso && ehLeech(progresso.srs) && (_jsxs("div", { style: {
                    marginBottom: 28,
                    padding: '14px 18px',
                    background: 'rgba(252,129,129,0.08)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                }, children: [_jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }, children: ["Este bloco resistiu ", progresso.srs.lapsos, "\u00D7 ao SRS. Talvez a explica\u00E7\u00E3o, n\u00E3o voc\u00EA, precise mudar."] }), _jsx("button", { onClick: () => id && reformularParaLeech(id), style: { padding: '6px 12px', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }, children: "Marcar para reformular" })] })), mostrarNarrativa && emProducao && (() => {
                const fmt = b.metadata.formato_internato;
                const pele = fmt ? FORMATO_INTERNATO[fmt] : null;
                return (_jsxs("div", { style: {
                        padding: '32px 28px',
                        background: 'var(--color-bg-card)',
                        border: `1px dashed ${pele ? pele.cor : 'var(--color-border-accent)'}`,
                        borderRadius: 'var(--radius-xl)',
                        textAlign: 'center',
                    }, children: [_jsx("div", { style: { fontSize: 36, marginBottom: 12, color: pele ? pele.cor : 'var(--color-accent-dim)' }, children: pele ? pele.icone : '◌' }), pele && (_jsxs("p", { style: { margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: pele.cor }, children: [pele.rotulo, b.metadata.epa_codigo ? ` · ${b.metadata.epa_codigo}` : ''] })), _jsx("p", { style: { margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: "Este bloco ainda est\u00E1 em produ\u00E7\u00E3o" }), _jsx("p", { style: { margin: '0 auto', maxWidth: 460, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: b.resumo_conciso || 'O tema já faz parte do mapa do currículo, mas o conteúdo aprofundado ainda vai ser escrito.' }), pele && (_jsx("p", { style: { margin: '14px auto 0', maxWidth: 460, fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: pele.nota }))] }));
            })(), mostrarNarrativa && !emProducao && (_jsxs(_Fragment, { children: [_jsx(RapidReview, { bloco: b }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }, children: [_jsx(VozDoOrganismo, { bloco: b, onItemAtivo: setItemAtivoFala }), _jsx(ZoomProfundidade, { nivel: nivelZoom, onMudar: setNivelZoom })] }), _jsxs("section", { style: { marginBottom: 24 }, children: [_jsx(SelecaoDestaque, { onDestacar: (trecho, cor) => id && adicionarDestaque(id, trecho, cor), children: _jsx(NarrativaRenderer, { items: b.narrativa, itemAtivoIndex: itemAtivoFala, nivelZoom: nivelZoom }) }), _jsx("p", { style: { margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }, children: "Selecione um trecho para destacar por que ele importa" })] }), progresso && progresso.destaques.length > 0 && (_jsxs("section", { style: { marginBottom: 40 }, children: [_jsx("p", { style: { margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }, children: "Seus destaques" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 6 }, children: progresso.destaques.map((d, i) => (_jsx("p", { style: {
                                        margin: 0,
                                        fontSize: 13,
                                        color: 'var(--color-text-secondary)',
                                        borderLeft: `3px solid ${COR_DESTAQUE_HEX[d.cor]}`,
                                        paddingLeft: 10,
                                        lineHeight: 1.5,
                                    }, children: d.trecho }, i))) })] })), _jsx("div", { style: { marginBottom: 24 }, children: _jsx(FalaAnima, { texto: conclusaoBloco(b.metadata.titulo, b.conexoes.futuras.length > 0) }) }), !emProducao && id && (_jsx("div", { style: { marginBottom: 40 }, children: _jsx(CurvaEsquecimento, { resumoId: id }) })), abas.length > 0 && (_jsxs("section", { children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--color-border)' }, children: abas.map((a) => (_jsxs("button", { onClick: () => setAba(aba === a.id ? null : a.id), style: {
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: aba === a.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                                        color: aba === a.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                        padding: '8px 4px',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: aba === a.id ? 600 : 400,
                                    }, children: [a.label, " ", a.id !== 'ensinar' && _jsx("span", { style: { fontSize: 11, opacity: 0.6 }, children: a.n })] }, a.id))) }), aba === 'flashcards' && id && _jsx(FlashcardsAba, { cards: b.flashcards, resumo_id: id }), aba === 'casos' && _jsx(CasosAba, { casos: b.casos_clinicos, resumo_id: b.resumo_id }), aba === 'conexoes' && _jsx(ConexoesAba, { bloco: b }), aba === 'imagens' && _jsx(ImagensAba, { narrativa: b.narrativa }), aba === 'ensinar' && id && _jsx(ModoEnsinar, { resumo_id: id, titulo: b.metadata.titulo, progresso: progresso }), !aba && (_jsx("p", { style: { fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Escolha uma aba para aprofundar \u2014 ou siga para o pr\u00F3ximo bloco." }))] })), progresso && progresso.historico_revisoes.length > 0 && (_jsxs("section", { style: { marginTop: 40 }, children: [_jsx("p", { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10 }, children: "Linha do tempo" }), _jsxs("div", { style: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }, children: [progresso.historico_revisoes.slice(-12).map((h, i, arr) => (_jsx("div", { title: `${new Date(h.data).toLocaleDateString('pt-BR')} · qualidade ${h.qualidade}`, style: {
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: h.qualidade >= 3 ? 'var(--color-success)' : 'var(--color-danger)',
                                            opacity: i === arr.length - 1 ? 1 : 0.5,
                                        } }, i))), _jsx("button", { onClick: () => id && desfazerUltimaRevisao(id), style: { marginLeft: 8, fontSize: 11, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }, children: "desfazer \u00FAltima" })] })] })), _jsxs("footer", { style: { borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Badge, { children: b.estado_ciclo_vida }), _jsx(Badge, { children: b.procedencia.nivel_confianca }), _jsx(Badge, { children: b.horizonte_validade }), _jsxs("span", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: [b.procedencia.gerado_por, " \u00B7 ", b.procedencia.data_geracao] })] })] }))] }));
}
function IconBtn({ children, onClick, title, ativo }) {
    return (_jsx("button", { onClick: onClick, title: title, style: {
            width: 34,
            height: 34,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: ativo ? 'var(--color-accent-glow)' : 'transparent',
            color: ativo ? 'var(--color-accent)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: 15,
        }, children: children }));
}
