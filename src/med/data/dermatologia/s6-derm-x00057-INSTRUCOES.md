# Bloco ANIMA S6 Derm 57 — Instruções de Preenchimento

**Arquivo JSON:** `s6-derm-x00057.json`  
**Status:** Template vazio v3.0  
**Data de criação:** 2026-07-04  
**Schema:** ANIMA Filosofia v1.0 + JSON v3.0

---

## O que é este arquivo?

Arquivo JSON estruturado para receber conteúdo de um novo bloco dermatológico seguindo rigorosamente a filosofia pedagógica ANIMA. Este é um **template vazio** que serve como guia estrutural para preenchimento futuro.

---

## Estrutura do JSON (campos principais)

### 1. **Metadata** (obrigatório)
- `resumo_id`: ID único do bloco (s6-derm-x00057)
- `no_pai_id`: ID do bloco pai na árvore hierárquica
- `semestre`, `disciplina`, `profundidade_arvore`
- `status`: "template_vazio" → "em_progresso" → "completo"
- `data_criacao`, `data_revisao`, `procedencia`, `horizonte_validade`
- `revisores`: lista de revisores

### 2. **resumo_conciso** (obrigatório)
- 200-300 palavras em narrativa contínua
- Não é lista — é prosa narrativa
- Explica o problema biológico que a estrutura resolve
- Apresenta conexões clínicas
- **Como não fazer:** Não abrir com definição; não enumerar componentes

### 3. **narrativa** (obrigatório)
Array de blocos de conteúdo com tipos:
- `secao` (nível 1 ou 2): títulos grandes que estruturam o bloco
- `texto`: parágrafos de 3-6 linhas em narrativa contínua
- `highlight`: regra crítica, conceito essencial (frase ou duas)
- `pausa`: consolidação de conceitos, reflexão
- `analogia`: comparação concreta com dia a dia
- `etimologia`: origem do termo, mapeamento linguístico
- `imagem`: descrição e prompt para IA gerar visual
- `tabela_comparativa`: quando tema é comparativo por natureza
- `contrafactual`: imaginação inversa ("e se não existisse?")
- `passo_a_passo`: sequência de etapas (quando aplicável)

**Estrutura narrativa esperada (em ordem):**
1. Seção 1: Que problema resolve? (contexto familiar, sem definição)
2. Texto: Expande contexto, importância
3. Seção 2: Do que é feito? (composição estrutural + bases moleculares)
4. Texto: Por que esse material? Propriedades biofísicas
5. Seção 3: Mecanismo — Como funciona?
6. Texto: Articulações com estruturas vizinhas
7. Highlight: Regra crítica
8. Seção 4: Nome e etimologia
9. Etimologia: Detalhamento de raízes
10. Analogia: Comparação concreta
11. Pausa: Mapeamento da analogia
12. Seção 5: Articulações clínicas — Quando falha?
13. Texto: Disfunção e clínica
14. Seção 6: Contrafactual — E se não existisse?
15. Pausa: Consolidação
16. Imagem(ns): Visuais didáticas

### 4. **Conexões** (obrigatório: mínimo 2 prereq + 3 futuras)

**Prerequisitos:**
- Blocos que devem ser estudados ANTES deste
- Tipos: `estrutural`, `microbiologico`, `imunologico`, `fisiologico`

**Futuras:**
- Blocos conectados DEPOIS deste
- Tipos de conexão:
  - `CASCATA_CAUSAL`: "quando essa estrutura falha, causa doença X"
  - `ALVO_TERAPEUTICO`: "fármaco Y modula esse mecanismo"
  - `RECONHECIMENTO_CLINICO`: "semiologia Z detecta essa disfunção"
  - `MECANISMO_COMPARTILHADO`: "mesmo princípio em outro sistema"

**Laterais:**
- Blocos similares/comparáveis no mesmo semestre
- Tipo: `comparacao`, `diagnostico`, `clinico`

### 5. **Flashcards** (recomendado: 5-8, obrigatório ≥3)

Oito tipos de cards (seguir Filosofia v1.0, Cap. 11):
1. `por_que` — Justifica existência
2. `mecanismo` — Pede passo a passo
3. `contrafactual` — "Se X não existisse..."
4. `clinico` — Conecta com situação real
5. `comparacao` — Diferencia estruturas similares
6. `etimologia` — Origem do termo
7. `armadilha` — Conceitual wrongness comum
8. `sintese_transdisciplinar` — Integra múltiplas disciplinas

**Cada card tem:**
- `id`: único, padrão "fc-s6-derm-x00057-###"
- `tipo`: um dos 8 acima
- `pergunta`: clara, específica
- `resposta`: 2-4 frases, não apenas uma palavra
- `nivel_alvo`: 2 (básico) a 5 (sintese complexa), ≥1 card de nível 5
- `topicos_relacionados`: lista de tópicos-chave da resposta

**Proibido em flashcards:**
- "O que é X?" (definição seca)
- "Cite os tipos de X" (lista pura)
- Memorização sem raciocínio

### 6. **Casos Clínicos** (recomendado: 1-2, obrigatório se tema pede)

**Cascata de 5 etapas (obrigatória):**
1. **Causa**: O que desencadeou? Mecanismo primário
2. **Estrutura**: Qual estrutura/processo está alterado?
3. **Disfunção**: Que disfunção resulta? Nível celular/tecidual
4. **Sintoma**: Manifestações clínicas que o paciente apresenta
5. **Consequência**: Sem tratamento, para onde vai? Prognóstico natural

**Campos:**
- `titulo`: descritivo (ex: "Dermatite de contato em manicure")
- `descricao`: apresentação clínica inicial, queixa principal, tempo, comorbidades
- `cascata`: as 5 etapas acima
- `diagnostico_revelado`: investigações, achados objetivos, diagnóstico confirmado
- `manejo_clinico`: passo a passo do tratamento com justificativas
- `aprendizado`: que conceito pedagógico esse caso ilustra?

### 7. **Midia** (recomendado: 2-4 imagens)

Contagem de:
- `imagens`: descrição visual + prompt IA em inglês muito específico
- `videos`: não recomendado para v1
- `audios`: não recomendado para v1
- `diagramas`: fluxogramas, sequências, tabelas

**Cada imagem tem:**
- `titulo`: nome descritivo
- `descricao`: O QUE a imagem mostra (em linguagem natural, como você descreveria para IA)
- `prompt_ia`: instrução em inglês muito específica para geração. Incluir:
  - Dimensões em pixels
  - Estilo (diagrama médico, microscopia, esquema, etc)
  - Cores sugeridas
  - Labels em português
  - Elementos específicos (setas, legenda, escala)
  - Exemplo: "Create a medical educational diagram showing... Left half shows... Right half shows... Color scheme: ... Portuguese labels. Title: '...'. Dimensions 1200x600px."

### 8. **Metricas_estudo** (obrigatório)
- `tempo_estimado_minutos`: 10-15 típico para bloco bem focado
- `dificuldade`: "basica", "intermediaria", "avancada"
- `niveis_alvo`: array (ex: [3, 4, 5] = intermediário a complexo)
- `prerequisitos_recomendados`: número mínimo (≥2)
- `conexoes_futuras_recomendadas`: número mínimo (≥3)

### 9. **Fontes** (obrigatório: ≥2)

Array de referências acadêmicas com tipos:
- `livro`: título, autores, ano, editora, capítulo, páginas
- `artigo_revisao`: título, autores, revista, ano, volume, páginas, PMID
- `artigo_original`: idem
- `diretriz`: título, autores, ano, URL
- `livro_online`: idem livro + URL

### 10. **status_producao**
Etapas esperadas:
- "template_vazio" → "em_progresso" → "rascunho" → "revisao" → "completo"

### 11. **nota_final**
Parágrafo resumindo:
- Qual filosofia foi seguida
- Quantidade de flashcards, casos, imagens
- Anti-padrões evitados
- Revisores
- Horizonte de validade e justificativa

---

## Como Preencher?

### Passo 1: Definir o tema específico
Escolher UMA estrutura/processo/conceito dermatológico que:
- Cabe num quadro branco (granularidade)
- Não mistura 3-5 assuntos
- Tem suas próprias etapas pedagogicamente distintas
- Tem disfunção/patologia/clínica clara

Exemplos de BONS temas:
- "Junção Dermoepidérmica: Lâmina Basal e Hemidesmossomo"
- "Melanócito: Síntese de Melanina e Fotoproteção"
- "Infiltração Linfocitária: T CD8+ na Dermatite de Contato"

Exemplos de RUINS temas (muito amplos):
- "Dermatite em geral" (muitos tipos)
- "Sistema Imune da Pele" (múltiplos pilares)

### Passo 2: Preencher metadados
- Definir `no_pai_id` (qual bloco é pai? Se for raiz, deixar "s6-derm-x00000")
- `status`: "em_progresso"
- `revisores`: deixar vazio até revisão

### Passo 3: Escrever resumo_conciso
- 200-300 palavras
- Narrativa contínua (não lista)
- Abre com contexto familiar
- Não começa com definição
- Apresenta o problema biológico
- Conecta clinicamente
- Dica: escrever após a narrativa principal (é síntese)

### Passo 4: Estruturar narrativa
- Seguir sequência das 8 etapas ANIMA (POR QUE → COMO RESOLVE → DO QUE É FEITO → COMO FUNCIONA → COM O QUE SE ARTICULA → NOME+ETIMOLOGIA → ANALOGIA → IMAGEM)
- Cada seção 3-6 linhas de prosa
- Sem listas no corpo
- Usar highlight para regra crítica
- Usar pausa para consolidação
- Usar analogia com mapeamento explícito

### Passo 5: Preencher conexões
- **Prerequisitos:** mínimo 2. Investigar qual conhecimento é ESSENCIAL antes
- **Futuras:** mínimo 3. Uma cascata (patologia), uma terapêutica, uma semiologia
- **Laterais:** comparáveis, similarmente focados

### Passo 6: Criar flashcards
- 8 tipos, no mínimo ≥3, recomendado 5-8
- Incluir obrigatoriamente: ≥1 contrafactual (nível 5), ≥1 clínico (nível 3)
- Evitar "O que é X?"
- Respostas com 2-4 frases completas

### Passo 7: Adicionar caso clínico (se aplicável)
- Apenas se tema se presta (nem tudo precisa)
- Cascata de 5 etapas OBRIGATÓRIA
- Diagnóstico revelado só no fim
- Aprendizado deve conectar a conceito-chave do bloco

### Passo 8: Especificar imagens
- Mínimo 2, recomendado 3-4
- Descrição clara do QUÊ é mostrado
- Prompt em inglês muito específico (dimensões, cores, labels português)
- Adequado para IA gerar (não pedir "realista" fotograficamente se é esquema)

### Passo 9: Verificar metricas e fontes
- Tempo estimado: ser realista (10-15 min típico)
- Dificuldade: intermediária = nível 3-4
- Fontes: mínimo 2 (1 livro + 1 artigo, ou equivalente)

### Passo 10: Revisar e marcar status
- Checklist filosofia ANIMA v1.0 (anti-padrões evitados?)
- Status: "revisao" quando pronto para terceiro revisor
- nota_final: resumir de forma honesta

---

## Checklist de Conformidade (Filosofia ANIMA v1.0)

- [ ] Abertura familiar (não definição)
- [ ] Gancho de curiosidade nos 2 primeiros parágrafos
- [ ] 8 etapas para cada estrutura (POR QUE → ... → IMAGEM)
- [ ] 2-4 imagens com prompts IA
- [ ] 1+ analogia com mapeamento explícito
- [ ] 1+ pausa de consolidação
- [ ] 1+ highlight crítico
- [ ] Etimologia para todo termo técnico novo
- [ ] Subtítulos em formato pergunta/provocação
- [ ] Sem listas no corpo do texto
- [ ] Sem dados não verificados (marcar [⚠️ VERIFICAR] se incerto)
- [ ] 5-8 flashcards (≥1 contrafactual, ≥1 clínico, ≥1 nível 5)
- [ ] 0-2 casos clínicos com cascata 5 etapas
- [ ] Pré-requisitos declarados (≥2)
- [ ] 3+ conexões futuras (≥1 cascata causal, ≥1 alvo terapêutico, ≥1 semiologia)
- [ ] Tom: professor admirado pela biologia, parágrafos curtos, sem voz seca
- [ ] Referências adequadas (≥2 fontes)

---

## Dúvidas Frequentes

**P: Posso ter apenas 3 flashcards?**  
R: Mínimo técnico é 3, mas recomendado é 5-8. Se tema é muito simples, 3 é aceitável. Sem forçar.

**P: Nem todo tema tem caso clínico obvio?**  
R: Correto. Se tema não se presta (ex: "Melanócito: Tipos de Melanina"), deixe vazio ou com 0 casos. Menos e melhor.

**P: Como defino no_pai_id?**  
R: Se é primeiro bloco de dermatologia, pode ser "s6-derm-x00000" (raiz). Se descer de outro bloco (ex: de "Epiderme Geral"), use o ID daquele.

**P: Quanto tempo leva preencher tudo?**  
R: Bloco bem focado com tema claro: 3-4 horas. Bloco com tema amplo/confuso: 6-8+ horas (porque precisa refatorar para granularidade).

**P: JSON é automaticamente validado?**  
R: Não neste template. Você precisa garantir que:
  - Não há vírgulas faltando
  - Arrays `[]` e objetos `{}` estão bem fechados
  - Strings estão entre aspas duplas
  - IDs são únicos dentro do bloco
  Dica: testar em editor JSON online (jsonlint.com)

---

## Próximas Etapas

1. Escolher o tema específico do Bloco Derm 57
2. Preencher este template seguindo os passos acima
3. Submeter para revisão (marcar `status: "revisao"`)
4. Ajustar conforme feedback dos 3 juízes
5. Marcar status final: "completo"
6. Bloco pronto para integração no app

---

**Referências de Filosofia:**
- Completa: `C:\Users\vegag\.claude\medbase\ANIMA_FILOSOFIA.md`
- Diretrizes: `C:\Users\vegag\.claude\projects\C--Users-vegag--claude\memory\anima_diretrizes_producao.md`
- Bloco canônico (exemplo): `C:\Users\vegag\.claude\projects\C--Users-vegag--claude\memory\anima_bloco_canonico.md`

**Estrutura do projeto:**
- Blocos dermatologia: `C:\Users\vegag\.claude\anima\med\src\med\data\dermatologia\`
- Blocos de outras disciplinas: `C:\Users\vegag\.claude\anima\med\src\med\data\[disciplina]\`
