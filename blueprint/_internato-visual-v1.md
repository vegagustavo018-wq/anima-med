# ESTRUTURA VISUAL DO INTERNATO — proposta v1 (para revisão)

## Por que diferir dos semestres 1-9
Nos S1-9, o conteúdo é CONCEITO e a navegação é a **árvore de tópicos** (fluxograma) + página de bloco (narrativa + Modo Palpite + abas). No internato o conteúdo é **caso / competência / procedimento** — a metáfora de árvore anatômica não serve. A UX do internato deve ser **centrada na ROTAÇÃO e na COMPETÊNCIA**, espelhando a vida real do interno (um passaporte de plantão), não uma enciclopédia.

## 1. Porta de entrada: o HUB DO ESTÁGIO (novo)
Em Explorar, os semestres 10-12 mostram **estágios** (Med Interna, Pediatria, Cirurgia, GO, Emergência/UTI, Saúde da Família, Eletivas) — não disciplinas-árvore. Clicar num estágio abre o **Hub do Estágio** (substitui o fluxograma nesse contexto):
- **Cabeçalho**: objetivos da rotação + barra de progresso do estágio.
- **Painel "Como você será avaliado"** (fixo no topo): mini-CEX, DOPS, MSF/360, portfólio, prova de saída (OSCE/banca no int3).
- **6 trilhas** (cards de entrada, cada uma com seu ícone/cor): Casos · Competências (EPAs) · Procedimentos · Casos Integradores · Reflexão · Análise de Erro.
- Cada trilha mostra progresso próprio (ex: "7/15 casos", "EPA-10 nível 3→4", "10/10 punções").

## 2. Apresentação por tipo de bloco (cada tipo tem sua "pele")
- **caso_paradigmatico** → **Player de Vinheta Ramificada** (REUSO do Bloco 5 já existente: `VinhetaClinicaPlayer`/`ClinicaPage`), aprimorado: abre pela DECISÃO (o cenário chega, relógio correndo), destaca a "decisão sob incerteza", e ao final linka o bloco S1-9 pré-requisito (a ponte da espiral).
- **competencia_epa** → **Escada de Confiabilidade** (NOVO componente): 5 degraus (1 Observa → 2 Supervisão direta → 3 Indireta → 4 Autônomo → 5 Supervisiona), com o NÍVEL-ALVO do estágio destacado, o comportamento observável de cada degrau, e o instrumento de avaliação. O aluno marca onde se sente.
- **procedimento** → **Guia passo-a-passo + Logbook** (NOVO): cada passo com o "porquê" e o que dá errado se pulado; e um **contador de logbook** (registro pessoal: "X / mínimo exigido") que o aluno incrementa a cada procedimento real — vira o análogo do SRS para habilidades manuais.
- **reflexao** → **Diário Guiado (ciclo de Gibbs)** (REUSO do Diário do Organismo, com prompts: incidente → emoção → análise → aprendizado → plano).
- **analise_erro** → **Sala de M&M** (NOVO, leve): near-miss/evento adverso apresentado sem culpa, com foco no sistema (queijo suíço), disclosure e o que mudar — coerente com a Filosofia (erro é o professor mais potente).
- **integrador** → Player de Vinheta com moldura "cruza ≥2 sistemas": força priorizar problemas concorrentes.

## 3. Progresso: o PASSAPORTE DO INTERNATO (novo modelo)
No internato a "maestria" não é domínio SRS de conceitos — é **confiabilidade (EPAs) + logbook (procedimentos) + casos vividos + reflexões**. Um **Passaporte do Internato** consolida isso: níveis de EPA atingidos, procedimentos registrados vs mínimos, casos concluídos, reflexões no portfólio. É o que a banca final avaliaria. Substitui o "Corpo que se Ilumina" (que é por domínio de conteúdo) como métrica-mãe DENTRO dos internatos.

## 4. Reuso vs. novo (economia de esforço)
- **Reuso:** VinhetaClinicaPlayer, Diário/EntradaDiario, primitivos (Pagina/Cartao/FalaAnima), o pipeline de blocos-esqueleto.
- **Novo:** `HubDoEstagio` (página), `EscadaConfiabilidade`, `LogbookProcedimento` (com persistência local por procedimento), `SalaMM` (leve), `PassaporteInternato`.
- **Roteamento:** a página de bloco lê `tipo_bloco` e escolhe a "pele" — casos→vinheta, EPA→escada, procedimento→guia+logbook, etc. Blocos-esqueleto (sem conteúdo) mostram o placeholder "em produção" como nos S1-9, mas já dentro da pele certa.

## 5. Coerência com a alma da ANIMA
Mantém: voz em 1ª pessoa (FalaAnima), testar-antes-de-ensinar (o caso abre pela decisão), dados sagrados/locais (logbook e reflexões são do aluno). Rejeita: gamificação vazia (o passaporte reflete competência real, não XP). A diferença visual serve à PEDAGOGIA do internato, não à novidade pela novidade.
