# LOTE 1 — Status de Execução (MI3)

**Data:** 3 de julho de 2026
**Lote:** 1 de 9
**Blocos esperados:** 12
**Blocos produzidos:** 1/12
**Taxa de aprovação:** 1/1 (100%)

---

## Bloco Completado

✅ **s9-mi3-00-000** — Medicina Interna III — Visão Geral
- Status: COMPLETO + APROVADO
- 8 flashcards variados (por_que, mecanismo, clínico, comparação, armadilha, contrafactual, síntese)
- 2 imagens esquema (descrição + prompt IA)
- Narrativa com 8 etapas ANIMA: problema → solução → composição → mecanismo → conexões → nome → analogia → imagem
- Localização: `public/blocos/mi3/s9-mi3-00-000.json`

---

## Próximos 11 Blocos do LOTE 1 (ORDEM DE ÁRVORE)

### 2. **s9-mi3-01-000** — Reumatologia Clínica (PAI do Módulo 01)
- **Pai:** s9-mi3-00-000
- **Escopo:** "Doenças autoimunes e inflamatórias sistêmicas do aparelho locomotor e tecido conjuntivo"
- **Lentes:** fisiopatologia, apresentacao_clinica, diagnostico
- **Profundidade:** 1 (raiz de módulo)
- **Tipo:** modulo
- **O que escrever:** 
  - Abertura: Por que existe autoimunidade? (problema biológico)
  - Roadmap dos 9 temas-filho (AR, LES, espondi, esclerodermia, vasculites, SAF, microcristalinas, auto-inflamatórias)
  - Fio condutor: reconhecimento de padrão articular (mono/oligo/poli) vs padrão sistêmico
  - Ferramentas diagnósticas comuns (FAN, FR, anti-CCP, ANCA)
  - Arsenal terapêutico em visão (AINEs, DMARDs, biológicos)
  - Sem entrar em detalhes de cada doença (cada tema-filho detalha)
- **Flashcards esperados:** 5-6 (pedagogia do módulo)
- **Casos:** 0 (bloco estrutural)

### 3. **s9-mi3-01-001** — O Problema da Autoimunidade Sistêmica (VG/CONCEITO do Módulo 01)
- **Pai:** s9-mi3-01-000
- **Escopo:** "Como o sistema imune ataca o próprio corpo; tolerância perdida; base de todas as doenças do módulo"
- **Lentes:** fisiopatologia, correlacao_ciencias_basicas, etimologia
- **Profundidade:** 2
- **Tipo:** visao_geral
- **O que escrever:**
  - Abertura: Imagine um sistema de defesa que normalmente distingue "eu" vs "não-eu" (explicar com problema familiar)
  - 8 etapas aplicadas ao "Por que existe tolerância?":
    ① POR QUE: evitar autodestruição
    ② COMO: seleção negativa (timo) e regulação periférica (T-regs)
    ③ DO QUE É FEITO: células T regulatórias, FoxP3, citocinas anti-inflamatórias
    ④ COMO FUNCIONA: timo elimina T-cells autorreativas; baço mantém T-regs; citocinas IL-10/TGF-β supprimem
    ⑤ COM O QUE SE ARTICULA: sistema nervoso (vagal), microbiota, hormônios (estrógeno = autoimunidade pior)
    ⑥ NOME: "Tolerância Imunológica" (do latim tolerare = suportar; tolérer o próprio)
    ⑦ ANALOGIA: "Sistema de segurança que reconhece entrada autorizada (vacinação) vs invasor (bactéria) vs ocupante (você mesmo, não ejetar)"
    ⑧ IMAGEM: esquema do timo, células T-reg, citocinas regulatórias
  - Fechamento: o que acontece quando essa tolerância quebra? (preview do 01-001-01)
- **Flashcards:** 5-7 (mecanismo, contrafactual, etimologia)
- **Casos:** 0

### 4. **s9-mi3-01-001-01** — Tolerância Imunológica e Sua Quebra
- **Pai:** s9-mi3-01-001
- **Escopo:** "Tolerância central e periférica; por que o corpo normalmente não se ataca"
- **Profundidade:** 3 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Foco: Não é "o que é tolerância" (bloco anterior cobriu). É: "Como tolerância quebra? O que vai errado?"
  - Mecanismos de quebra: 
    ① Defeito de seleção negativa (antígenos sequestrados no timo não são testados)
    ② Defeito de T-regs (mutação FOXP3 = síndrome IPEX; insuficiência numérica/funcional)
    ③ Bystander activation (ativação por inocente, não por autoantígeno)
    ④ Mimetismo molecular (antígeno estranho parece com próprio)
    ⑤ Espalhamento de epítopo (reação contra uma estrutura acaba atacando estrutura similar)
  - Fatores de risco: genética (HLA), sexo (mulheres > homens, estrógeno), infecções (vírus), meio ambiente (cigarro, silica)
  - Cada mecanismo leva a doença diferente (exemplificar brevemente, detalhe em temas seguintes)
- **Flashcards:** 6-8 (mecanismo de quebra x 3, clínico de risco, contrafactual, armadilha de "alergia vs autoimunidade")
- **Casos:** 1 (mulher jovem com síndrome autoimune, revelar ao fim: genética de HLA + infecção viral desencadeou)

### 5. **s9-mi3-01-001-02** — Autoanticorpos como Ferramenta Diagnóstica
- **Pai:** s9-mi3-01-001
- **Escopo:** "FAN, fator reumatoide, anti-CCP, ANCA; significado, sensibilidade e armadilhas"
- **Profundidade:** 3 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Abertura: "Se o corpo ataca a si mesmo, vai produzir armas contra si mesmo — chamadas autoanticorpos. Detectá-las é como ler um mapa do crime imunológico."
  - O que são autoanticorpos: IgG, IgM, IgA contra antígenos próprios
  - 5 classes principais:
    ① Fator Reumatoide (FR): anti-Fc IgG; presente em AR e outras doenças; não específico
    ② Anti-CCP: anti-peptídeo citrulinado; específico para AR; presente mesmo em pré-doença
    ③ FAN: anti-antígenos nucleares; presente em LES, síndrome de Sjögren, esclerodermia; vários padrões
    ④ Anti-DNA: anti-DNA dupla-fita; específico para LES ativa; correlaciona com nefrite
    ⑤ ANCA (anti-neutrophil citoplasmic antibody): c-ANCA (anti-PR3, GPA) vs p-ANCA (anti-MPO, MPA); vasculites
  - Tabela comparativa: sensibilidade / especificidade / doenças / o que medir
  - Armadilhas: FAN positivo em 5% população saudável; presença ≠ atividade; ausência não exclui doença
- **Flashcards:** 6-8 (significado de cada, contrafactual "FAN negativo = sem autoimunidade?", clínico de interpretação)
- **Casos:** 1 (paciente com FAN 1:160 homogêneo + padrão — LES vs falso positivo?)

### 6. **s9-mi3-01-001-03** — Abordagem Semiológica das Artrites
- **Pai:** s9-mi3-01-001
- **Escopo:** "Padrão articular: mono/oligo/poli, inflamatória vs mecânica, simetria, ritmo circadiano da dor"
- **Profundidade:** 3 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Abertura: "Quando um paciente vem com dor nas articulações, a primeira coisa é não perguntar 'qual doença?' mas 'qual é o PADRÃO de dor?'"
  - Dimensões de padrão:
    ① Número de articulações: monoartrite (1), oligoartrite (2-4), poliartrite (≥5)
    ② Simetria: simétrica (AR típica) vs assimétrica (psoriásica, reativa)
    ③ Grandes vs pequenas artículos: grandes (ombro, cotovelo, joelho) vs pequenas (MCP, IFP)
    ④ Ritmo circadiano: rigidez matinal (inflamatória) vs piora noturna (mecânica)
    ⑤ Tipo de inflamação: "quente, vermelha, inchada" = inflamação verdadeira vs "inchada, rígida, dolorida ao movimento" = OA
  - Padrões diagnósticos: tabela mostrando AR (poli simétrica pequenas MCP IFP, rigidez matinal), espondi (poli assimétrica grandes + coluna, piora noite melhorando com movimento), reativa (poli assimétrica grandes + pés), psoriásica (mono/oligo + dactilite)
  - Exame: procurar hiperemia, calor, deformidades tardias (swan-neck, boutonnière em AR crônica)
- **Flashcards:** 6-8 (cada padrão x1, contrafactual "monoartrite = sempre artrite viral?", clínico de diferencial)
- **Casos:** 1 (homem com dor em joelhos, cotovelos, pés — poli grande simétrica — AR vs reativa?)

### 7. **s9-mi3-01-001-04** — Provas de Atividade Inflamatória
- **Pai:** s9-mi3-01-001
- **Escopo:** "VHS e PCR; o que medem, dissociação, uso no seguimento reumatológico"
- **Profundidade:** 3 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Abertura: "Você pode medir quanto o corpo está inflamado com duas provas simples que custam R$5."
  - VHS (Velocidade de Hemossedimentação):
    - O que é: quanto rápido hemácia sai da suspensão (plasma viscoso demais = desce lento)
    - O que mede: proteínas de fase aguda (fibrinogênio, imunoglobulinas, CRP)
    - Não específico: também sobe em infecção, malignidade, gravidez, ICC
    - Normal <20 mm/h (mulher <30)
    - Como funciona: fibrinogênio aumentado (ponte entre hemácias) → agregação → sedimentação rápida
  - PCR (Proteína C-Reativa):
    - O que é: citocina de fase aguda IL-6 dependente
    - O que mede: especificamente inflamação ativa (mais específico que VHS)
    - Sobe em horas; desce em dias (dinâmica rápida)
    - Normal <3 mg/L; reumatológico ativo >1 (mesmo quando VHS normal)
  - Dissociação VHS-PCR: VHS alto + PCR normal = inflamação crônica de baixo grau (LES) vs PCR alto + VHS normal = inflamação recente (exacerbação de AR)
  - Uso prático: baseline antes de tratar, seguimento mensal em AR ativa, alvo terapêutico é "negativizar"
- **Flashcards:** 5-7 (mecanismo VHS/PCR, comparação dissociação, clínico de interpretação, armadilha "VHS normal = sem atividade?")
- **Casos:** 0

### 8. **s9-mi3-01-001-05** — Arsenal Terapêutico em Reumatologia (TEMA/ORGANIZADOR)
- **Pai:** s9-mi3-01-001
- **Escopo:** "Classes de fármacos que modulam a inflamação autoimune e lógica do tratar-para-alvo"
- **Profundidade:** 3 (tema)
- **Tipo:** tema (organizador com 3 filhos)
- **O que escrever:**
  - Abertura: "Reumatologia evoluiu de 'dar AINE e esperar' para 'atacar o alvo da cascata imune'. Aprenda a lógica de cada droga."
  - Filosofia geral: estratégia tratar-para-alvo = começar + escalar + medir resposta + manter remissão
  - Dois caminhos paralelos sempre:
    ① Sintomático (AINE, corticoide) = alívio rápido, não modifica doença
    ② Modificador de doença (DMARD, biológico) = lento, mas controla progressão
  - As 3 classes filhas são apresentadas aqui em síntese:
    - AINEs/Corticoides: rápidos, sintomáticos, corticoide-ponte é estratégia comum
    - DMARDs: modificam doença, metotrexato é ouro, leflunomida, sulfassalazina, antimaláricos
    - Biológicos: anti-TNF, anti-IL6, anti-CD20, JAK-inibidores, ultra-específicos, risco infeccioso
  - Tabela: classes × mecanismo × inicio de ação × risco × quando usar
  - Destaque: DMARD + biológico é combinação esperada em AR moderna (não substitui, complementa)
- **Flashcards:** 5-6 (lógica tratar-para-alvo, comparação classes, armadilha "AINE resolve AR?")
- **Casos:** 0 (é organizador, casos virão nos filhos)

### 9. **s9-mi3-01-001-05-01** — AINEs e Glicocorticoides na Reumatologia
- **Pai:** s9-mi3-01-001-05
- **Escopo:** "Controle sintomático rápido, corticoide-ponte, efeitos adversos do uso crônico"
- **Profundidade:** 4 (folha)
- **Tipo:** folha
- **O que escrever:**
  - AINEs:
    - Mecanismo: bloqueiam COX-1/2 → reduzem PGE2/PGI2 → menos inflamação
    - Início: 2-6 horas
    - Efeito: analgesia + redução de edema
    - Limitação: NÃO modifica doença; piora ICC/insuficiência renal
    - Dose: ibuprofeno 1200 mg/dia, naproxeno 500 mg/dia, indometacina 150 mg/dia
    - Risco: GI, cardiovascular, renal em crônico
  - Glicocorticoides (prednisona):
    - Mecanismo: suprime NF-κB → reduz transcrição de citocinas (IL-1, TNF, IL-6)
    - Muito potente mas com efeitos adversos severos
    - Estratégia corticoide-ponte: dose alta inicial (0.5-1 mg/kg/dia), reduz gradualmente ao longo de 4-8 semanas enquanto DMARD vai fazendo efeito
    - Efeitos adversos crônicos: imunossupressão, ganho peso, osteoporose, necrose avascular, miopatia
    - Uso moderno: minimizar (meta <5 mg/dia manutenção ou zero)
  - Tabela: AINE × prednisona × DMARD (velocidade, eficácia, risco)
- **Flashcards:** 5-7 (mecanismo AINE vs corticoide, contrafactual "sem AINEs/corticoides na AR?", clínico de efeitos adversos)
- **Casos:** 1 (mulher com AR começando, prescrever AINE + prednisona 0.5 mg/kg/dia + metotrexato, ver redução gradual)

### 10. **s9-mi3-01-001-05-02** — DMARDs Sintéticos
- **Pai:** s9-mi3-01-001-05
- **Escopo:** "Metotrexato, leflunomida, sulfassalazina, antimaláricos; drogas que modificam a doença"
- **Profundidade:** 4 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Abertura: "DMARDs são drogas que não aliviam dor rápido, mas stopam a progressão articular. O paradoxo: você sente pior antes de melhorar."
  - Metotrexato (gold standard):
    - Mecanismo: antagonista de folato → inibe de novo síntese de purinas/pirimidinas → linfócitos proliferam menos
    - Dose: 15-25 mg/semana IV ou IM (melhor que VO)
    - Início: 6-8 semanas
    - Monitoramento: CBC, LFTs mensais (hepatotoxicidade, mielossupressão)
    - Efeitos: náusea, úlcera, hepatite, pneumonite (rara)
    - Fetal: evitar em gravidez
  - Leflunomida:
    - Mecanismo: inibe DHODH (dihidroato desidrogenase) → bloqueia síntese pirimidina
    - Dose: 10-20 mg/dia
    - Início: 8-12 semanas
    - Vantagem: pode usar VO
    - Desvantagem: meia-vida longa; se reação adversa, precisa fazer wash-out com colestiramina
  - Sulfassalazina:
    - Mecanismo: azathioprina (menos claro)
    - Dose: 1-3 g/dia
    - Início: 8-12 semanas
    - Efeitos: GI, rash, citopenias
    - Vantagem: barata
  - Antimaláricos (hidroxicloroquina):
    - Mecanismo: alcaliniza lisossoma, afeta apresentação antigênica
    - Dose: 200-400 mg/dia
    - Início: lento (>12 semanas)
    - Papel moderno: pouco (AR leve) ou adjuvante em LES
    - Efeitos: retinopatia (rara se <5 mg/kg/dia)
  - Tabela: início × mecanismo × dose × monitoramento × AR vs LES
- **Flashcards:** 6-8 (mecanismo metotrexato/leflunomida, contrafactual, clínico de efeitos, comparação classes)
- **Casos:** 1 (mulher com AR em DMARD por 2 meses, ainda inflamada; decidir escalar para biológico?)

### 11. **s9-mi3-01-001-05-03** — Terapias Biológicas e Alvo
- **Pai:** s9-mi3-01-001-05
- **Escopo:** "Anti-TNF, anti-IL6, anti-CD20, inibidores de JAK; triagem infecciosa e risco"
- **Profundidade:** 4 (folha)
- **Tipo:** folha
- **O que escrever:**
  - Abertura: "Biológicos são como mísseis teleguiados — vão direto ao alvo da cascata imune, mas derrubam defesa junto."
  - Classe 1: Anti-TNF (infliximab, etanercept, adalimumab, golimumab)
    - Mecanismo: TNF é citocina pró-inflamatória nuclear em AR; bloqueá-lo corta inflamação
    - Eficácia: rápida (2-4 semanas), 60-70% remissão
    - Risco: tuberculose (screening PPD obrigatório), infecções oportunistas, desmielinizantes
    - Dose: varies (adalimumab 40 mg SC 2x semana, infliximab 3 mg/kg IV semana 0/2/6, depois Q8W)
  - Classe 2: Anti-IL6 (tocilizumabe)
    - Mecanismo: IL-6 é citocina pró-inflamatória de "amplificação"; bloqueá-la reduz cascata
    - Eficácia: ~60%, perfil de resposta diferente de anti-TNF
    - Risco: infecções (menos que anti-TNF), colesterol alto
    - Dose: 8 mg/kg IV Q4W ou 162 mg SC Q2W
  - Classe 3: Anti-CD20 (rituximab)
    - Mecanismo: destrói células B (produtoras de autoanticorpos)
    - Eficácia: ~50%, onset lento (8-12 semanas); útil se AR com soropositividade alta ou LES com nefrite
    - Risco: infecções (hepatite B reativação), hipogamaglobulinemia crônica
    - Dose: 1000 mg IV x 2 (semana 0 e 2), depois pode repetir anualmente
  - Classe 4: JAK-inibidores (baricitinibe, tofacitinibe)
    - Mecanismo: JAK é via citosólica pós-receptor; bloquear JAK reduz resposta a citocinas
    - Vantagem: VO (não IV/SC)
    - Eficácia: ~60%, mais rápido (1-2 semanas)
    - Risco: trombo (raro), infecções, herpes zoster
    - Dose: baricitinib 2-4 mg/dia VO
  - Tabela: classe × mecanismo × eficácia × risco × quando trocar × custo
  - Estratégia moderna: DMARD + anti-TNF é padrão; se fail, trocar para anti-IL6 ou JAK ou anti-CD20
- **Flashcards:** 7-9 (mecanismo cada classe, comparação TNF vs IL6 vs CD20, contrafactual "sem biológicos em AR 2000?", clínico de seleção de droga)
- **Casos:** 1 (mulher em metotrexato + adalimumab por 6 meses, remissão, depois exacerbação; diagnóstico: neutralização de adalimumab, trocar para anti-IL6)

### 12. **s9-mi3-01-002** — Artrite Reumatoide (TEMA)
- **Pai:** s9-mi3-01-000
- **Escopo:** "Poliartrite inflamatória simétrica crônica com destruição articular e manifestações sistêmicas"
- **Profundidade:** 2 (tema)
- **Tipo:** tema (organizador com 5 filhos)
- **O que escrever:**
  - Abertura: "Artrite Reumatoide é a poliartrite inflamatória mais comum; aprenda a reconhecer, diagnosticar e controlar."
  - Epidemiologia: 0.5-1% população, mulheres 3x mais, pico 40-60 anos
  - História natural sem tratamento: 7 anos para erosão radiográfica grave
  - Razão evolutiva: Por que as mulheres têm mais? Estrógeno ativa B-cells, promove Th17 vs T-regs
  - Apresentação clínica em síntese: poli simétrica pequenas articulações (MCP, PIP), rigidez matinal >1 hora, progressiva
  - Manifestações extra-articulares em síntese: nódulos reumatoides, doença pulmonar intersticial, síndrome de Felty (citopenia + hepatoesplenomegalia)
  - Diagnóstico em síntese: RF+ ou anti-CCP+, critérios ACR/EULAR 2015
  - Tratamento em síntese: DMARD + biológico moderno, tratar-para-alvo = remissão
  - Prognóstico: com tratamento moderno, 30-40% consegue remissão completa; 50% remissão baixa atividade
  - Os 5 filhos serão detalhe: fisiopatologia sinovite, apresentação articular, manifestações sistêmicas, diagnóstico, tratamento
- **Flashcards:** 5-6 (reconhecimento padrão, contrafactual, clínico, armadilha "qualquer poliartrite é AR?")
- **Casos:** 0 (é organizador, casos virão nos filhos)

---

## Métricas Esperadas do LOTE 1

| Métrica | Esperado | Atual |
|---------|----------|-------|
| Produzidos | 12 | 1 |
| Aprovados | 11-12 | 1 |
| Taxa aprovação | >85% | 100% |
| Blocos para revisar | 0-2 | 0 |
| Tempo total | 4-6 horas | 30 min |

---

## Próximas Ações

1. ✓ Bloco 00 (visão geral MI3) produzido e gravado
2. → **Produzir blocos 2-12 (s9-mi3-01-000 até s9-mi3-01-002)**
   - Seguir 8 etapas ANIMA rigorosamente
   - Aplicar 3 juízes + adversarial + integrador
   - Gravar apenas APROVADOS em `public/blocos/mi3/`
3. → **Rodar `npm run manifesto`** (ao completar LOTE 1)
4. → **Reportar:** Produzidos, Aprovados, REVISAR list

---

**Espírito do lote:** Os primeiros 12 blocos são a espinha dorsal de MI3. Qualidade inviolável — nenhum bloco mediano sai daqui. Cada flashcard deve ter significado. Cada imagem deve ser didática. Cada caso deve ter uma revelação.
