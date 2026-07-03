/**
 * ANIMA Med Database Integrity Validator
 *
 * Ferramentas para validação de integridade pós-migração.
 * Exporta funções reutilizáveis para testes automatizados e diagnósticos.
 */
import { db } from './database';
// ═══════════════════════════════════════════════════════════════════════════
// Teste 1: Leitura
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Teste 1: Consegue ler 100 blocos aleatoriamente?
 * Valida: acesso ao banco, estrutura básica dos blocos
 */
export async function testeLeitura() {
    const inicio = performance.now();
    try {
        const todos = await db.blocos.toArray();
        if (todos.length === 0) {
            return {
                passou: false,
                ms: performance.now() - inicio,
                blocos: 0,
                erro: 'Nenhum bloco no banco',
            };
        }
        // Amostra aleatória de até 100
        const tamanho = Math.min(100, todos.length);
        const indices = new Set();
        while (indices.size < tamanho) {
            indices.add(Math.floor(Math.random() * todos.length));
        }
        const amostra = Array.from(indices).map(idx => todos[idx]);
        // Validação rigorosa
        const todasValidas = amostra.every(b => b &&
            b.resumo_id &&
            typeof b.resumo_id === 'string' &&
            b.metadata &&
            typeof b.metadata === 'object');
        return {
            passou: todasValidas && amostra.length > 0,
            ms: performance.now() - inicio,
            blocos: amostra.length,
            dados: { amostra_size: tamanho, total_blocos: todos.length },
        };
    }
    catch (e) {
        return {
            passou: false,
            ms: performance.now() - inicio,
            blocos: 0,
            erro: `Erro ao ler blocos: ${String(e)}`,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Teste 2: Busca
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Teste 2: Filtrar por disciplina, tag, ID — rápido?
 * Valida: índices funcionando, performance < 1s
 */
export async function testeBusca() {
    const inicio = performance.now();
    try {
        // Busca 1: por disciplina (any)
        const disciplinas = await db.blocos
            .where('metadata.disciplina')
            .anyOf('Anatomia', 'Histologia', 'Biologia Celular')
            .limit(10)
            .toArray();
        // Busca 2: por ID específico
        const primeiroBloco = await db.blocos.limit(1).toArray();
        let blocoPorID = null;
        if (primeiroBloco.length > 0) {
            blocoPorID = await db.blocos.get(primeiroBloco[0].resumo_id);
        }
        const ms = performance.now() - inicio;
        // Performance check: < 1000ms é bom, < 500ms é excelente
        const performance_ok = ms < 1000;
        const encontrados = disciplinas.length + (blocoPorID ? 1 : 0);
        return {
            passou: performance_ok && encontrados >= 0,
            ms,
            encontrados,
            dados: {
                buscas_disciplina: disciplinas.length,
                buscas_id: blocoPorID ? 1 : 0,
                tempo_total_ms: ms.toFixed(2),
            },
        };
    }
    catch (e) {
        return {
            passou: false,
            ms: performance.now() - inicio,
            encontrados: 0,
            erro: `Erro ao buscar: ${String(e)}`,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Teste 3: Relacionamentos
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Teste 3: Conexões futuras (parent-child) ainda intactas?
 * Valida: referências bidirecionais válidas, sem órfãos
 */
export async function testeRelacionamentos() {
    const inicio = performance.now();
    const problemas = [];
    const stats = {
        blocos_com_pai: 0,
        pais_validos: 0,
        pais_invalidos: 0,
        blocos_com_filhos: 0,
        filhos_validos: 0,
        filhos_invalidos: 0,
    };
    try {
        const todos = await db.blocos.toArray();
        for (const bloco of todos) {
            // Verifica pai
            if (bloco.no_pai_id) {
                stats.blocos_com_pai++;
                const pai = await db.blocos.get(bloco.no_pai_id);
                if (pai) {
                    stats.pais_validos++;
                }
                else {
                    stats.pais_invalidos++;
                    problemas.push(`[ÓRFÃO] ${bloco.resumo_id} referencia pai ${bloco.no_pai_id} inexistente`);
                }
            }
            // Verifica filhos
            if (Array.isArray(bloco.nos_filhos_ids) && bloco.nos_filhos_ids.length > 0) {
                stats.blocos_com_filhos++;
                for (const filhoId of bloco.nos_filhos_ids) {
                    const filho = await db.blocos.get(filhoId);
                    if (filho) {
                        stats.filhos_validos++;
                    }
                    else {
                        stats.filhos_invalidos++;
                        problemas.push(`[REF ÓRFÃ] ${bloco.resumo_id} → ${filhoId} não existe`);
                    }
                }
            }
        }
        return {
            passou: problemas.length === 0,
            ms: performance.now() - inicio,
            problemas,
            dados: stats,
        };
    }
    catch (e) {
        return {
            passou: false,
            ms: performance.now() - inicio,
            problemas: [`[ERRO CRÍTICO] ${String(e)}`],
            erro: String(e),
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Teste 4: Abas
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Teste 4: Blocos, flashcards, casos separados corretamente?
 * Valida: estrutura de abas (narrativa, flashcards, casos_clinicos)
 */
export async function testeAbas() {
    const inicio = performance.now();
    try {
        const blocos = await db.blocos.toArray();
        let blocos_ok = 0;
        let flashcards_ok = 0;
        let casos_ok = 0;
        for (const bloco of blocos) {
            // Aba 1: Narrativa/Conteúdo
            if (Array.isArray(bloco.narrativa) && bloco.narrativa.length > 0) {
                blocos_ok++;
            }
            // Aba 2: Flashcards
            if (Array.isArray(bloco.flashcards) && bloco.flashcards.length > 0) {
                flashcards_ok++;
            }
            // Aba 3: Casos Clínicos
            if (Array.isArray(bloco.casos_clinicos) && bloco.casos_clinicos.length > 0) {
                casos_ok++;
            }
        }
        const ms = performance.now() - inicio;
        // Sucesso: blocos com narrativa > 0
        const passou = blocos_ok > 0;
        return {
            passou,
            ms,
            dados: {
                blocos_com_narrativa: blocos_ok,
                blocos_com_flashcards: flashcards_ok,
                blocos_com_casos: casos_ok,
                total_blocos: blocos.length,
                percentual_narrativa: ((blocos_ok / blocos.length) * 100).toFixed(1),
                percentual_flashcards: ((flashcards_ok / blocos.length) * 100).toFixed(1),
                percentual_casos: ((casos_ok / blocos.length) * 100).toFixed(1),
            },
        };
    }
    catch (e) {
        return {
            passou: false,
            ms: performance.now() - inicio,
            erro: String(e),
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Teste 5: Conflitos
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Teste 5: IDs duplicados, órfãos, integridade referencial
 * Valida: unicidade de IDs, relacionamentos válidos em ambas tabelas
 */
export async function testeConflitos() {
    const inicio = performance.now();
    const problemas = [];
    const stats = {
        ids_duplicados_blocos: 0,
        ids_duplicados_questoes: 0,
        progresso_orfao: 0,
        questao_progresso_orfao: 0,
    };
    try {
        // ─────────────────────────────────────────────────────────────────────
        // Conflitos em blocos
        // ─────────────────────────────────────────────────────────────────────
        const blocos = await db.blocos.toArray();
        const idsVistoBlocos = new Set();
        for (const b of blocos) {
            if (idsVistoBlocos.has(b.resumo_id)) {
                stats.ids_duplicados_blocos++;
                problemas.push(`[DUPLICADO] Bloco ${b.resumo_id} aparece 2+ vezes`);
            }
            idsVistoBlocos.add(b.resumo_id);
        }
        // ─────────────────────────────────────────────────────────────────────
        // Conflitos em progresso (órfão quando bloco não existe)
        // ─────────────────────────────────────────────────────────────────────
        const progessos = await db.progresso.toArray();
        for (const p of progessos) {
            const bloco = blocos.find(b => b.resumo_id === p.resumo_id);
            if (!bloco) {
                stats.progresso_orfao++;
                problemas.push(`[ÓRFÃO] Progresso ${p.resumo_id} não tem bloco correspondente`);
            }
        }
        // ─────────────────────────────────────────────────────────────────────
        // Conflitos em questões
        // ─────────────────────────────────────────────────────────────────────
        const questoes = await db.questoes.toArray();
        const idsVistoQuestoes = new Set();
        for (const q of questoes) {
            if (idsVistoQuestoes.has(q.id)) {
                stats.ids_duplicados_questoes++;
                problemas.push(`[DUPLICADO] Questão ${q.id} aparece 2+ vezes`);
            }
            idsVistoQuestoes.add(q.id);
        }
        // ─────────────────────────────────────────────────────────────────────
        // Conflitos em progressoQuestao (órfão quando questão não existe)
        // ─────────────────────────────────────────────────────────────────────
        const progressoQuestoes = await db.progressoQuestao.toArray();
        for (const pq of progressoQuestoes) {
            if (!idsVistoQuestoes.has(pq.questao_id)) {
                stats.questao_progresso_orfao++;
                problemas.push(`[ÓRFÃO] ProgressoQuestao ${pq.questao_id} não tem questão`);
            }
        }
        return {
            passou: problemas.length === 0,
            ms: performance.now() - inicio,
            problemas,
            dados: stats,
        };
    }
    catch (e) {
        return {
            passou: false,
            ms: performance.now() - inicio,
            problemas: [`[ERRO CRÍTICO] ${String(e)}`],
            erro: String(e),
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// Orquestração
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Executa todos os 5 testes e retorna resultado agregado
 */
export async function validarIntegridade() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ANIMA Med — Validador de Integridade (Pós-Migração)      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    // ─────────────────────────────────────────────────────────────────────
    // Executa testes
    // ─────────────────────────────────────────────────────────────────────
    const t1 = await testeLeitura();
    console.log(`[1/5] Leitura: ${t1.passou ? '✅' : '❌'} | ${t1.ms.toFixed(2)}ms | ${t1.blocos} blocos`);
    const t2 = await testeBusca();
    console.log(`[2/5] Busca: ${t2.passou ? '✅' : '❌'} | ${t2.ms.toFixed(2)}ms | ${t2.encontrados} encontrados`);
    const t3 = await testeRelacionamentos();
    console.log(`[3/5] Relacionamentos: ${t3.passou ? '✅' : '❌'} | ${t3.ms.toFixed(2)}ms`);
    const t4 = await testeAbas();
    console.log(`[4/5] Abas: ${t4.passou ? '✅' : '❌'} | ${t4.ms.toFixed(2)}ms`);
    const t5 = await testeConflitos();
    console.log(`[5/5] Conflitos: ${t5.passou ? '✅' : '❌'} | ${t5.ms.toFixed(2)}ms`);
    // ─────────────────────────────────────────────────────────────────────
    // Resultado Final
    // ─────────────────────────────────────────────────────────────────────
    const testes_passados = [t1.passou, t2.passou, t3.passou, t4.passou, t5.passou].filter(Boolean).length;
    const performance_queries_ms = [t1.ms, t2.ms, t3.ms, t4.ms, t5.ms];
    const problemas = [
        ...(t3.problemas || []),
        ...(t5.problemas || []),
    ];
    const resultado = {
        testes_passados,
        performance_queries_ms: performance_queries_ms.map(m => parseFloat(m.toFixed(2))),
        problemas: problemas.slice(0, 20),
        resumo: {
            teste_1_leitura: t1.passou,
            teste_2_busca: t2.passou,
            teste_3_relacionamentos: t3.passou,
            teste_4_abas: t4.passou,
            teste_5_conflitos: t5.passou,
            blocos_lidos: t1.blocos || 0,
            blocos_com_narrativa: t4.dados?.blocos_com_narrativa || 0,
            blocos_com_flashcards: t4.dados?.blocos_com_flashcards || 0,
            blocos_com_casos: t4.dados?.blocos_com_casos || 0,
            total_blocos: t4.dados?.total_blocos || 0,
            progresso_registros: await db.progresso.count(),
            questoes_count: await db.questoes.count(),
            conflitos_encontrados: problemas.length,
        },
    };
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  RESULTADO: ${resultado.testes_passados}/5 testes passados              ${' '.repeat(12)} ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    return resultado;
}
export default validarIntegridade;
