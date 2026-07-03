import { db } from '@core/db/database';
import { estaVencido } from '@core/srs/sm2';
export async function calcularEstado() {
    const totalBlocos = await db.blocos.count();
    const progresso = await db.progresso.toArray();
    const agora = new Date();
    const iniciados = progresso.filter((p) => p.vezes_lido > 0);
    const dominados = progresso.filter((p) => p.srs.status === 'dominado' || p.srs.status === 'revisando');
    const vencidos = iniciados.filter((p) => estaVencido(p.srs, agora));
    let diasDesdeUltima = null;
    const leituras = progresso
        .map((p) => p.ultima_leitura)
        .filter((d) => !!d)
        .map((d) => new Date(d).getTime());
    if (leituras.length) {
        const ultima = Math.max(...leituras);
        diasDesdeUltima = Math.floor((agora.getTime() - ultima) / 86_400_000);
    }
    return {
        totalBlocos,
        blocosIniciados: iniciados.length,
        blocosDominados: dominados.length,
        cardsVencidos: vencidos.length,
        diasDesdeUltima,
        percentualDominio: totalBlocos ? Math.round((dominados.length / totalBlocos) * 100) : 0,
    };
}
