import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagina, FalaAnima } from '@core/components/ui/primitivos';
import { useUIStore } from '@core/store/uiStore';
import { RespiracaoGuiada } from '@med/components/bemestar/RespiracaoGuiada';
export function RespirarPage() {
    const navigate = useNavigate();
    const { reduzirMovimento } = useUIStore();
    const [completo, setCompleto] = useState(false);
    return (_jsx(Pagina, { largura: 520, children: _jsxs("div", { style: { paddingTop: 40, textAlign: 'center' }, children: [_jsx(FalaAnima, { texto: completo ? 'Pronto. Você está mais firme agora.' : 'Vamos respirar juntos. Quatro tempos, quatro vezes.' }), _jsx("div", { style: { marginTop: 20 }, children: !completo ? (_jsx(RespiracaoGuiada, { reduzirMovimento: reduzirMovimento, ciclos: 4, onCompleto: () => setCompleto(true) })) : (_jsx("div", { style: { padding: '40px 0' }, children: _jsx("div", { style: { fontSize: 48, color: 'var(--color-accent)' }, children: "\u2726" }) })) }), completo && (_jsx("button", { onClick: () => navigate(-1), style: { padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }, children: "Continuar" }))] }) }));
}
