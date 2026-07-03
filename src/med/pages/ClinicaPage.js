import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { Pagina, CabecalhoPagina, EstadoVazio, FalaAnima } from '@core/components/ui/primitivos';
import { VINHETAS_SEED } from '@core/anima/vinhetasSeed';
import { VinhetaClinicaPlayer } from '@med/components/clinico/VinhetaClinicaPlayer';
/** Raciocínio Clínico — lista e player de vinhetas ramificadas (bloco 5). */
export function ClinicaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    if (id) {
        const vinheta = VINHETAS_SEED.find((v) => v.vinheta_id === id);
        if (!vinheta)
            return _jsx(Pagina, { children: _jsx("p", { style: { color: 'var(--color-text-muted)' }, children: "Vinheta n\u00E3o encontrada." }) });
        return (_jsxs(Pagina, { largura: 820, children: [_jsx("button", { onClick: () => navigate('/clinica'), style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }, children: "\u2190 Vinhetas" }), _jsx(CabecalhoPagina, { titulo: vinheta.titulo, subtitulo: `${vinheta.disciplina} · decisão importa mais que memória aqui` }), _jsx(VinhetaClinicaPlayer, { vinheta: vinheta })] }));
    }
    return (_jsxs(Pagina, { largura: 820, children: [_jsx(CabecalhoPagina, { titulo: "Racioc\u00EDnio Cl\u00EDnico", subtitulo: "Casos com decis\u00F5es reais \u2014 o que voc\u00EA escolhe muda o desfecho." }), VINHETAS_SEED.length === 0 ? (_jsx(EstadoVazio, { children: _jsx(FalaAnima, { texto: "Ainda n\u00E3o h\u00E1 vinhetas neste acervo. Elas nascem conforme os blocos crescem." }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: VINHETAS_SEED.map((v) => (_jsxs("div", { onClick: () => navigate(`/clinica/${v.vinheta_id}`), style: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', cursor: 'pointer' }, children: [_jsx("p", { style: { margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }, children: v.titulo }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }, children: v.disciplina })] }, v.vinheta_id))) }))] }));
}
