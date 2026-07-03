import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarEvento } from '@core/db/database';
/** Vinheta ramificada — raciocínio clínico com decisões reais (bloco 5). */
export function VinhetaClinicaPlayer({ vinheta }) {
    const navigate = useNavigate();
    const [noAtualId, setNoAtualId] = useState(vinheta.no_inicial_id);
    const [feedbackAtivo, setFeedbackAtivo] = useState(null);
    const [trilha, setTrilha] = useState([vinheta.no_inicial_id]);
    const no = vinheta.nos.find((n) => n.no_id === noAtualId);
    if (!no)
        return null;
    const escolher = (opcao) => {
        setFeedbackAtivo(opcao);
    };
    const avancar = () => {
        if (!feedbackAtivo)
            return;
        const proximo = feedbackAtivo.proximo_no_id;
        setNoAtualId(proximo);
        setTrilha((t) => [...t, proximo]);
        setFeedbackAtivo(null);
        const proximoNo = vinheta.nos.find((n) => n.no_id === proximo);
        if (proximoNo?.tipo === 'desfecho') {
            registrarEvento('vinheta_concluida', { vinheta_id: vinheta.vinheta_id, desfecho_bom: proximoNo.desfecho_bom, trilha });
        }
    };
    const reiniciar = () => {
        setNoAtualId(vinheta.no_inicial_id);
        setTrilha([vinheta.no_inicial_id]);
        setFeedbackAtivo(null);
    };
    return (_jsxs("div", { style: { maxWidth: 680 }, children: [_jsxs("div", { style: { display: 'flex', gap: 4, marginBottom: 20 }, children: [trilha.map((_, i) => (_jsx("div", { style: { height: 3, flex: 1, borderRadius: 2, background: 'var(--color-accent)' } }, i))), Array.from({ length: Math.max(0, 3 - trilha.length) }).map((_, i) => (_jsx("div", { style: { height: 3, flex: 1, borderRadius: 2, background: 'var(--color-border)' } }, `vazio-${i}`)))] }), _jsxs("div", { style: {
                    background: 'var(--color-bg-card)',
                    border: `1px solid ${no.tipo === 'desfecho' ? (no.desfecho_bom ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: 28,
                    animation: 'entrarBaixo 0.2s ease',
                }, children: [no.tipo === 'desfecho' && (_jsx("p", { style: { margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: no.desfecho_bom ? 'var(--color-success)' : 'var(--color-warning)' }, children: no.desfecho_bom ? '✦ Raciocínio correto' : '↺ Vale revisitar' })), _jsx("p", { style: { margin: 0, fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.7 }, children: no.narrativa }), no.tipo === 'decisao' && !feedbackAtivo && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }, children: no.opcoes?.map((o, i) => (_jsx("button", { onClick: () => escolher(o), style: {
                                textAlign: 'left',
                                padding: '12px 16px',
                                border: '1px solid var(--color-border-accent)',
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                color: 'var(--color-text-secondary)',
                                fontSize: 14,
                                cursor: 'pointer',
                            }, children: o.texto }, i))) })), feedbackAtivo && (_jsxs("div", { style: { marginTop: 20 }, children: [_jsx("div", { style: {
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    background: feedbackAtivo.correta ? 'rgba(104,211,145,0.1)' : 'rgba(246,173,85,0.1)',
                                    border: `1px solid ${feedbackAtivo.correta ? 'var(--color-success)' : 'var(--color-warning)'}`,
                                    marginBottom: 14,
                                }, children: _jsx("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }, children: feedbackAtivo.feedback }) }), _jsx("button", { onClick: avancar, style: { padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }, children: "Continuar \u2192" })] })), no.tipo === 'desfecho' && (_jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 22 }, children: [_jsx("button", { onClick: reiniciar, style: { padding: '9px 18px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer' }, children: "Tentar outro caminho" }), vinheta.bloco_id && (_jsx("button", { onClick: () => navigate(`/bloco/${vinheta.bloco_id}`), style: { padding: '9px 18px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }, children: "Ver o bloco relacionado" }))] }))] })] }));
}
