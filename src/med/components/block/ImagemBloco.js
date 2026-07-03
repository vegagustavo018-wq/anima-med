import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SELOS = {
    real: {
        icone: '✓',
        rotulo: 'Imagem real',
        aviso: null,
        cor: 'var(--color-success)',
    },
    ia: {
        icone: '⚠',
        rotulo: 'Ilustração por IA',
        aviso: 'Auxílio ao estudo — pode conter imprecisões. Confira com atlas/lâmina real.',
        cor: 'var(--color-warning)',
    },
    esquema: {
        icone: '◇',
        rotulo: 'Esquema didático',
        aviso: null,
        cor: 'var(--color-accent)',
    },
};
export function SeloImagem({ origem }) {
    const s = SELOS[origem];
    return (_jsxs("span", { title: s.aviso ?? s.rotulo, style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 9px',
            borderRadius: 99,
            border: `1px solid ${s.cor}`,
            color: s.cor,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.03em',
            background: 'color-mix(in srgb, currentColor 8%, transparent)',
        }, children: [_jsx("span", { "aria-hidden": "true", children: s.icone }), s.rotulo] }));
}
export function ImagemBloco({ titulo, descricao, origem = 'ia', url, }) {
    const selo = SELOS[origem];
    return (_jsxs("figure", { style: {
            border: url ? '1px solid var(--color-border)' : '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: url ? 12 : 24,
            margin: '1.5rem 0',
            background: 'var(--color-bg-card)',
            textAlign: url ? 'left' : 'center',
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: url ? 'space-between' : 'center', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx("figcaption", { style: { fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }, children: titulo }), _jsx(SeloImagem, { origem: origem })] }), url ? (_jsx("img", { src: url, alt: descricao, loading: "lazy", style: { width: '100%', borderRadius: 'var(--radius-md)', display: 'block' } })) : (_jsx("div", { style: { fontSize: 40, marginBottom: 12, color: 'var(--color-text-muted)', lineHeight: 1 }, "aria-hidden": "true", children: "\uD83D\uDDBC" })), _jsx("p", { style: { margin: url ? '10px 0 0' : 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }, children: descricao }), selo.aviso && (_jsx("p", { style: { margin: '8px 0 0', fontSize: 11, color: 'var(--color-warning)', lineHeight: 1.4 }, children: selo.aviso })), !url && (_jsx("p", { style: { margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Imagem pendente de gera\u00E7\u00E3o" }))] }));
}
/**
 * Aba "Imagens & Resumos" do bloco — reúne todas as imagens/esquemas da
 * narrativa num só lugar, para o aluno revisar a parte visual de uma vez
 * (pedido do Gustavo: toda vez que entra no bloco, tem uma aba com as imagens
 * das estruturas e resumos). É o embrião da futura Galeria/Museu ANIMA-Med.
 */
export function ImagensAba({ narrativa }) {
    const imagens = narrativa.filter((n) => n.tipo === 'imagem');
    if (imagens.length === 0) {
        return (_jsx("p", { style: { fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: "Este bloco ainda n\u00E3o tem imagens ou esquemas. Elas chegam conforme o conte\u00FAdo \u00E9 produzido." }));
    }
    return (_jsxs("div", { children: [_jsx("p", { style: { fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }, children: "As estruturas e resumos visuais deste tema, reunidos. Cada imagem traz seu selo de proveni\u00EAncia." }), imagens.map((img, i) => (_jsx(ImagemBloco, { titulo: img.titulo, descricao: img.descricao, origem: img.origem ?? 'ia', url: img.url ?? null }, i)))] }));
}
