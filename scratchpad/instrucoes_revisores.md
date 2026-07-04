# Instruções para Revisores (3 Juízes + Adversário)

**Bloco:** Será substituído dinamicamente
**Data:** 03/07/2026
**Disciplina:** Pediatria II (s9-ped2)

## Suas responsabilidades

### JUIZ 1 — Aderência à Filosofia ANIMA
Verifica se o bloco segue as 8 etapas obrigatórias em sequência:
1. POR QUE EXISTE (problema biológico)
2. COMO SE RESOLVE (solução sem nomear)
3. DO QUE É FEITO (composição)
4. COMO FUNCIONA (mecanismo)
5. COM O QUE SE ARTICULA (conexões)
6. NOME + ETIMOLOGIA (identidade do termo)
7. ANALOGIA CONCRETA (com mapeamento explícito)
8. IMAGEM (descrição didática)

**Checklist:**
- [ ] Abre com problema, NÃO definição?
- [ ] Cada estrutura/conceito passa por todas as 8 etapas?
- [ ] Narrativa é prosa contínua, não lista?
- [ ] Etimologia explica origem do nome?
- [ ] Analogia tem mapeamento elemento-a-elemento?

**Resultado:** APROVADO / PRECISA REVISÃO (descreva onde)

---

### JUIZ 2 — Qualidade Pedagógica (Diretrizes)
Verifica se o bloco segue as Diretrizes de Produção:
- Um tema = um bloco (granularidade)
- Continuidade com bloco anterior
- Tom esperado (professor admirado, português BR)
- Evita anti-padrões (listas secas, definições abertas, etc.)

**Checklist:**
- [ ] O bloco cobre um único conceito coerente?
- [ ] Começa reconhecendo bloco anterior?
- [ ] Tom é conversacional, não enciclopédico?
- [ ] Sem listas no corpo (tudo em prosa)?
- [ ] Parágrafos têm 3-6 linhas máx?

**Resultado:** APROVADO / PRECISA REVISÃO

---

### JUIZ 3 — Precisão Médica + Componentes
Verifica precisão científica e presença de componentes:

**Checklist:**
- [ ] Fatos médicos estão corretos/verificáveis?
- [ ] Contém 5-8 flashcards variados (por_que, mecanismo, contrafactual, clinico)?
- [ ] Se há caso clínico, segue cascata 5 etapas (Causa→Estrutura→Disfunção→Sintoma→Consequência)?
- [ ] Conexões estão presentes (pré-req + 3 futuras)?
- [ ] Imagens têm prompts descritivos?

**Resultado:** APROVADO / PRECISA REVISÃO

---

### ADVERSÁRIO — Teste de Rigor
Você ataca o bloco como alguém que quer encontrar falhas:
- Um estudante conseguiria explicar esse conceito depois de ler?
- O bloco assume conhecimento não coberto?
- Há contradições internas?
- As analogias fazem sentido de verdade ou são forçadas?
- A clínica conectada é realista?

**Resultado:** PASSA (rigor OK) / FALHA (descreva o problema)

---

## Output esperado

Cada juiz + adversário responde em JSON:

```json
{
  "bloco_id": "s9-ped2-XX-XXX",
  "revisor": "JUIZ1 | JUIZ2 | JUIZ3 | ADVERSARIO",
  "resultado": "APROVADO / PRECISA_REVISAO / FALHA",
  "pontuacao": 0-10,
  "observacoes": "texto",
  "recomendacoes_especificas": ["item1", "item2"]
}
```

---

## Tempo estimado
- Leitura + análise: 5-7 minutos por bloco
- 12 blocos × 4 revisores = ~48 revisores independentes
- Executar em paralelo por bloco

Se mais de 2 juízes disserem PRECISA_REVISAO, bloco entra em fila de revisão do Integrador.
