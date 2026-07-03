// Mapeia disciplina → zona anatômica. Disciplinas futuras entram por palavra-chave;
// o que não bater cai em 'aura' (glow geral do corpo).
const MAPA = {
    histologia: 'pele',
    anatomia: 'esqueleto',
    bioquimica: 'nucleo',
    embriologia: 'coracao',
    fisiologia: 'coracao',
    patologia: 'nucleo',
    farmaco: 'nucleo',
    clinica: 'coracao',
};
const ZONA_ROTULO = {
    pele: 'Pele — Histologia',
    cranio: 'Crânio — Neuroanatomia',
    coracao: 'Coração — Fisiologia/Clínica',
    nucleo: 'Núcleo — Bioquímica/Patologia',
    esqueleto: 'Esqueleto — Anatomia',
    pulmoes: 'Pulmões — Respiratório',
    abdome: 'Abdome — Digestivo',
    aura: 'Aura — outros saberes',
};
export function calcularZonas(porDisciplina) {
    const porZona = new Map();
    for (const d of porDisciplina) {
        const zona = MAPA[d.disciplina.toLowerCase()] ?? 'aura';
        const acc = porZona.get(zona) ?? { dominados: 0, total: 0, discs: new Set() };
        acc.dominados += d.dominados;
        acc.total += d.total;
        acc.discs.add(d.disciplina);
        porZona.set(zona, acc);
    }
    const zonas = [];
    for (const [id, acc] of porZona.entries()) {
        zonas.push({
            id,
            rotulo: ZONA_ROTULO[id],
            disciplinas: [...acc.discs],
            percentual: acc.total ? Math.round((acc.dominados / acc.total) * 100) : 0,
            totalBlocos: acc.total,
        });
    }
    return zonas;
}
export function zonaPorId(zonas, id) {
    return zonas.find((z) => z.id === id);
}
