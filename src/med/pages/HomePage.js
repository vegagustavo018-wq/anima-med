import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pagina, FalaAnima, Cartao, Grade } from '@core/components/ui/primitivos';
import { calcularEstado } from '@core/anima/estado';
import { resumoPendencias } from '@core/anima/fila';
import { saudacao } from '@core/anima/voz';
import { lerBemEstar } from '@core/anima/bemestar';
import { useUIStore } from '@core/store/uiStore';
import { db } from '@core/db/database';
import { useCheckInStore } from '@core/store/checkinStore';
import { CheckInRapido } from '@med/components/bemestar/CheckInRapido';
import { RitualAbertura } from '@med/components/produtividade/RitualAbertura';
import { useProvasStore, diasAte } from '@core/store/provasStore';
import { useSessaoConfigStore } from '@core/store/sessaoConfigStore';
export function HomePage() {
    const navigate = useNavigate();
    const { ultimoBloco } = useUIStore();
    // Reativo: recalcula sozinho quando blocos/progresso mudam (revisão, ingestão)
    const estado = useLiveQuery(() => calcularEstado(), []) ?? null;
    const pendencias = useLiveQuery(() => resumoPendencias(), []);
    const fala = useMemo(() => estado
        ? saudacao({
            diasDesdeUltima: estado.diasDesdeUltima,
            cardsVencidos: estado.cardsVencidos,
            totalBlocos: estado.totalBlocos,
        })
        : '', [estado]);
    const [tituloUltimo, setTituloUltimo] = useState(null);
    const [bemEstar, setBemEstar] = useState(null);
    const [checkInFeito, setCheckInFeito] = useState(false);
    const [checkInAberto, setCheckInAberto] = useState(false);
    const { carregarUltimo } = useCheckInStore();
    const { carregar: carregarProvas, proxima } = useProvasStore();
    const { aplicarPreset } = useSessaoConfigStore();
    useEffect(() => {
        carregarProvas();
    }, [carregarProvas]);
    useEffect(() => {
        carregarUltimo().then(() => {
            const u = useCheckInStore.getState().ultimo;
            if (u) {
                const hoje = new Date().toISOString().slice(0, 10);
                setCheckInFeito(u.criado_em.slice(0, 10) === hoje);
            }
        });
    }, [carregarUltimo]);
    useEffect(() => {
        if (ultimoBloco) {
            db.blocos.get(ultimoBloco).then((b) => setTituloUltimo(b?.metadata.titulo ?? null));
        }
    }, [ultimoBloco]);
    useEffect(() => {
        lerBemEstar().then(setBemEstar);
    }, []);
    return (_jsxs(Pagina, { largura: 900, children: [_jsx("div", { style: { paddingTop: 24, marginBottom: 20 }, children: fala && _jsx(FalaAnima, { texto: fala, grande: true }) }), _jsx(RitualAbertura, {}), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }, children: [[
                        { label: 'Pré-Plantão', preset: 'plantao', rota: '/estudar' },
                        { label: 'Tema Novo', preset: 'exploracao', rota: '/explorar' },
                        { label: 'Véspera de Prova', preset: 'prova', rota: '/estudar' },
                    ].map((r) => (_jsx("button", { onClick: async () => {
                            await aplicarPreset(r.preset);
                            navigate(r.rota);
                        }, style: {
                            padding: '7px 14px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 99,
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-secondary)',
                            fontSize: 12,
                            cursor: 'pointer',
                        }, children: r.label }, r.label))), (() => {
                        const p = proxima();
                        if (!p)
                            return null;
                        const dias = diasAte(p.data);
                        return (_jsxs("button", { onClick: () => navigate('/provas'), style: {
                                padding: '7px 14px',
                                border: '1px solid var(--color-warning)',
                                borderRadius: 99,
                                background: 'transparent',
                                color: 'var(--color-warning)',
                                fontSize: 12,
                                cursor: 'pointer',
                            }, children: [p.titulo, " em ", dias, "d"] }));
                    })()] }), bemEstar?.sobrecarga && (_jsxs("div", { style: {
                    marginBottom: 20,
                    padding: '14px 18px',
                    background: 'rgba(246,173,85,0.08)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                }, children: [_jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }, children: bemEstar.motivo }), _jsx("button", { onClick: () => navigate('/respirar'), style: { padding: '6px 12px', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }, children: "Respirar um pouco" })] })), !checkInFeito && (_jsx("div", { style: { marginBottom: 20 }, children: checkInAberto ? (_jsx("div", { style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }, children: _jsx(CheckInRapido, { compacto: true, onFeito: () => {
                            setCheckInFeito(true);
                            setCheckInAberto(false);
                        } }) })) : (_jsx("button", { onClick: () => setCheckInAberto(true), style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }, children: "Check-in r\u00E1pido de energia" })) })), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }, children: [estado && estado.cardsVencidos > 0 && (_jsx(Cartao, { onClick: () => navigate('/estudar'), cor: "var(--color-accent)", children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: "Revisar agora" }), _jsxs("p", { style: { margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }, children: [estado.cardsVencidos, " ", estado.cardsVencidos === 1 ? 'bloco vencido' : 'blocos vencidos', " \u2014 eu conduzo"] })] }), _jsx("span", { style: { fontSize: 22, color: 'var(--color-accent)' }, children: "\u2B21" })] }) })), pendencias && pendencias.questoes > 0 && (_jsx(Cartao, { onClick: () => navigate('/questoes'), cor: "var(--color-warning)", children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: "Quest\u00F5es pedindo revis\u00E3o" }), _jsxs("p", { style: { margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }, children: [pendencias.questoes, " ", pendencias.questoes === 1 ? 'questão venceu' : 'questões venceram', " \u2014 reencontre o que j\u00E1 foi seu"] })] }), _jsx("span", { style: { fontSize: 22, color: 'var(--color-warning)' }, children: "\u270E" })] }) })), ultimoBloco && tituloUltimo && (_jsx(Cartao, { onClick: () => navigate(`/bloco/${ultimoBloco}`), children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }, children: "Continuar" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: tituloUltimo })] }), _jsx("span", { style: { fontSize: 20, color: 'var(--color-text-secondary)' }, children: "\u2192" })] }) })), _jsx(Cartao, { onClick: () => navigate('/explorar'), children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }, children: "Explorar o curr\u00EDculo" }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }, children: "Percorrer os semestres, disciplinas e temas" })] }), _jsx("span", { style: { fontSize: 20, color: 'var(--color-text-secondary)' }, children: "\u25CE" })] }) })] }), estado && (_jsxs("div", { children: [_jsx("p", { style: {
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-muted)',
                            marginBottom: 12,
                        }, children: "O organismo hoje" }), _jsxs(Grade, { min: 160, children: [_jsx(Metrica, { valor: estado.totalBlocos, rotulo: "blocos existentes" }), _jsx(Metrica, { valor: estado.blocosIniciados, rotulo: "iniciados" }), _jsx(Metrica, { valor: estado.blocosDominados, rotulo: "em dom\u00EDnio" }), _jsx(Metrica, { valor: `${estado.percentualDominio}%`, rotulo: "do que existe" })] })] }))] }));
}
function Metrica({ valor, rotulo }) {
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
        }, children: [_jsx("p", { style: { margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--color-accent)' }, children: valor }), _jsx("p", { style: { margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }, children: rotulo })] }));
}
