import { useUIStore } from '@core/store/uiStore';
let ctx = null;
function contexto() {
    if (typeof window === 'undefined')
        return null;
    if (!ctx) {
        const AC = window.AudioContext ??
            window.webkitAudioContext;
        if (!AC)
            return null;
        ctx = new AC();
    }
    if (ctx.state === 'suspended')
        void ctx.resume();
    return ctx;
}
function tocarNotas(notas, volumeMestre) {
    const ac = contexto();
    if (!ac)
        return;
    const agora = ac.currentTime;
    for (const n of notas) {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = n.tipo ?? 'sine';
        osc.frequency.value = n.freq;
        const t0 = agora + n.inicio;
        const pico = (n.vol ?? 1) * volumeMestre;
        // envelope percussivo: ataque rápido, decaimento exponencial suave
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(pico, t0 + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.dur);
        osc.connect(g).connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + n.dur + 0.03);
    }
}
// Frequências (escala de Dó maior) para receitas legíveis
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const G5 = 783.99;
const A4 = 440.0;
const C6 = 1046.5;
const RECEITAS = {
    toque: () => tocarNotas([{ freq: D5, inicio: 0, dur: 0.07, vol: 0.35, tipo: 'sine' }], 0.1),
    revelar: () => tocarNotas([
        { freq: C5, inicio: 0, dur: 0.12, vol: 0.4, tipo: 'triangle' },
        { freq: G5, inicio: 0.06, dur: 0.16, vol: 0.35, tipo: 'triangle' },
    ], 0.12),
    acerto: () => tocarNotas([
        { freq: E5, inicio: 0, dur: 0.14, vol: 0.4 },
        { freq: G5, inicio: 0.02, dur: 0.16, vol: 0.3 },
    ], 0.12),
    sucesso: () => tocarNotas([
        { freq: C5, inicio: 0, dur: 0.16, vol: 0.4, tipo: 'triangle' },
        { freq: E5, inicio: 0.08, dur: 0.16, vol: 0.4, tipo: 'triangle' },
        { freq: G5, inicio: 0.16, dur: 0.18, vol: 0.4, tipo: 'triangle' },
        { freq: C6, inicio: 0.24, dur: 0.3, vol: 0.45, tipo: 'triangle' },
    ], 0.13),
    erro: () => tocarNotas([
        { freq: 233.08, inicio: 0, dur: 0.16, vol: 0.35, tipo: 'sine' },
        { freq: 207.65, inicio: 0.05, dur: 0.2, vol: 0.3, tipo: 'sine' },
    ], 0.1),
    transicao: () => tocarNotas([{ freq: G5, inicio: 0, dur: 0.06, vol: 0.18, tipo: 'sine' }], 0.07),
    colheita: () => tocarNotas([
        { freq: A4, inicio: 0, dur: 0.16, vol: 0.4, tipo: 'triangle' },
        { freq: C5, inicio: 0.07, dur: 0.16, vol: 0.35, tipo: 'triangle' },
        { freq: E5, inicio: 0.14, dur: 0.22, vol: 0.35, tipo: 'triangle' },
    ], 0.12),
};
/** Toca um som nomeado, se o usuário mantém o som ligado. Nunca lança. */
export function tocar(nome) {
    try {
        if (!useUIStore.getState().som)
            return;
        RECEITAS[nome]();
    }
    catch {
        // áudio nunca deve quebrar a interação
    }
}
