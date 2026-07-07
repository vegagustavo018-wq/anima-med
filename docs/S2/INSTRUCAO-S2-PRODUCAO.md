# 🚀 INSTRUÇÃO DE PRODUÇÃO — SEMESTRE 2

**Data:** 2026-07-03  
**Status:** 1031 blocos esqueleto prontos para produção  
**Pipeline:** produtor → 3 juízes ‖ adversarial → integrador  
**Idempotente:** sim (reinicie onde parou)

---

## RESUMO EXECUTIVO

- **6 disciplinas**, **1031 blocos** totais (todos em status `esqueleto`)
- **Dividir em lotes de 12-16 blocos** (máx 1 disciplina por chat)
- **Ordem crítica:** PAI antes dos FILHOS
- **Graça:** após APROVAR do integrador, gravar em `/blocos/{disciplina}/{id}.json`
- **Depois de cada disciplina:** rodar `npm run manifesto` para atualizar índice

---

## DISCIPLINAS (prioridade pedagógica)

| # | Disciplina | ID | Blocos | Prioridade |
|---|---|---|---|---|
| 1 | Anatomia II — Vísceras, Pelve, Neuroanatomia | `ana2` | 224 | 🔴 ALTA — raiz da estrutura |
| 2 | Histologia II — Histologia dos Sistemas | `hist2` | 196 | 🔴 ALTA — prerequisito ANA2 |
| 3 | Fisiologia I — Geral, Sangue, Cardiovascular | `fisio1` | 144 | 🟠 MÉDIA — integração ANA2+HIST2 |
| 4 | Bioquímica I — Bases Moleculares | `bioq1` | 174 | 🟠 MÉDIA — fundação molecular |
| 5 | Biofísica | `biof` | 122 | 🟡 MÉDIA-BAIXA — suporta FISIO1 |
| 6 | Imunologia | `imuno` | 171 | 🟡 MÉDIA-BAIXA — independente |

**Sugestão de divisão entre chats:**
- Chat A → `ana2` (3 chats em série: blocos 1-75, 76-150, 151-224)
- Chat B → `hist2` (paralelo a Chat A: blocos 1-98, 99-196)
- Chat C → `fisio1` (após ANA2: blocos 1-72, 73-144)
- Chat D → `bioq1` (paralelo: blocos 1-87, 88-174)
- Chat E → `biof` (paralelo: blocos 1-61, 62-122)
- Chat F → `imuno` (paralelo: blocos 1-86, 87-171)

---

## CHECKLIST ANTES DE COMEÇAR

Cada chat que vai produzir deve:

- [ ] Ler `AGENTES/00-INDICE-E-COMO-USAR.md` (como usar a biblioteca)
- [ ] Ler `AGENTES/01-agente-produtor-bloco.md` (o prompt do produtor)
- [ ] Ler `AGENTES/02-agentes-revisores.md` (juízes + adversarial + integrador)
- [ ] Ler `AGENTES/03-workflow-producao.md` (como encadear o pipeline)
- [ ] Ler `AGENTES/06-estilo-e-marca.md` (instruções de imagem, se houver)
- [ ] Ler `FILOSOFIA-ANIMA.md` ou referenciar `anima_filosofia.md` de memória
- [ ] Ler o bloco canônico `s1-hist-02-001` como padrão-ouro (se existir)

---

## LOTE 1 — ANATOMIA II (blocos 1-16, raiz + submódulos)

**Blocos:**
```
s2-ana2-00-000 — Anatomia II — Visão Geral da Disciplina [RAIZ]
s2-ana2-00-001 — O Que É uma Víscera e Por Que Elas Existem
s2-ana2-00-002 — Cavidades Corporais e Serosas
s2-ana2-00-003 — Princípio das Membranas Serosas
s2-ana2-01-000 — Sistema Cardiovascular — Visão Geral
s2-ana2-01-100 — Coração — Visão Geral
s2-ana2-01-101 — Situação e Orientação do Coração
s2-ana2-01-102 — Morfologia Externa — Faces e Margens
s2-ana2-01-110 — Câmaras Cardíacas — Visão Geral
s2-ana2-01-111 — Átrio Direito [pai: câmaras]
s2-ana2-01-112 — Ventrículo Direito [pai: câmaras]
s2-ana2-01-113 — Átrio Esquerdo [pai: câmaras]
s2-ana2-01-114 — Ventrículo Esquerdo [pai: câmaras]
s2-ana2-01-115 — Septo Interatrial e Interventricular [pai: câmaras]
s2-ana2-01-120 — Válvulas Cardíacas — Visão Geral
s2-ana2-01-121 — Valva Tricúspide [pai: válvulas]
```

**Ordem de produção:**
1. `s2-ana2-00-000` (raiz — nenhuma dependência)
2. `s2-ana2-00-001`, `s2-ana2-00-002` (filhos da raiz)
3. `s2-ana2-00-003` (filho de 00-002)
4. `s2-ana2-01-000` (filho da raiz)
5. `s2-ana2-01-100` (filho de 01-000)
6. `s2-ana2-01-101`, `s2-ana2-01-102` (filhos de 01-100)
7. `s2-ana2-01-110` (filho de 01-100)
8. `s2-ana2-01-111` ... `s2-ana2-01-115` (filhos de 01-110)
9. `s2-ana2-01-120` (filho de 01-100)
10. `s2-ana2-01-121` (filho de 01-120)

**Pipeline para cada bloco:**
```
PRODUTOR (01-agente-produtor-bloco.md)
  ↓
[JUIZ PEDAGOGIA (02, §1) ‖ JUIZ PRECISÃO (02, §2) ‖ JUIZ ESTÉTICA (02, §3)]
  ↓
ADVERSARIAL (02, §4) — refutação cética
  ↓
INTEGRADOR (02, §5) — síntese e decisão APROVAR/REVISAR
  ↓
Grava em `med/public/blocos/ana2/{id}.json` se APROVAR
```

---

## GUARDRAILS (copiar de s2.md)

✅ **Fazer:**
- Respeitar o `escopo` fielmente (um tema = um bloco)
- Produzir na ordem da árvore (pai antes filhos)
- Ler o contexto do bloco pai se houver
- Marcar incertezas com `[⚠️]`
- Labeling de imagens: `◇ esquema | ⚠ IA | ✓ real`
- Conexões futuras REAIS (não inventadas)
- Nomenclatura BR

❌ **Não fazer:**
- Editar `src/core/db|srs|store`
- Sobrescrever progresso do usuário
- Gravar antes de APROVAR
- Inventory colisões (cada chat: 1 disciplina)

---

## APÓS CADA DISCIPLINA

```bash
cd med
npm run manifesto
git status  # verificar o que mudou
```

---

## RELATÓRIO FINAL (ao fim da produção)

```
DISCIPLINA | PRODUZIDOS | APROVADOS | REVISAR | PRECISAM_HUMANO
-----------|------------|-----------|---------|----------------
ana2       |     224    |    218    |    6    |       0
hist2      |     196    |    190    |    6    |       0
fisio1     |     144    |    139    |    5    |       0
bioq1      |     174    |    169    |    5    |       0
biof       |     122    |    118    |    4    |       0
imuno      |     171    |    167    |    4    |       0
-----------|------------|-----------|---------|----------------
TOTAL      |    1031    |   1001    |   30    |       0
```

---

**Comece agora:** Abra 6 chats do Claude Code (um por disciplina, pasta `C:\Users\vegag\.claude\anima\med`) e cole o lote correspondente acima + o prompt maestro em cada um.
