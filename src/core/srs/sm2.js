function statusPorRepeticoes(rep) {
    if (rep >= 5)
        return 'dominado';
    if (rep >= 2)
        return 'revisando';
    if (rep >= 1)
        return 'aprendendo';
    return 'novo';
}
/**
 * SM-2. Recebe estado anterior + qualidade da resposta, devolve novo estado.
 * (Migração para FSRS-5 planejada após >500 cards — Filosofia.)
 */
export function revisar(anterior, qualidade) {
    let { facilidade, intervalo_dias, repeticoes, lapsos } = anterior;
    if (qualidade >= 3) {
        if (repeticoes === 0)
            intervalo_dias = 1;
        else if (repeticoes === 1)
            intervalo_dias = 6;
        else
            intervalo_dias = Math.round(intervalo_dias * facilidade);
        repeticoes += 1;
        facilidade = Math.max(1.3, facilidade + 0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02));
    }
    else {
        repeticoes = 0;
        intervalo_dias = 1;
        lapsos += 1;
    }
    const agora = new Date();
    const proxima = new Date(agora);
    proxima.setDate(proxima.getDate() + intervalo_dias);
    return {
        facilidade,
        intervalo_dias,
        repeticoes,
        lapsos,
        ultima_revisao: agora.toISOString(),
        proxima_revisao: proxima.toISOString(),
        status: statusPorRepeticoes(repeticoes),
    };
}
/** Previsão de intervalo (em dias) que cada botão de qualidade geraria — para exibir no card. */
export function previsaoIntervalos(estado) {
    const qs = [0, 2, 4, 5];
    const out = {};
    for (const q of qs)
        out[q] = revisar(estado, q).intervalo_dias;
    return out;
}
/** Um card/bloco é "leech" se falhou repetidamente — sinal de que precisa ser reformulado. */
export function ehLeech(estado) {
    return estado.lapsos >= 4;
}
export function estaVencido(estado, agora = new Date()) {
    if (estado.status === 'novo')
        return true;
    return estado.proxima_revisao != null && new Date(estado.proxima_revisao) <= agora;
}
