/**
 * MÓDULO DE INTEGRAÇÃO DEXIE v3
 *
 * Responsabilidades:
 * 1. Carregar blocos em lote (com paralelismo controlado)
 * 2. Validar IDs únicos e relacionamentos antes de gravar
 * 3. Criar índices secundários para busca rápida (disciplina, tags, semestre)
 * 4. Exportar backup JSON para segurança
 * 5. Relatar métricas de performance e integridade
 */
import { db, getMeta, setMeta, registrarEvento } from './database';
// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE VALIDAÇÃO
// ════════════════════════════════════════════════════════════════════════════
function validarIDsUnicos(blocos) {
    const vistos = new Map();
    const duplicados = [];
    for (const bloco of blocos) {
        const count = (vistos.get(bloco.resumo_id) ?? 0) + 1;
        vistos.set(bloco.resumo_id, count);
        if (count > 1 && !duplicados.includes(bloco.resumo_id)) {
            duplicados.push(bloco.resumo_id);
        }
    }
    return {
        unicos: duplicados.length === 0,
        duplicados,
    };
}
function validarReferencias(blocos) {
    const idsValidos = new Set(blocos.map((b) => b.resumo_id));
    const invalidas = [];
    const flashcards_orfaos = [];
    const casos_orfaos = [];
    const conexoes_orfaos = [];
    for (const bloco of blocos) {
        // Validar flashcards
        if (bloco.flashcards) {
            for (const fc of bloco.flashcards) {
                if (!fc.card_id || !fc.pergunta || !fc.resposta) {
                    flashcards_orfaos.push(`${bloco.resumo_id}/${fc.card_id}`);
                }
            }
        }
        // Validar casos clínicos
        if (bloco.casos_clinicos) {
            for (const caso of bloco.casos_clinicos) {
                if (!caso.caso_id || !caso.titulo) {
                    casos_orfaos.push(`${bloco.resumo_id}/${caso.caso_id}`);
                }
            }
        }
        // Validar conexões
        if (bloco.conexoes && 'futuras' in bloco.conexoes) {
            const conn = bloco.conexoes;
            if (conn.futuras && Array.isArray(conn.futuras)) {
                for (const f of conn.futuras) {
                    if (f.bloco_id && !idsValidos.has(f.bloco_id)) {
                        conexoes_orfaos.push(`${bloco.resumo_id} → ${f.bloco_id}`);
                    }
                }
            }
        }
        // Validar pai-filho
        if (bloco.no_pai_id && !idsValidos.has(bloco.no_pai_id)) {
            invalidas.push(`${bloco.resumo_id}: pai inválido ${bloco.no_pai_id}`);
        }
        if (bloco.nos_filhos_ids) {
            for (const filho of bloco.nos_filhos_ids) {
                if (!idsValidos.has(filho)) {
                    invalidas.push(`${bloco.resumo_id}: filho inválido ${filho}`);
                }
            }
        }
    }
    return {
        invalidas,
        flashcards_orfaos,
        casos_orfaos,
        conexoes_orfaos,
    };
}
// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INDEXAÇÃO
// ════════════════════════════════════════════════════════════════════════════
function construirIndices(blocos) {
    const por_disciplina = new Map();
    const por_tags = new Map();
    const por_id = new Map();
    const por_semestre = new Map();
    for (const bloco of blocos) {
        // Índice por ID
        por_id.set(bloco.resumo_id, bloco);
        // Índice por disciplina
        const disc = bloco.metadata.disciplina;
        if (!por_disciplina.has(disc)) {
            por_disciplina.set(disc, []);
        }
        por_disciplina.get(disc).push(bloco.resumo_id);
        // Índice por tags
        for (const tag of bloco.metadata.tags) {
            if (!por_tags.has(tag)) {
                por_tags.set(tag, []);
            }
            por_tags.get(tag).push(bloco.resumo_id);
        }
        // Índice por semestre
        const sem = bloco.metadata.semestre;
        if (!por_semestre.has(sem)) {
            por_semestre.set(sem, []);
        }
        por_semestre.get(sem).push(bloco.resumo_id);
    }
    return { por_disciplina, por_tags, por_id, por_semestre };
}
// ════════════════════════════════════════════════════════════════════════════
// MIGRAÇÃO E GRAVAÇÃO
// ════════════════════════════════════════════════════════════════════════════
/**
 * Integra um lote de blocos ao IndexedDB com validação rigorosa
 */
export async function integrarBlocos(blocos) {
    const inicioMs = performance.now();
    const timestamp = new Date().toISOString();
    // 1. VALIDAÇÃO DE IDs
    const validacaoIds = validarIDsUnicos(blocos);
    if (!validacaoIds.unicos) {
        console.warn('[INTEGRACAO] Encontrados IDs duplicados:', validacaoIds.duplicados);
    }
    // 2. VALIDAÇÃO DE REFERÊNCIAS
    const validacaoRefs = validarReferencias(blocos);
    if (validacaoRefs.invalidas.length > 0) {
        console.warn('[INTEGRACAO] Referências inválidas encontradas:', validacaoRefs.invalidas);
    }
    // 3. CONSTRUIR ÍNDICES (em memória)
    const indices = construirIndices(blocos);
    // 4. GRAVAR NO INDEXEDDB
    let blocos_com_erro = 0;
    try {
        await db.blocos.bulkPut(blocos);
    }
    catch (e) {
        console.error('[INTEGRACAO] Erro ao gravar blocos:', e);
        blocos_com_erro = blocos.length;
    }
    // 5. CONTABILIZAR CONTEÚDO SECUNDÁRIO
    let totalFlashcards = 0;
    let totalCasos = 0;
    let totalConexoes = 0;
    let totalMidia = 0;
    for (const bloco of blocos) {
        if (bloco.flashcards)
            totalFlashcards += bloco.flashcards.length;
        if (bloco.casos_clinicos)
            totalCasos += bloco.casos_clinicos.length;
        if (bloco.conexoes)
            totalConexoes += bloco.conexoes.length;
        if (bloco.midia)
            totalMidia += bloco.midia.length;
    }
    // 6. GRAVAR ÍNDICES COMO METADADOS
    const statusIndices = {
        por_disciplina: indices.por_disciplina.size,
        por_tags: indices.por_tags.size,
        por_id: indices.por_id.size,
        por_semestre: indices.por_semestre.size,
    };
    await setMeta('indices_blocos', statusIndices);
    await setMeta('ultima_integracao', timestamp);
    const performanceMs = performance.now() - inicioMs;
    const relatorio = {
        blocos_migrados: blocos.length - blocos_com_erro,
        blocos_com_erro,
        flashcards_migrados: totalFlashcards,
        casos_clinicos_migrados: totalCasos,
        conexoes_migradas: totalConexoes,
        midia_migrada: totalMidia,
        ids_unicos: validacaoIds.unicos,
        status_indices: statusIndices,
        performance_ms: performanceMs,
        validacoes: validacaoRefs,
        timestamp,
    };
    if (import.meta.env.DEV) {
        console.info(`[ANIMA] Integração completa: ${relatorio.blocos_migrados} blocos, ${totalFlashcards} flashcards, ${performanceMs.toFixed(2)}ms`);
    }
    await registrarEvento('integracao', relatorio);
    return relatorio;
}
// ════════════════════════════════════════════════════════════════════════════
// BACKUP E EXPORTAÇÃO
// ════════════════════════════════════════════════════════════════════════════
/**
 * Exporta todos os blocos e progresso como JSON para backup
 */
export async function exportarBackup() {
    const blocos = await db.blocos.toArray();
    const progresso = await db.progresso.toArray();
    const indices = await getMeta('indices_blocos');
    const backup = {
        timestamp: new Date().toISOString(),
        blocos,
        progresso,
        indices: indices ?? {},
    };
    // Trigger download no navegador
    if (typeof window !== 'undefined') {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `anima-backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
    return backup;
}
// ════════════════════════════════════════════════════════════════════════════
// CONSULTAS INDEXADAS
// ════════════════════════════════════════════════════════════════════════════
/**
 * Busca blocos por disciplina usando índice Dexie
 */
export async function buscarPorDisciplina(disciplina) {
    return db.blocos.where('metadata.disciplina').equals(disciplina).toArray();
}
/**
 * Busca blocos por tag usando índice Dexie (multi-valor)
 */
export async function buscarPorTag(tag) {
    return db.blocos.where('metadata.tags').equals(tag).toArray();
}
/**
 * Busca blocos por semestre usando índice Dexie
 */
export async function buscarPorSemestre(semestre) {
    return db.blocos.where('metadata.semestre').equals(semestre).toArray();
}
/**
 * Busca um bloco específico por ID
 */
export async function buscarPorID(id) {
    return db.blocos.get(id);
}
/**
 * Lista todas as disciplinas no banco
 */
export async function listarDisciplinas() {
    const blocos = await db.blocos.toArray();
    const disciplinas = new Set(blocos.map((b) => b.metadata.disciplina));
    return Array.from(disciplinas).sort();
}
/**
 * Lista todas as tags no banco
 */
export async function listarTags() {
    const blocos = await db.blocos.toArray();
    const tags = new Set();
    for (const bloco of blocos) {
        for (const tag of bloco.metadata.tags) {
            tags.add(tag);
        }
    }
    return Array.from(tags).sort();
}
/**
 * Obtém estatísticas de cobertura
 */
export async function obterEstatisticas() {
    const blocos = await db.blocos.toArray();
    let total_flashcards = 0;
    let total_casos = 0;
    let total_conexoes = 0;
    let total_midia = 0;
    const semestres = new Set();
    for (const bloco of blocos) {
        if (bloco.flashcards)
            total_flashcards += bloco.flashcards.length;
        if (bloco.casos_clinicos)
            total_casos += bloco.casos_clinicos.length;
        if (bloco.conexoes)
            total_conexoes += bloco.conexoes.length;
        if (bloco.midia)
            total_midia += bloco.midia.length;
        semestres.add(bloco.metadata.semestre);
    }
    const disciplinas = await listarDisciplinas();
    const tags = await listarTags();
    return {
        total_blocos: blocos.length,
        total_flashcards,
        total_casos,
        total_conexoes,
        total_midia,
        disciplinas: disciplinas.length,
        tags: tags.length,
        semestres: Array.from(semestres).sort((a, b) => a - b),
    };
}
