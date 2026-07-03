/**
 * SUITE DE TESTES DE INTEGRAÇÃO DEXIE v3
 *
 * Testes que rodam no navegador para validar:
 * - Carga e persistência de blocos
 * - Integridade de índices
 * - Performance de consultas
 * - Backup e restauração
 */
import { db, getMeta, setMeta } from './database';
import { integrarBlocos, buscarPorDisciplina, buscarPorTag, buscarPorSemestre, buscarPorID, listarDisciplinas, listarTags, obterEstatisticas, exportarBackup, } from './integracao';
// ════════════════════════════════════════════════════════════════════════════
// BLOCOS DE TESTE
// ════════════════════════════════════════════════════════════════════════════
const blocosTeste = [
    {
        resumo_id: 'test-001',
        titulo: 'Célula Eucariota - Conceito',
        descricao: 'Introdução à estrutura celular eucariota',
        metadata: {
            disciplina: 'Biologia Celular',
            semestre: 1,
            nivel: 'CORE',
            tipo: 'conceito',
            tags: ['célula', 'eucariota', 'membrana'],
            status_ciclo_vida: 'em_uso_clinico',
            confianca: 'clinica',
        },
        narrativa: [
            { tipo: 'texto', conteudo: 'A célula eucariota é o bloco fundamental da vida.' },
            { tipo: 'secao', titulo: 'Núcleo' },
            { tipo: 'texto', conteudo: 'O núcleo contém o material genético.' },
        ],
        flashcards: [
            {
                card_id: 'test-001-fc1',
                pergunta: 'O que é uma célula eucariota?',
                resposta: 'Uma célula com núcleo delimitado por membrana.',
                tipo: 'por_que',
                dificuldade: 1,
                nivel_alvo: 1,
                tags: ['célula', 'estrutura'],
            },
        ],
        casos_clinicos: [
            {
                caso_id: 'test-001-caso1',
                titulo: 'Paciente com disfunção mitocondrial',
                apresentacao: 'Fadiga e fraqueza muscular progressiva.',
            },
        ],
        conexoes: [
            {
                tipo: 'extensao',
                alvo_id: 'test-002',
                forca: 0.8,
            },
        ],
        midia: [
            {
                tipo: 'imagem',
                url: 'https://example.com/celula.png',
                descricao: 'Diagrama da célula eucariota',
            },
        ],
    },
    {
        resumo_id: 'test-002',
        titulo: 'Mitocôndria - Função',
        descricao: 'Estrutura e função da mitocôndria',
        no_pai_id: 'test-001',
        metadata: {
            disciplina: 'Biologia Celular',
            semestre: 1,
            nivel: 'EXPANSAO',
            tipo: 'processo',
            tags: ['mitocôndria', 'energia', 'ATP'],
            status_ciclo_vida: 'em_uso_clinico',
            confianca: 'clinica',
        },
        narrativa: [
            { tipo: 'texto', conteudo: 'A mitocôndria é a fábrica de energia da célula.' },
        ],
        flashcards: [
            {
                card_id: 'test-002-fc1',
                pergunta: 'Qual é a principal função da mitocôndria?',
                resposta: 'Produzir ATP através de fosforilação oxidativa.',
                tipo: 'mecanismo',
                dificuldade: 2,
                nivel_alvo: 2,
                tags: ['energia', 'ATP'],
            },
        ],
    },
    {
        resumo_id: 'test-003',
        titulo: 'Núcleo Celular - Comparação',
        descricao: 'Núcleo em diferentes tipos celulares',
        metadata: {
            disciplina: 'Histologia',
            semestre: 2,
            nivel: 'APROFUNDAMENTO',
            tipo: 'comparacao',
            tags: ['núcleo', 'comparação', 'cromatina'],
            status_ciclo_vida: 'em_revisao',
            confianca: 'estudo',
        },
        narrativa: [
            { tipo: 'texto', conteudo: 'O núcleo varia em diferentes tipos celulares.' },
        ],
        conexoes: [
            {
                tipo: 'relacionado',
                alvo_id: 'test-001',
                forca: 0.7,
            },
        ],
    },
];
// ════════════════════════════════════════════════════════════════════════════
// TESTES
// ════════════════════════════════════════════════════════════════════════════
async function testeIntegracaoBlocos() {
    const relatorio = await integrarBlocos(blocosTeste);
    if (relatorio.blocos_migrados !== blocosTeste.length) {
        throw new Error(`Esperado ${blocosTeste.length} blocos, obtive ${relatorio.blocos_migrados}`);
    }
    if (!relatorio.ids_unicos) {
        throw new Error('IDs duplicados encontrados');
    }
}
async function testeBuscaPorDisciplina() {
    const resultado = await buscarPorDisciplina('Biologia Celular');
    if (resultado.length !== 2) {
        throw new Error(`Esperado 2 blocos em Biologia Celular, obtive ${resultado.length}`);
    }
}
async function testeBuscaPorTag() {
    const resultado = await buscarPorTag('célula');
    if (resultado.length < 1) {
        throw new Error('Nenhum bloco encontrado com tag "célula"');
    }
}
async function testeBuscaPorSemestre() {
    const resultado = await buscarPorSemestre(1);
    if (resultado.length !== 2) {
        throw new Error(`Esperado 2 blocos no semestre 1, obtive ${resultado.length}`);
    }
}
async function testeBuscaPorID() {
    const bloco = await buscarPorID('test-001');
    if (!bloco) {
        throw new Error('Bloco test-001 não encontrado');
    }
    if (bloco.titulo !== 'Célula Eucariota - Conceito') {
        throw new Error('Bloco encontrado tem dados incorretos');
    }
}
async function testeListarDisciplinas() {
    const disciplinas = await listarDisciplinas();
    if (!disciplinas.includes('Biologia Celular')) {
        throw new Error('Biologia Celular não encontrada na lista de disciplinas');
    }
}
async function testeListarTags() {
    const tags = await listarTags();
    if (!tags.includes('célula')) {
        throw new Error('Tag "célula" não encontrada');
    }
}
async function testeEstatisticas() {
    const stats = await obterEstatisticas();
    if (stats.total_blocos !== blocosTeste.length) {
        throw new Error(`Esperado ${blocosTeste.length} blocos, obtive ${stats.total_blocos}`);
    }
    if (stats.total_flashcards < 2) {
        throw new Error(`Esperado pelo menos 2 flashcards, obtive ${stats.total_flashcards}`);
    }
    if (stats.total_casos < 1) {
        throw new Error(`Esperado pelo menos 1 caso, obtive ${stats.total_casos}`);
    }
}
async function testeRelacionamentoPaiFilho() {
    const pai = await buscarPorID('test-001');
    const filho = await buscarPorID('test-002');
    if (!filho || filho.no_pai_id !== 'test-001') {
        throw new Error('Relacionamento pai-filho inválido');
    }
    if (!pai || !pai.nos_filhos_ids || !pai.nos_filhos_ids.includes('test-002')) {
        throw new Error('Relacionamento filho-pai inválido');
    }
}
async function testeConexoes() {
    const bloco = await buscarPorID('test-001');
    if (!bloco || !bloco.conexoes || bloco.conexoes.length === 0) {
        throw new Error('Conexões não encontradas');
    }
    const conexao = bloco.conexoes[0];
    if (conexao.alvo_id !== 'test-002') {
        throw new Error('Alvo de conexão inválido');
    }
}
async function testeMetadados() {
    const metaIndices = await getMeta('indices_blocos');
    if (!metaIndices) {
        throw new Error('Metadados de índices não encontrados');
    }
}
async function testeExportarBackup() {
    const backup = await exportarBackup();
    if (!backup.blocos || backup.blocos.length === 0) {
        throw new Error('Backup não contém blocos');
    }
    if (!backup.timestamp) {
        throw new Error('Backup não contém timestamp');
    }
}
async function testeLimpeza() {
    // Limpar dados de teste
    await db.blocos.bulkDelete(blocosTeste.map((b) => b.resumo_id));
    const count = await db.blocos.count();
    if (count > 0) {
        throw new Error('Blocos de teste não foram removidos');
    }
}
// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════
export const suiteIntegracaoDexie = {
    nome: 'Integração Dexie v3',
    testes: [
        { id: 'integracao', nome: 'Integração de blocos', executar: testeIntegracaoBlocos },
        { id: 'busca_disciplina', nome: 'Busca por disciplina', executar: testeBuscaPorDisciplina },
        { id: 'busca_tag', nome: 'Busca por tag', executar: testeBuscaPorTag },
        { id: 'busca_semestre', nome: 'Busca por semestre', executar: testeBuscaPorSemestre },
        { id: 'busca_id', nome: 'Busca por ID', executar: testeBuscaPorID },
        { id: 'listar_disciplinas', nome: 'Listar disciplinas', executar: testeListarDisciplinas },
        { id: 'listar_tags', nome: 'Listar tags', executar: testeListarTags },
        { id: 'estatisticas', nome: 'Obter estatísticas', executar: testeEstatisticas },
        {
            id: 'pai_filho',
            nome: 'Relacionamento pai-filho',
            executar: testeRelacionamentoPaiFilho,
        },
        { id: 'conexoes', nome: 'Conexões entre blocos', executar: testeConexoes },
        { id: 'metadados', nome: 'Metadados de índices', executar: testeMetadados },
        { id: 'backup', nome: 'Exportar backup', executar: testeExportarBackup },
        { id: 'limpeza', nome: 'Limpeza de dados de teste', executar: testeLimpeza },
    ],
};
/**
 * Executa a suite de testes e retorna resultados
 */
export async function executarSuite(suite, onProgress) {
    const resultado = {
        suite: suite.nome,
        total: suite.testes.length,
        passou: 0,
        falhou: 0,
        tempo_total_ms: 0,
        testes: [],
    };
    const inicioSuite = performance.now();
    for (const teste of suite.testes) {
        const inicioTeste = performance.now();
        let passou = false;
        let erro = undefined;
        try {
            await teste.executar();
            passou = true;
        }
        catch (e) {
            erro = String(e);
        }
        const tempoTeste = performance.now() - inicioTeste;
        const resultadoTeste = {
            id: teste.id,
            nome: teste.nome,
            passou,
            tempo_ms: tempoTeste,
            erro,
        };
        resultado.testes.push(resultadoTeste);
        if (passou) {
            resultado.passou++;
        }
        else {
            resultado.falhou++;
        }
        if (onProgress) {
            onProgress(resultadoTeste);
        }
    }
    resultado.tempo_total_ms = performance.now() - inicioSuite;
    return resultado;
}
/**
 * Formata resultado para exibição no console
 */
export function formatarResultadoSuite(resultado) {
    const linhas = [];
    linhas.push(`\n═══════════════════════════════════════════════════════════`);
    linhas.push(`SUITE: ${resultado.suite}`);
    linhas.push(`═══════════════════════════════════════════════════════════`);
    linhas.push(`Total: ${resultado.total} | Passou: ${resultado.passou} | Falhou: ${resultado.falhou}`);
    linhas.push(`Tempo total: ${resultado.tempo_total_ms.toFixed(2)}ms\n`);
    for (const teste of resultado.testes) {
        const status = teste.passou ? '✓' : '✗';
        linhas.push(`${status} ${teste.nome} (${teste.tempo_ms.toFixed(2)}ms)`);
        if (teste.erro) {
            linhas.push(`  Erro: ${teste.erro}`);
        }
    }
    linhas.push(`\n═══════════════════════════════════════════════════════════\n`);
    return linhas.join('\n');
}
