# Reimaginar a ANIMA Med — Prompt de Reformulação Visual para Fable 5

> Cole este arquivo inteiro como sua primeira mensagem ao Fable 5, rodando dentro do repositório em `C:\Users\vegag\.claude\anima\med`. O prompt é faseado de propósito. Respeite os checkpoints `⛔ PARE` — eles existem para você aprovar a direção antes que qualquer tela seja propagada.

---

## CONTEXTO DO PROJETO

A **ANIMA Med** é uma **plataforma de software educacional** — um aplicativo de estudo para estudantes de medicina, no mesmo gênero de produtos como Anki, Osmosis ou UpToDate. É uma ferramenta legítima de aprendizado, construída em React, cujo propósito é ajudar estudantes a organizar e revisar material acadêmico. Seu trabalho aqui é **engenharia de front-end e design de interface** de um produto de software.

## O QUE VOCÊ VAI FAZER (e o que você NÃO vai fazer)

Você é o Fable 5, atuando como **engenheiro-designer sênior** sobre uma base de código React real e funcionando. Sua missão é **reimaginar a interface da plataforma ANIMA Med** — dar a ela uma aparência única, interativa, com animações e uma organização que ofereça o melhor ao estudante.

**Leia isto duas vezes, porque é o eixo de tudo — técnico E operacional:**

> **Seu trabalho é a CAMADA DE APRESENTAÇÃO (a interface de software), não o conteúdo acadêmico.** Existem ~8.650 arquivos JSON de material de estudo já escritos e validados. Para o seu trabalho, **esses arquivos são dados opacos** — blocos de texto que a interface carrega e exibe. Você **não precisa ler, interpretar, avaliar, verificar ou processar o conteúdo médico/biológico em si**. Você trabalha na *moldura* que exibe esse dado: componentes React, CSS, navegação, animações, layout, tipografia.
>
> Concretamente: você trata um bloco como `{ titulo, narrativa[], flashcards[]... }` — uma **estrutura de dados a renderizar bem**, exatamente como um desenvolvedor de um leitor de e-books trata o texto dos livros como conteúdo a paginar, não como algo a revisar. Você desenha o *player*, não escreve nem audita o *conteúdo*.
>
> Você **não gera novos blocos, não edita texto de blocos, não reescreve flashcards ou casos clínicos, e não precisa formar juízo sobre a exatidão do material acadêmico**. Isso mantém seu foco onde ele deve estar (a experiência de software) e é também a forma correta de trabalhar: o conteúdo já está pronto e é read-only.

Os dois objetivos, em ordem de prioridade:

1. **PRINCIPAL — Compreensão e organização.** Um estudante de medicina de 1º ano, sobrecarregado, estudando pré-prova, precisa: achar o que quer sem se perder, entender onde está na jornada, e sentir que a plataforma trabalha a favor dele. Clareza e navegabilidade vêm ANTES de qualquer efeito visual. Beleza que atrapalha a compreensão é fracasso.
2. **IDENTIDADE — Aparência única que remete à ANIMA.** Não "mais um app de flashcards". Uma identidade reconhecível que encarne os conceitos da ANIMA: um organismo vivo que ensina, a espiral do aprendizado, a voz em 1ª pessoa, o aprender-como-crescer. Interativa, com animações propositais, fluida.

Beleza serve à compreensão, nunca o contrário.

---

## STACK REAL (é este — não presuma outro)

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`) já instalado — use-o; não troque a solução de estilo sem justificar
- **Dexie 4** (IndexedDB), offline-first · **Zustand 5** + **dexie-react-hooks** (`useLiveQuery`) · **react-router-dom 7**
- **vite-plugin-pwa** (service worker, offline) · **marked** + **dompurify** (markdown seguro)
- Conteúdo: **8.651 blocos JSON** em `public/blocos/` (66 disciplinas), indexados por `public/blocos/manifesto.json`, carregados sob demanda
- **27 páginas** em `src/med/pages/`; componentes em `src/med/components/` e `src/core/components/`
- **Design tokens já existem como CSS variables** (`var(--color-accent)`, `var(--radius-md)`, `var(--color-text-primary)`…). **Descubra e evolua o sistema de tokens existente — não invente um novo do zero sem argumentar por quê.**

Estado técnico verificado (auditoria de 03/07/2026): o build passa limpo (`npm run build`, ~6s). Não há API keys, não há integração de IA externa (os componentes "Modo Ensinar"/"Explique Meu Erro" são shells locais honestos, sem provider). App 100% offline. Não há dívida técnica bloqueante para o seu trabalho. Você entra num terreno estável.

---

## A FILOSOFIA QUE O DESIGN PRECISA ENCARNAR

A ANIMA ensina em **espiral de 8 etapas** (inviolável): ① Por que existe (problema) → ② Como se resolve (sem nomear) → ③ Do que é feito → ④ Como funciona → ⑤ Com o que se articula → ⑥ Nome + etimologia → ⑦ Analogia concreta → ⑧ Imagem.

Consequências de design que você **deve** respeitar (elas já estão no conteúdo — seu trabalho é dar-lhes forma visual, não recriá-las):

- **O bloco abre com um problema, não com uma definição.** Na tela de bloco, a *pergunta* ganha peso visual antes da resposta. Nunca destaque o nome do conceito antes da etimologia (viola a etapa 6).
- **Inversão pedagógica:** o fluxo é *testar → falhar → ensinar → reter*. Onde houver pré-teste ("Modo Palpite") antes da narrativa, o design honra essa ordem.
- **Narrativa em espiral, não lista.** Tipografia e ritmo vertical favorecem prosa causal (parágrafos de 3-6 linhas, pausas de consolidação, um destaque para a regra crítica) — não bullets empilhados.
- **Componentes adaptativos.** Nem todo bloco tem flashcard, caso clínico ou tabela; as abas só aparecem quando têm valor. O design lida graciosamente tanto com o bloco "só narrativa" quanto com o "rico", sem parecer quebrado em nenhum.
- **A ANIMA tem voz.** É um organismo-tutor em 1ª pessoa: saudação de abertura, estados vazios com voz e caminho (nunca vazios mortos), micro-momentos de fala. Nada de interface clínica/estéril — presença, calor, dignidade.
- **Imagens/resumos por IA são conteúdo de 1ª classe**, sempre rotulados (◇ esquema / ⚠ IA / ✓ real). Os rótulos são honestos e legíveis, nunca escondidos.

Persona: estudante de 1º ano, sobrecarregado, alternando entre foco profundo e sessões de resgate de 10 min. O design serve *aprendizado sob pressão*.

---

## ⚠️ CÓDIGO E CONTEÚDO PROTEGIDOS — NÃO REESCREVER

Você muda como estas coisas **aparecem**, nunca a lógica interna sem me pedir aprovação e justificar:

- **Todo `public/blocos/`** — é o conteúdo. Jamais edite blocos por motivo estético.
- `src/core/srs/` — algoritmo SM-2 de repetição espaçada (validado)
- `src/core/db/` — schema Dexie, ingestão, backup. **Especialmente a separação `blocos` (substituível) vs `progresso` (sagrado): nunca faça operação que possa sobrescrever progresso do usuário.**
- `src/core/store/` — stores Zustand · `src/core/anima/streak-ritmo.ts` (streak) · `scripts/gerar-manifesto.mjs` (pipeline)

Se um redesign exigir tocar em algum destes, **pare e pergunte**, com o motivo específico.

---

## FASE 0 — RECONHECIMENTO (antes de qualquer pixel)

Não escreva CSS aqui. Objetivo: você entender o terreno e me devolver um mapa.

1. **Mapeie a experiência atual.** Percorra as 27 páginas em `src/med/pages/`. Para cada uma: que etapa da jornada serve, que dado consome, e se tem estado vazio/loading/erro tratado. Depois **identifique os 5-8 fluxos que realmente importam** (abrir/estudar bloco, revisar vencidas, questões/exame, capturar dúvida, ver progresso) vs. as telas periféricas. É neles que o redesign concentra energia.

2. **Rode a plataforma e diagnostique a organização atual.** Suba o dev server, navegue de verdade. Onde um estudante novo se perderia? A navegação comunica "onde estou / para onde vou"? A hierarquia de informação está clara ou tudo compete por atenção? **Liste os 10 maiores problemas de compreensão/organização** que você observou — este é o alvo nº 1 do redesign, então seja concreto (com print/rota).

3. **Descubra o design system atual.** Ache onde os tokens vivem (CSS vars, config Tailwind, tema). Documente paleta, escala tipográfica e componentes-base que **já existem**. Seu trabalho evolui esse sistema.

**⛔ PARE.** Entregue o **Mapa da Fase 0**: fluxos-núcleo, os 10 problemas de organização/clareza, e o design system atual. Espere minha resposta antes de propor estética.

---

## FASE 1 — DIREÇÃO (proposta + UMA tela de prova)

Converja a *direção* comigo antes de implementar 27 telas. Barato mudar agora, caro depois.

1. **Síntese (250-300 palavras):** o que a ANIMA verdadeiramente é, para quem, e onde está o desequilíbrio hoje. Isto ancora tudo.

2. **Arquitetura de informação reimaginada:** antes de cor e fonte, proponha *como o produto se organiza*. Como o estudante navega entre disciplina → tema → bloco? Como sabe o que revisar hoje? Como a espiral do aprendizado fica visível na navegação? Um mapa de navegação claro é o entregável mais importante desta fase — a organização é o objetivo principal.

3. **Identidade visual concreta** (valores reais, não adjetivos):
   - **Paleta** (hex): primária, superfícies (evite preto/branco puros), e um **mapa de cor por disciplina/grande-área** usado de forma consistente em tags, navegação e progresso. Cor é semântica: estado (acerto/erro/esforço/pausa) e domínio. Reporte os ratios de contraste WCAG AA.
   - **Tipografia** (famílias reais + escala px/rem): uma voz de UI e uma de leitura longa (a narrativa é prosa — considere serif no corpo se ajudar retenção). Line-height e largura de linha pensados para leitura sob fadiga.
   - **Motivo visual da ANIMA:** qual é o elemento que torna a plataforma reconhecível como *organismo vivo*? (a espiral, uma pulsação sutil, o "corpo que se ilumina", a voz…) Um motivo, aplicado com disciplina — não cinco.

4. **Vocabulário de movimento:** decida a abordagem (CSS/Tailwind keyframes vs. lib) respeitando o bundle apertado. Defina 1 curva de easing padrão, 3 durações (micro / transição / narrativa), regra de stagger. **Toda animação respeita `prefers-reduced-motion` com fallback estático igualmente bom.** Movimento tem propósito (revelar estrutura, guiar atenção, dar feedback) — nunca decoração.

5. **UMA tela de referência, implementada de verdade:** escolha a **tela de Bloco** (o coração do produto) e implemente-a completa como *vertical slice*, usando conteúdo real de um bloco existente — a espiral de 8 etapas ganhando forma, abas adaptativas, imagens rotuladas, a voz da ANIMA presente. Só esta tela. É o protótipo que prova a direção.

6. **Sound design — proposta, não implementação:** 4-6 micro-sons (evento, duração ms, caráter), togglável, cada um com equivalente visual. Não implemente áudio ainda.

**Critérios de aceite mensuráveis (atinja e reporte):**
- Build passa sem novos erros.
- LCP da tela de Bloco < 2.5s (throttle 4G simulado); CLS < 0.1.
- Bundle gzip não cresce > 15% sem justificativa.
- Contraste AA (≥ 4.5:1 texto normal) em toda a tela.
- **Zero regressão:** SRS, flashcards, streak, navegação e carregamento de blocos continuam funcionando (verifique no preview).

**⛔ PARE.** Entregue a proposta + a tela de Bloco no preview. Espere eu aprovar ou ajustar. Só então propague.

---

## FASE 2 — PROPAGAÇÃO POR FLUXO (incremental)

Só após meu OK. Aplique a direção aprovada ao resto, **um fluxo por vez**, do mais importante ao periférico. Ordem sugerida (confirme comigo):

1. Home + voz de abertura + estados vazios com caminho
2. Núcleo de estudo (Estudar → Bloco → Palpite → flashcards)
3. Revisão de vencidas + Questões / Modo Exame
4. Visualizações de crescimento (Progresso, Grafo/Espiral, Corpo que se Ilumina, Streak)
5. Captura de dúvida, Diário, Autoria/Canvas
6. Config, acessibilidade, telas periféricas

Para **cada fluxo**, ao terminar: um mini-checkpoint com o que mudou, preview/print, e a confirmação dos critérios de aceite (build ok, sem regressão, contraste, motion com reduced-motion). **Não junte os 6 num diff único** — quero revisar por partes. Commits pequenos e reversíveis.

---

## PRINCÍPIOS SOBERANOS (todas as fases)

1. **Compreensão e organização acima de tudo.** Se uma escolha bonita torna a plataforma mais confusa ou mais difícil de navegar, ela está errada. O teste final de cada tela: *um estudante cansado acha o que precisa e entende onde está?*
2. **Apresentação, não conteúdo.** Você reimagina a casca. Nunca reescreve, regenera ou edita os blocos, flashcards ou casos. O conteúdo é read-only.
3. **Não reescrever o que funciona.** Lógica de SRS, dados, stores e streak são patrimônio. Refatore por necessidade, nunca por gosto.
4. **Pedagogia guia a estética.** Cada decisão visual serve a espiral de 8 etapas e a leitura sob fadiga.
5. **Identidade coesa > variedade.** Um motivo visual da ANIMA, poucas cores e fontes, usados com disciplina, superam mil microdecisões soltas.
6. **Performance é design.** 60fps, bundle vigiado, LCP/CLS na meta. Animação que trava é defeito.
7. **Movimento com intenção.** Cada animação revela estrutura, guia atenção ou dá feedback — nunca "porque ficou legal".
8. **Inclusão é DNA.** WCAG AA, teclado, screen reader, `prefers-reduced-motion` em cada tela, não no fim.
9. **A voz da ANIMA presente.** Calor e dignidade em 1ª pessoa; nunca uma interface estéril.
10. **Checkpoints são sagrados.** Nos `⛔ PARE`, pare e espere. O maior risco deste trabalho é um redesign completo e bonito que eu só descubro que não era o que eu queria depois de pronto.

---

Comece pela **Fase 0**. Não pule para design. Ao terminar a Fase 0, pare e me mostre o mapa.
