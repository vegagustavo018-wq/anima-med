// Solicita persistência do IndexedDB (evita evicção silenciosa sob pressão de disco)
// e monitora a cota disponível. Defesa barata contra perda catastrófica de progresso.
export async function garantirPersistencia() {
    let persistente = false;
    try {
        if (navigator.storage?.persisted) {
            persistente = await navigator.storage.persisted();
            if (!persistente && navigator.storage.persist) {
                persistente = await navigator.storage.persist();
            }
        }
    }
    catch {
        // ignora — browsers antigos
    }
    let usoMB = null;
    let cotaMB = null;
    let percentual = null;
    try {
        if (navigator.storage?.estimate) {
            const est = await navigator.storage.estimate();
            if (est.usage != null)
                usoMB = +(est.usage / 1_048_576).toFixed(1);
            if (est.quota != null)
                cotaMB = +(est.quota / 1_048_576).toFixed(0);
            if (est.usage != null && est.quota)
                percentual = +((est.usage / est.quota) * 100).toFixed(1);
        }
    }
    catch {
        // ignora
    }
    return { persistente, usoMB, cotaMB, percentual };
}
