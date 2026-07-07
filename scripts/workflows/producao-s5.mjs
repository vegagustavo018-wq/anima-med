export const meta = {
  name: 'anima-s5-producao',
  description: 'Produz e valida blocos ANIMA do Semestre 5 (produtor -> 3 juizes || adversarial -> correcao -> gravacao)',
  phases: [
    { title: 'Produção' },
    { title: 'Revisão' },
    { title: 'Correção' },
    { title: 'Gravação' },
  ],
}

// args = { blocos: [{id,titulo,no_pai_id,nivel,escopo,lentes,disciplina_id,disciplina_nome,abrev}], incluirAmostra?: bool }
let ARGS = args
if (typeof ARGS === 'string') {
  try { ARGS = JSON.parse(ARGS) } catch (e) { throw new Error(`args veio como string e não parseou: ${ARGS.slice(0, 300)}`) }
}
const BLOCOS = Array.isArray(ARGS) ? ARGS : (ARGS && Array.isArray(ARGS.blocos) ? ARGS.blocos : null)
if (!Array.isArray(BLOCOS)) {
  throw new Error(`args.blocos não é um array. args=${JSON.stringify(ARGS).slice(0, 500)}`)
}
const INCLUIR_AMOSTRA = !!(ARGS && ARGS.incluirAmostra)
const RAIZ = 'C:/Users/vegag/.claude/anima/med'

const REGRAS_ANIMA = `Você é um redator médico-pedagógico da ANIMA. Escreve UM bloco de estudo médico seguindo a Filosofia ANIMA (constituição pedagógica inegociável do projeto).

## As 8 etapas (INVIOLÁVEIS, nesta ordem, em prosa — nunca em lista seca)
① POR QUE EXISTE — abra com o problema (clínico/legal/biológico) que motiva este conceito. Nunca com definição.
② COMO SE RESOLVE — a solução, ainda sem nomear o termo técnico.
③ DO QUE É FEITO — composição/base (molecular, legal, processual — o que for pertinente ao tema).
④ COMO FUNCIONA — mecanismo ou procedimento, em movimento, passo a passo.
⑤ COM O QUE SE ARTICULA — dependências e conexões com outros conceitos/estruturas.
⑥ NOME + ETIMOLOGIA — só agora o nome; etimologia como mnemônica ativa.
⑦ ANALOGIA CONCRETA — do dia a dia, com mapeamento explícito (o que corresponde a quê; onde a analogia quebra).
⑧ IMAGEM — quando pertinente: descrição do que ilustrar + prompt pronto para IA.

## Regras de qualidade (não-negociáveis)
- Um tema = um bloco. Se o escopo tiver mais de um conceito separável, escreva só o principal e liste os demais em conexoes.futuras — NUNCA invente blocos-filhos que não existem no currículo.
- Prosa causal, parágrafos de 3-6 linhas. Proibido lista seca sem causa-efeito no corpo do texto.
- Nomenclatura BR. Incertezas marcadas com [⚠️]. Conexões futuras devem ser REAIS (mesmo mecanismo/alvo/cascata/base legal), nunca fabricadas.
- Molecular ou processual quando couber: nomeie proteínas/mecanismos específicos (fisiopatologia/farmacologia) ou dispositivos legais específicos (medicina legal: artigos de lei, códigos, resoluções — quando genuinamente aplicável, marcando [⚠️] se a citação legal não puder ser verificada com certeza).
- Armadilhas conceituais explicitadas quando um nome/situação engana.
- Componentes adaptativos: só inclua flashcards/casos/tabela quando agregam valor real. Um bloco conceitual introdutório pode ter só narrativa + conexões.
- Subtítulos (tipo 'secao') no formato pergunta/provocação, nunca genéricos ("Introdução", "Considerações").
- Continuidade pedagógica: se o bloco pai já tem conteúdo real, referencie-o brevemente na abertura sem reexplicar.

## Teste final antes de entregar
Ao fim do bloco, o aluno consegue explicar esse conceito exato numa conversa de café — nem mais, nem menos. Se você "inventou" um flashcard ou caso clínico só porque o schema pedia, tire-o.

## conexoes — atenção ao significado exato de cada lista
- prerequisitos: blocos ANTERIORES (de qualquer semestre já cursado) que o aluno precisa ter visto antes. Use bloco_id real quando souber, ou omita o array se não houver nenhum claro.
- futuras: conexões para FRENTE — um tópico de OUTRA disciplina/semestre futuro que este conceito vai reencontrar (ex: uma lesão histológica que vira critério diagnóstico em Patologia no semestre 6, um mecanismo que vira alvo de fármaco em Farmacologia). NÃO é a lista dos blocos-filhos deste mesmo tópico dentro da mesma disciplina — isso já está em nos_filhos_ids. Cada item precisa de tipo (um dos 4 enums), disciplina de destino, semestre_futuro (número) e mecanismo_conexao explicando o elo causal real.
- laterais: blocos IRMÃOS (mesma disciplina/semestre) que contrastam ou exemplificam em paralelo — não confundir com filhos.
- Se não houver conexão futura genuína e verificável, deixe o array futuras vazio ao invés de inventar uma.

## Preenchimento de metadata/procedência (obrigatório)
- metadata.status = "completo", metadata.versao = "1.0", metadata.data_criacao = metadata.data_ultima_revisao = "2026-07-05".
- metadata.tempo_leitura_minutos, importancia (1-5), dificuldade (1-5): valores reais, nunca 0/placeholder.
- metadata.tags: 3-6 tags temáticas relevantes (não apenas o nome da disciplina).
- procedencia.gerado_por = "claude-sonnet-5 (pipeline ANIMA)", procedencia.data_geracao = "2026-07-05", procedencia.nivel_confianca = "estudo".
- fontes: cite 1-3 fontes reais e verificáveis (livros-texto consagrados da área, com capítulo).
- estado_ciclo_vida = "rascunho". nivel_aceitacao = "completo" se atingir o checklist ANIMA inteiro, senão "minimo_viavel".
- horizonte_validade = "estavel", salvo temas que mudam rápido (protocolos, legislação recente) → "em_mudanca".`

function ctxBloco(b) {
  return `ID: ${b.id}
Título: ${b.titulo}
Disciplina: ${b.disciplina_nome} (${b.disciplina_id}), Semestre 5
Nível curricular do bloco: ${b.nivel}
Bloco pai: ${b.no_pai_id || '(nenhum — bloco raiz da disciplina)'}
Escopo (respeite fielmente — não invada o escopo de blocos irmãos): ${b.escopo}
Lentes pedagógicas dominantes: ${(b.lentes || []).join(', ')}`
}

function pathBloco(b) {
  return `${RAIZ}/public/blocos/${b.abrev}/${b.id}.json`
}

function PROMPT_PRODUTOR(b) {
  const path = pathBloco(b)
  const paiPath = b.no_pai_id ? `${RAIZ}/public/blocos/${b.abrev}/${b.no_pai_id}.json` : null
  return `${REGRAS_ANIMA}

## Seu bloco
${ctxBloco(b)}

## Antes de escrever
1. Leia o próprio esqueleto em ${path} (tool Read) — copie exatamente nos_filhos_ids e metadata.disciplina de lá para o bloco final.
${paiPath ? `2. Tente ler o bloco PAI em ${paiPath} (tool Read). Se metadata.status desse arquivo for "completo", leia a narrativa e referencie-a brevemente na abertura, sem reexplicar. Se ainda for "esqueleto", prossiga só com o escopo curricular acima.` : '2. Este é o bloco raiz da disciplina — não há pai para ler.'}

## Gate de granularidade
Se o escopo acima contém mais de um conceito que caiba num quadro-branco separado, escreva só o principal e registre os demais em conexoes.futuras.

Preencha e retorne o bloco completo pelo schema fornecido.`
}

function JUIZ_PEDAGOGIA(bloco, b) {
  return `Você avalia SÓ a pedagogia do bloco ANIMA "${b.id}" (${b.titulo}). Bloco completo (JSON):
${JSON.stringify(bloco)}

Verifique: segue as 8 etapas na ordem (problema antes de definição, nome só após etimologia)? Narrativa em espiral e causal (não listas soltas)? Analogia com mapeamento explícito (quando presente)? Flashcards variados e só onde agregam? Caso clínico (se houver) com cascata de 5 etapas (Causa→Estrutura Afetada→Disfunção→Sintoma→Consequência)? Continuidade com o pai quando aplicável? Subtítulos como pergunta/provocação, nunca genéricos?

Retorne { dimensao: "pedagogia", nota: 0-10, problemas: [...], correcoes_sugeridas: [...] }`
}

function JUIZ_PRECISAO(bloco, b) {
  return `Você avalia SÓ a precisão/exatidão do bloco ANIMA "${b.id}" (${b.titulo}). Bloco completo (JSON):
${JSON.stringify(bloco)}

Verifique: fatos corretos, mecanismos/procedimentos bem sequenciados? Nomenclatura BR, proporções/valores realistas? Se citar lei/artigo/CID/proteína específica, está correto e plausível? Conexões futuras são REAIS (mesmo mecanismo/alvo/base legal) ou parecem inventadas? Incertezas marcadas com [⚠️] onde há debate ou dado não verificável?

Retorne { dimensao: "precisao", nota: 0-10, problemas: [...erros factuais...], correcoes_sugeridas: [...] }`
}

function JUIZ_ESTETICA(bloco, b) {
  return `Você avalia SÓ clareza/experiência do bloco ANIMA "${b.id}" (${b.titulo}). Bloco completo (JSON):
${JSON.stringify(bloco)}

Verifique: linguagem clara, parágrafos que respiram (3-6 linhas)? Hierarquia visual boa (seções, pausas, um highlight)? Títulos descritivos? Flashcards/casos atraentes, não burocráticos?

Retorne { dimensao: "estetica", nota: 0-10, problemas: [...], correcoes_sugeridas: [...] }`
}

function ADVERSARIAL(bloco, b) {
  return `Você é um crítico cético revisando o bloco ANIMA "${b.id}" (${b.titulo}). Seu trabalho é tentar REFUTAR o bloco. Bloco completo (JSON):
${JSON.stringify(bloco)}

Procure ativamente: nomeia antes de contextualizar? Listas em prosa sem causa-efeito? Analogia decorativa (não mapeia de verdade)? Fato duvidoso, datado, ou citação legal/técnica implausível? Flashcard inventado/redundante? Caso clínico sem uma das 5 etapas? Conexão futura fabricada? Escopo do bloco invadindo tema de bloco irmão?

Default: refutado=true se houver dúvida real. Retorne { refutado: bool, severidade: "critica"|"alta"|"media"|"baixa"|"nenhuma", violacoes: [...], veredito: "..." }`
}

function PROMPT_CORRECAO(b, bloco, pareceres) {
  const problemas = [
    ...pareceres.ped.problemas.map((p) => `[pedagogia] ${p}`),
    ...pareceres.pre.problemas.map((p) => `[precisão] ${p}`),
    ...pareceres.est.problemas.map((p) => `[estética] ${p}`),
    ...(pareceres.adv.refutado ? pareceres.adv.violacoes.map((v) => `[adversarial-${pareceres.adv.severidade}] ${v}`) : []),
  ]
  const correcoes = [
    ...pareceres.ped.correcoes_sugeridas,
    ...pareceres.pre.correcoes_sugeridas,
    ...pareceres.est.correcoes_sugeridas,
  ]
  return `${REGRAS_ANIMA}

## Tarefa: CORRIGIR o bloco "${b.id}" (${b.titulo}) — não reescrever do zero
Bloco atual (JSON):
${JSON.stringify(bloco)}

## Problemas apontados pelos revisores
${problemas.map((p) => `- ${p}`).join('\n') || '(nenhum problema específico listado — revise contra a Filosofia ANIMA)'}

## Correções sugeridas
${correcoes.map((c) => `- ${c}`).join('\n') || '(aplique seu próprio julgamento contra as regras acima)'}

Aplique as correções mantendo tudo que já está correto. Retorne o bloco CORRIGIDO completo pelo schema.`
}

function PROMPT_GRAVAR(id, abrev, blocoFinal) {
  const path = `${RAIZ}/public/blocos/${abrev}/${id}.json`
  return `Grave exatamente este conteúdo JSON (não modifique nada, não reformate o conteúdo) no arquivo "${path}" usando a tool Write. Conteúdo completo:

${JSON.stringify(blocoFinal, null, 2)}

Após gravar com sucesso, retorne { ok: true }. Se falhar, retorne { ok: false }.`
}

const BLOCO_SCHEMA = {
  type: 'object',
  properties: {
    resumo_id: { type: 'string' },
    no_pai_id: { type: ['string', 'null'] },
    nos_filhos_ids: { type: 'array', items: { type: 'string' } },
    conexoes_laterais_ids: { type: 'array', items: { type: 'string' } },
    metadata: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        subtitulo: { type: 'string' },
        semestre: { type: 'number' },
        disciplina: { type: 'string' },
        profundidade_arvore: { type: 'number' },
        importancia: { type: 'number' },
        dificuldade: { type: 'number' },
        tempo_leitura_minutos: { type: 'number' },
        status: { type: 'string' },
        data_criacao: { type: 'string' },
        data_ultima_revisao: { type: 'string' },
        versao: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        nivel: { type: 'string' },
        tipo: { type: 'string' },
      },
      required: ['titulo', 'semestre', 'disciplina', 'status', 'tags'],
    },
    resumo_conciso: { type: 'string' },
    narrativa: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['texto', 'secao', 'pausa', 'highlight', 'contrafactual', 'analogia', 'etimologia', 'imagem', 'passo_a_passo', 'tabela_comparativa'] },
          conteudo: { type: 'string' },
          titulo: { type: 'string' },
          icone: { type: 'string' },
          termo: { type: 'string' },
          origem: { type: 'string' },
          significado: { type: 'string' },
          explicacao: { type: 'string' },
          pergunta: { type: 'string' },
          resposta: { type: 'string' },
          descricao: { type: 'string' },
          prompt_ia: { type: 'string' },
          url: { type: ['string', 'null'] },
          passos: { type: 'array', items: { type: 'object', properties: { numero: { type: 'number' }, titulo: { type: 'string' }, explicacao: { type: 'string' } }, required: ['numero', 'titulo', 'explicacao'] } },
          colunas: { type: 'array', items: { type: 'string' } },
          linhas: { type: 'array', items: { type: 'object', additionalProperties: true } },
        },
        required: ['tipo'],
      },
    },
    conexoes: {
      type: 'object',
      properties: {
        prerequisitos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bloco_id: { type: 'string' }, titulo: { type: 'string' }, disciplina: { type: 'string' },
              semestre: { type: 'number' }, relevancia: { type: 'string', enum: ['base_necessaria', 'complementar'] },
              explicacao: { type: 'string' },
            },
            required: ['bloco_id', 'titulo', 'disciplina', 'semestre', 'relevancia', 'explicacao'],
          },
        },
        futuras: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: ['CASCATA_CAUSAL', 'ALVO_TERAPEUTICO', 'RECONHECIMENTO_CLINICO', 'MECANISMO_COMPARTILHADO'] },
              bloco_id_destino: { type: ['string', 'null'] },
              disciplina: { type: 'string' }, semestre_futuro: { type: 'number' },
              topico: { type: 'string' }, mecanismo_conexao: { type: 'string' },
            },
            required: ['tipo', 'disciplina', 'semestre_futuro', 'topico', 'mecanismo_conexao'],
          },
        },
        laterais: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bloco_id: { type: 'string' },
              tipo_relacao: { type: 'string', enum: ['ANALOGIA', 'CONTRASTE', 'EXEMPLO_PARALELO'] },
              explicacao: { type: 'string' },
            },
            required: ['bloco_id', 'tipo_relacao', 'explicacao'],
          },
        },
      },
      required: ['prerequisitos', 'futuras', 'laterais'],
    },
    flashcards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          card_id: { type: 'string' }, pergunta: { type: 'string' }, resposta: { type: 'string' },
          tipo: { type: 'string', enum: ['por_que', 'mecanismo', 'contrafactual', 'clinico', 'comparacao', 'armadilha', 'sintese_transdisciplinar', 'etimologia', 'cloze'] },
          dificuldade: { type: 'number' }, nivel_alvo: { type: 'number' }, tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['card_id', 'pergunta', 'resposta', 'tipo', 'dificuldade', 'nivel_alvo', 'tags'],
      },
    },
    casos_clinicos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          caso_id: { type: 'string' }, titulo: { type: 'string' }, apresentacao: { type: 'string' },
          cascata: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                etapa: { type: 'string', enum: ['Causa', 'Estrutura Afetada', 'Disfunção', 'Sintoma', 'Consequência'] },
                descricao: { type: 'string' },
              },
              required: ['etapa', 'descricao'],
            },
          },
          conexao_com_bloco: { type: 'string' }, disciplinas_relacionadas: { type: 'array', items: { type: 'string' } },
          diagnostico_revelado: { type: 'string' }, tratamento_resumido: { type: 'string' },
        },
        required: ['caso_id', 'titulo', 'apresentacao', 'cascata', 'conexao_com_bloco', 'disciplinas_relacionadas', 'diagnostico_revelado', 'tratamento_resumido'],
      },
    },
    midia: {
      type: 'object',
      properties: {
        imagens: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' }, url: { type: ['string', 'null'] }, prompt_ia: { type: 'string' },
              status: { type: 'string', enum: ['gerada', 'pendente'] },
              origem: { type: 'string', enum: ['esquema', 'ia', 'real'] },
              titulo: { type: 'string' }, descricao: { type: 'string' },
            },
            required: ['id', 'url', 'prompt_ia', 'status'],
          },
        },
        videos: { type: 'array', items: { type: 'object', additionalProperties: true } },
        audios: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
      required: ['imagens', 'videos', 'audios'],
    },
    horizonte_validade: { type: 'string' },
    estado_ciclo_vida: { type: 'string' },
    nivel_aceitacao: { type: 'string' },
    procedencia: {
      type: 'object',
      properties: {
        gerado_por: { type: 'string' }, data_geracao: { type: 'string' },
        revisado_por: { type: ['string', 'null'] }, data_revisao: { type: ['string', 'null'] },
        nivel_confianca: { type: 'string', enum: ['rascunho', 'estudo', 'clinica'] },
      },
      required: ['gerado_por', 'data_geracao', 'nivel_confianca'],
    },
    fontes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string' }, citacao: { type: 'string' },
          forca_evidencia: { type: 'string' }, data_acesso: { type: 'string' },
        },
        required: ['tipo', 'citacao'],
      },
    },
  },
  required: [
    'resumo_id', 'no_pai_id', 'nos_filhos_ids', 'metadata', 'resumo_conciso',
    'narrativa', 'conexoes', 'flashcards', 'casos_clinicos', 'midia', 'procedencia', 'fontes',
  ],
}

const PARECER_SCHEMA = {
  type: 'object',
  properties: {
    dimensao: { type: 'string' },
    nota: { type: 'number' },
    problemas: { type: 'array', items: { type: 'string' } },
    correcoes_sugeridas: { type: 'array', items: { type: 'string' } },
  },
  required: ['dimensao', 'nota', 'problemas', 'correcoes_sugeridas'],
}

const VEREDITO_SCHEMA = {
  type: 'object',
  properties: {
    refutado: { type: 'boolean' },
    severidade: { type: 'string' },
    violacoes: { type: 'array', items: { type: 'string' } },
    veredito: { type: 'string' },
  },
  required: ['refutado', 'severidade', 'violacoes', 'veredito'],
}

const GRAVAR_SCHEMA = { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] }

function decidir(ped, pre, est, adv) {
  const notasOk = ped.nota >= 7 && pre.nota >= 7 && est.nota >= 7
  const advOk = !(adv.refutado && (adv.severidade === 'critica' || adv.severidade === 'alta'))
  return notasOk && advOk ? 'APROVAR' : 'REVISAR'
}

async function agentComRetry(prompt, opts, tentativas = 2) {
  let r = null
  for (let i = 0; i < tentativas && !r; i++) {
    r = await agent(prompt, opts)
  }
  return r
}

async function julgar(bloco, b) {
  // sequencial (não paralelo) para não disparar rajadas de requisições simultâneas
  const ped = await agentComRetry(JUIZ_PEDAGOGIA(bloco, b), { phase: 'Revisão', schema: PARECER_SCHEMA, label: `ped:${b.id}`, effort: 'medium' })
    ?? { dimensao: 'pedagogia', nota: 0, problemas: ['juiz falhou (erro de API) — tratado como reprovado por segurança'], correcoes_sugeridas: [] }
  const pre = await agentComRetry(JUIZ_PRECISAO(bloco, b), { phase: 'Revisão', schema: PARECER_SCHEMA, label: `pre:${b.id}`, effort: 'medium' })
    ?? { dimensao: 'precisao', nota: 0, problemas: ['juiz falhou (erro de API) — tratado como reprovado por segurança'], correcoes_sugeridas: [] }
  const est = await agentComRetry(JUIZ_ESTETICA(bloco, b), { phase: 'Revisão', schema: PARECER_SCHEMA, label: `est:${b.id}`, effort: 'medium' })
    ?? { dimensao: 'estetica', nota: 0, problemas: ['juiz falhou (erro de API) — tratado como reprovado por segurança'], correcoes_sugeridas: [] }
  const adv = await agentComRetry(ADVERSARIAL(bloco, b), { phase: 'Revisão', schema: VEREDITO_SCHEMA, label: `adv:${b.id}`, effort: 'medium' })
    ?? { refutado: true, severidade: 'alta', violacoes: ['adversarial falhou (erro de API) — tratado como refutado por segurança'], veredito: 'falha técnica' }
  return { ped, pre, est, adv }
}

const resultados = await pipeline(
  BLOCOS,
  (b) => agentComRetry(PROMPT_PRODUTOR(b), { label: `prod:${b.id}`, phase: 'Produção', schema: BLOCO_SCHEMA, effort: 'high' }),
  async (bloco, b) => {
    if (!bloco) return { id: b.id, abrev: b.abrev, decisao: 'FALHA_PRODUCAO' }
    let atual = bloco
    let pareceres = await julgar(atual, b)
    let decisao = decidir(pareceres.ped, pareceres.pre, pareceres.est, pareceres.adv)
    let ciclos = 0
    while (decisao === 'REVISAR' && ciclos < 2) {
      const corrigido = await agentComRetry(PROMPT_CORRECAO(b, atual, pareceres), {
        label: `fix:${b.id}`, phase: 'Correção', schema: BLOCO_SCHEMA, effort: 'high',
      })
      if (!corrigido) break
      atual = corrigido
      pareceres = await julgar(atual, b)
      decisao = decidir(pareceres.ped, pareceres.pre, pareceres.est, pareceres.adv)
      ciclos++
    }
    return {
      id: b.id, abrev: b.abrev, decisao, ciclos, bloco: decisao === 'APROVAR' ? atual : null,
      notas: { ped: pareceres.ped.nota, pre: pareceres.pre.nota, est: pareceres.est.nota },
      adv_refutado: pareceres.adv.refutado, adv_severidade: pareceres.adv.severidade,
      problemas_finais: decisao !== 'APROVAR'
        ? [...pareceres.ped.problemas, ...pareceres.pre.problemas, ...pareceres.est.problemas, ...pareceres.adv.violacoes]
        : [],
    }
  }
)

const aprovados = resultados.filter((r) => r && r.decisao === 'APROVAR')
const naoAprovados = resultados.filter((r) => r && r.decisao !== 'APROVAR')

await parallel(
  aprovados.map((r) => () =>
    agent(PROMPT_GRAVAR(r.id, r.abrev, r.bloco), { phase: 'Gravação', label: `grava:${r.id}`, schema: GRAVAR_SCHEMA, effort: 'low' })
  )
)

log(`${aprovados.length}/${BLOCOS.length} blocos aprovados e gravados. ${naoAprovados.length} precisam de atenção humana.`)

return {
  total: BLOCOS.length,
  aprovados: aprovados.length,
  aprovados_ids: aprovados.map((r) => ({ id: r.id, ciclos: r.ciclos, notas: r.notas })),
  precisa_humano: naoAprovados.map((r) => ({
    id: r.id, decisao: r.decisao, ciclos: r.ciclos, notas: r.notas,
    adv_refutado: r.adv_refutado, adv_severidade: r.adv_severidade, problemas: r.problemas_finais,
  })),
  amostra: INCLUIR_AMOSTRA && aprovados[0] ? aprovados[0].bloco : null,
}
