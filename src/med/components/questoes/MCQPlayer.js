import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Player de uma questão de múltipla escolha (controlado). No treino/revisão,
 * `revelar` fica true após a escolha (feedback imediato + comentário). No Modo
 * Exame, `revelar` fica false até o fim (só marca a escolha).
 */
export function MCQPlayer({ questao, escolhida, revelar, aoEscolher, numero, total, }) {
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.06em' }, children: questao.especialidade.toUpperCase() }), _jsxs("span", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: [numero, " / ", total] })] }), _jsx("p", { style: { fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-primary)', whiteSpace: 'pre-line', margin: '0 0 20px' }, children: questao.enunciado }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: questao.alternativas.map((alt) => {
                    const eEscolhida = escolhida === alt.id;
                    const eCorreta = alt.id === questao.correta;
                    let borda = 'var(--color-border)';
                    let fundo = 'var(--color-bg-card)';
                    let corTexto = 'var(--color-text-primary)';
                    if (revelar) {
                        if (eCorreta) {
                            borda = 'var(--color-success)';
                            fundo = 'color-mix(in srgb, var(--color-success) 12%, transparent)';
                        }
                        else if (eEscolhida) {
                            borda = 'var(--color-danger)';
                            fundo = 'color-mix(in srgb, var(--color-danger) 12%, transparent)';
                        }
                    }
                    else if (eEscolhida) {
                        borda = 'var(--color-accent)';
                        fundo = 'var(--color-accent-glow)';
                        corTexto = 'var(--color-accent)';
                    }
                    return (_jsxs("button", { onClick: () => !revelar && !escolhida && aoEscolher(alt.id), disabled: revelar || (!!escolhida && !revelar), className: !revelar && !escolhida ? 'anima-lift' : undefined, style: {
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            textAlign: 'left',
                            padding: '13px 15px',
                            border: `1.5px solid ${borda}`,
                            borderRadius: 'var(--radius-md)',
                            background: fundo,
                            color: corTexto,
                            fontSize: 14,
                            lineHeight: 1.45,
                            cursor: revelar || escolhida ? 'default' : 'pointer',
                            transition: 'border-color 0.15s, background 0.15s',
                        }, children: [_jsx("span", { style: {
                                    flexShrink: 0,
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    border: `1.5px solid ${borda}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                }, children: revelar && eCorreta ? '✓' : revelar && eEscolhida ? '✕' : alt.id }), _jsx("span", { style: { flex: 1 }, children: alt.texto })] }, alt.id));
                }) }), revelar && (_jsxs("div", { className: "anima-surge", role: "status", "aria-live": "polite", style: {
                    marginTop: 18,
                    padding: '14px 16px',
                    background: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: 'var(--radius-lg)',
                }, children: [_jsxs("p", { style: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', margin: 0 }, children: [escolhida === questao.correta ? 'Correto.' : 'Incorreto.', " A resposta certa \u00E9 ", questao.alternativas.find((a) => a.id === questao.correta)?.texto, "."] }), _jsx("p", { style: { margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }, children: questao.comentario }), _jsxs("p", { style: { margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }, children: [questao.tema, questao.cid ? ` · CID ${questao.cid}` : '', " \u00B7 ", questao.fonte] })] }))] }));
}
