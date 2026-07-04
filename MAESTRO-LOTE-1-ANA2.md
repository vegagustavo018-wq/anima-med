# 🎭 PROMPT MAESTRO — LOTE 1 ANATOMIA II

> Cole isto num chat DEDICADO na pasta `C:\Users\vegag\.claude\anima\med`.  
> Este chat produz APENAS os primeiros 8 blocos de Anatomia II (ANA2).

---

## BLOCO A (RAIZ — SEM DEPENDÊNCIAS)

Você vai gerar 8 blocos ANIMA Med de qualidade máxima, começando pela raiz e depois seus filhos diretos. **Ordem de produção é crítica.**

### Bloco 1: `s2-ana2-00-000` — Anatomia II — Visão Geral da Disciplina

**Contexto do blueprint:**
```json
{
  "id": "s2-ana2-00-000",
  "titulo": "Anatomia II — Visão Geral da Disciplina",
  "no_pai_id": null,
  "nivel": "disciplina",
  "escopo": "Do locomotor às vísceras: por que estudar órgãos internos, pelve e cérebro",
  "lentes": ["funcao_fisiologia", "relacoes_topografia"],
  "profundidade": 1,
  "disciplina_id": "ana2"
}
```

**Sua tarefa:**
1. Leia `AGENTES/01-agente-produtor-bloco.md` — este é o prompt do produtor (você é o produtor)
2. Leia `FILOSOFIA-ANIMA.md` ou use memória `anima_filosofia.md` — inviolável
3. Leia o bloco canônico `s1-hist-02-001` (se disponível) como padrão-ouro
4. Gere o bloco seguindo as **8 etapas ANIMA** em prosa:
   - ① POR QUE EXISTE: problema biológico que criou a necessidade de estudar vísceras
   - ② COMO SE RESOLVE: solução sem nomear ainda
   - ③ DO QUE É FEITO: composição (órgãos internos, aparelhos)
   - ④ COMO FUNCIONA: mecanismo integrado
   - ⑤ COM O QUE SE ARTICULA: dependências (locomotor, endócrino, etc)
   - ⑥ NOME + ETIMOLOGIA: "Anatomia" (ana+tomé), "Víscera" (latim viscera)
   - ⑦ ANALOGIA CONCRETA: dia a dia, com mapeamento explícito
   - ⑧ IMAGEM: descrição + prompt IA

5. **Retorne APENAS JSON válido** (sem markdown, sem explicação):

```json
{
  "resumo_id": "s2-ana2-00-000",
  "no_pai_id": null,
  "metadata": {
    "titulo": "Anatomia II — Visão Geral da Disciplina",
    "semestre": 2,
    "disciplina": "Anatomia II — Vísceras, Pelve e Neuroanatomia",
    "profundidade_arvore": 1,
    "importancia": 3,
    "dificuldade": 2,
    "tempo_leitura_minutos": 10,
    "status": "pronto",
    "data_criacao": "2026-07-03",
    "versao": "1.0",
    "tags": ["ana2", "disciplina", "visao-geral"],
    "nivel": "CORE",
    "tipo": "conceito"
  },
  "resumo_conciso": "Você estudou o esqueleto, músculos e articulações — a máquina do movimento. Agora os órgãos internos: por que a natureza criou estruturas invisíveis para trocas, digestão, excrição e reprodução.",
  "narrativa": [
    { "tipo": "texto", "conteudo": "No semestre anterior, você aprendeu a máquina do movimento: ossos, músculos, articulações... (continue com as 8 etapas)" },
    { "tipo": "secao", "titulo": "Por que estudar órgãos internos?" },
    ...
  ],
  "flashcards": [
    { "card_id": "ana2-00-000-fc1", "tipo": "por_que", "pergunta": "Por que um corpo precisa de órgãos além do esqueleto?", "resposta": "...", "dificuldade": 2, "nivel_alvo": 2 },
    ...
  ],
  "casos_clinicos": [],
  "conexoes": {
    "prerequisitos": [
      { "bloco_id": "s1-ana-02-000", "titulo": "Tecido Muscular Esquelético", "relevancia": "base_necessaria" }
    ],
    "futuras": [
      { "tipo": "CASCATA_CAUSAL", "topico": "Síndrome de compressão visceral", "mecanismo_conexao": "órgãos em cavidade fechada" },
      { "tipo": "ALVO_TERAPEUTICO", "topico": "Cirurgias abdominais", "mecanismo_conexao": "acesso anatomicamente exato" },
      { "tipo": "RECONHECIMENTO_CLINICO", "topico": "Semiologia abdominal", "mecanismo_conexao": "palpação de órgãos e cavidades" }
    ],
    "laterais": []
  },
  "midia": {
    "imagens": [
      {
        "titulo": "Cavidades corporais — vista sagital",
        "descricao": "Seção mediana do corpo humano mostrando caixa torácica, cavidade abdominal, pelve",
        "prompt_ia": "Diagrama anatômico sagital do corpo humano mostrando as 3 cavidades (torácica, abdominal, pélvica) com órgãos principais destacados...",
        "origem": "esquema"
      }
    ],
    "videos": [],
    "audios": []
  },
  "horizonte_validade": "estavel",
  "estado_ciclo_vida": "pronto",
  "nivel_aceitacao": "completo"
}
```

---

### Blocos 2-8: Filhos diretos da raiz

Após GERAR e REVISAR o bloco 1, continue com:

- **Bloco 2:** `s2-ana2-00-001` — O Que É uma Víscera e Por Que Elas Existem
- **Bloco 3:** `s2-ana2-00-002` — Cavidades Corporais e Serosas
- **Bloco 4:** `s2-ana2-01-000` — Sistema Cardiovascular — Visão Geral
- **Bloco 5:** `s2-ana2-01-100` — Coração — Visão Geral
- **Bloco 6:** `s2-ana2-01-110` — Câmaras Cardíacas — Visão Geral (IMPORTANTE: agrupa filhos no próximo lote)
- **Bloco 7:** `s2-ana2-01-120` — Válvulas Cardíacas — Visão Geral (IMPORTANTE: agrupa filhos no próximo lote)
- **Bloco 8:** `s2-ana2-01-130` — Parede do Coração e Pericárdio

Cada um desses blocos **lê seu pai** (arquivo JSON em `public/blocos/ana2/{id_pai}.json`) e referencia-o na narrativa SEM repetir.

---

## PIPELINE OBRIGATÓRIO

Após gerar cada bloco:

1. **PRODUÇÃO** → Bloco em JSON
2. **REVISÃO** (paralelo):
   - Juiz Pedagogia (AGENTES/02, §1)
   - Juiz Precisão Médica (AGENTES/02, §2)
   - Juiz Estética (AGENTES/02, §3)
   - Adversarial — cético (AGENTES/02, §4)
3. **INTEGRAÇÃO** (AGENTES/02, §5):
   - Decisão: APROVAR (se notas ≥7 + adversarial ok) ou REVISAR
   - Se REVISAR: aplique correções + re-julgue
4. **GRAVA**: `public/blocos/ana2/{id}.json` (JSON completo)

---

## CHECKLIST ANTES DE COMEÇAR

- [ ] Ler `AGENTES/01-agente-produtor-bloco.md`
- [ ] Ler `AGENTES/02-agentes-revisores.md`
- [ ] Ler memória `anima_filosofia.md` (Filosofia ANIMA)
- [ ] Ler memória `anima_bloco_canonico.md` (padrão-ouro)
- [ ] Ler `AGENTES/06-estilo-e-marca.md` (instruções de imagem, se gerar)
- [ ] Confirmar pasta de trabalho: `C:\Users\vegag\.claude\anima\med`

---

## GUARDRAILS

✅ **Fazer:**
- Respeitar escopo: 1 bloco = 1 tema
- Produzir PAI antes FILHOS
- Ler contexto do pai se houver
- Marcar incertezas: `[⚠️]`
- Labeling imagens: `◇ esquema | ⚠ IA | ✓ real`
- Conexões REAIS (mecanismo, alvo farmacológico, clinicamente reconhecível)

❌ **Não fazer:**
- Nomear antes de contextualizar
- Editar `src/core/db|srs|store`
- Gravar antes de APROVAR
- Listas secas em prosa

---

## APÓS ESTE LOTE

```bash
cd public/blocos/ana2
# Verificar que os 8 arquivos foram criados
ls -l s2-ana2-00-000.json s2-ana2-00-001.json ... s2-ana2-01-130.json

# Gerar manifesto
cd ../..
npm run manifesto
```

---

**Comece agora:** Cole os 8 blocos acima como próxima mensagem e rode o pipeline.

Boa sorte! 🚀
