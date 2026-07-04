# README — Lote Piloto GO1 (s7-go1)

Bem-vindo ao pipeline de produção do Lote Piloto GO1 (Ginecologia-Obstetrícia I).

Este diretório contém toda a infraestrutura, documentação e scripts para **completar a produção dos 10 blocos piloto** através de um rigoroso processo de validação.

---

## 🎯 Objetivo

Transformar 10 esqueletos de blocos GO1 em blocos **produção-ready**, cada um com:
- ✅ Narrativa seguindo as 8 Etapas ANIMA
- ✅ Flashcards variados (5-10 cada)
- ✅ Casos clínicos com revelação
- ✅ Conexões estruturadas
- ✅ Validação por 4 agentes especializados

---

## 📁 Arquivos (Ordem de Leitura)

### 1. **LOTE_GO1_PLANO_EXECUCAO.md** ← COMECE AQUI
   - Mapa dos 10 blocos piloto
   - Fluxo de aprovação (cascata de 5 agentes)
   - Timeline esperado
   - Critérios de aprovação

### 2. **INSTRUÇÕES_LOTE_GO1.md**
   - 4 PROMPTS prontos para copiar/colar em abas do Claude
   - Juiz Pedagogia
   - Juiz Precisão
   - Juiz Estética  
   - Adversarial
   - Integrador
   - Troubleshooting

### 3. **CHECKLIST_EXECUCAO_LOTE_GO1.md**
   - Checklist passo-a-passo para os 10 blocos
   - Planilha de notas e decisões
   - Relatório final

### 4. **RELATORIO_LOTE_GO1_CONCLUSAO.md**
   - O que foi entregue nesta sessão (documentação)
   - Status atual dos blocos
   - Próximas ações
   - Dependências

### 5. **LOTE_GO1_ORQUESTRADOR.ps1** (Opcional)
   - Script PowerShell para automação futura
   - Integração com npm run manifesto
   - Modo DRY-RUN para teste

### 6. **TESTE_APROVACAO_BLOCO.ps1** (Teste)
   - Simular fluxo completo em um bloco
   - Validação de JSON
   - Gravação de teste

---

## ⚡ Quick Start (5 minutos)

1. **Ler o plano:**
   ```
   cat LOTE_GO1_PLANO_EXECUCAO.md
   ```

2. **Confirmar que produtores retornaram com conteúdo:**
   ```powershell
   cat .\dist\blocos\go1\s7-go1-00-000.json | jq '.narrativa | length'
   # Deve retornar > 0, não []
   ```

3. **Abrir 5 abas do Claude** para os 5 agentes

4. **Copiar/colar PROMPTS** de INSTRUÇÕES_LOTE_GO1.md

5. **Seguir CHECKLIST_EXECUCAO_LOTE_GO1.md**

---

## 🔄 Fluxo Resumido

Para CADA bloco:

```
JSON (com narrativa, flashcards, casos)
    ↓
┌─ 3 JUÍZES EM PARALELO (30 min)
│  • Pedagogia
│  • Precisão
│  • Estética
│  └→ Cada retorna: nota, pontos fortes/fracos
│
├─ ADVERSARIAL (20 min)
│  └→ Retorna: críticas, risco (CRÍTICO/ALTO/MÉDIO/BAIXO)
│
├─ INTEGRADOR (30 min)
│  └→ Sintetiza tudo → decisão: APROVAR ou REVISAR
│
└─ GRAVAÇÃO (10 min, se APROVADO)
   └→ Grava em dist/blocos/go1/{id}.json
      → Atualiza metadata.status = "produção"
      → Rodar npm run manifesto
```

**Tempo por bloco:** ~90 minutos  
**Tempo para 10 blocos:** ~15 horas real, ou ~4-5 horas em paralelo (3 blocos por lote)

---

## 📊 Blocos Piloto

| # | ID | Título | Tipo | Profund. |
|---|-------|--------|------|----------|
| 1 | `s7-go1-00-000` | Ginecologia — Visão Geral | disciplina | 1 |
| 2 | `s7-go1-00-001` | O Que a Ginecologia Cuida | visao_geral | 2 |
| 3 | `s7-go1-00-002` | Anatomia Genital Aplicada | folha | 3 |
| 4 | `s7-go1-00-003` | Embriologia Mülleriana | folha | 3 |
| 5 | `s7-go1-01-000` | Módulo 1 — Ciclo HHO | modulo | 2 |
| 6 | `s7-go1-01-001` | Por Que Existe um Ciclo | visao_geral | 3 |
| 7 | `s7-go1-01-002` | Eixo Hipotálamo-Hipófise-Ovário | folha | 3 |
| 8 | `s7-go1-01-003` | Retroalimentação Hormonal | folha | 3 |
| 9 | `s7-go1-01-004` | Fase Folicular | folha | 3 |
| 10 | `s7-go1-01-005` | Ovulação | folha | 3 |

---

## 🧠 As 8 Etapas ANIMA (Essencial)

Cada bloco **DEVE conter** na narrativa:

1. **Por Que** — Problema biológico/clínico existencial
2. **Analogia** — Comparação que ilumina
3. **Fatos** — Por que este conceito existe
4. **Definição** — O que é exatamente (operacional)
5. **Funcionamento** — Como funciona passo a passo
6. **Articulação** — Com o que se conecta (outros blocos)
7. **Nomeação** — Etimologia (por que chamam assim)
8. **Imagem** — Esquema visual (real ou IA)

Leia `ANIMA_BLOCO_CANONICO.md` no diretório `ANIMA/` para exemplo prático.

---

## ✅ Critérios de Aprovação

### Juiz Pedagogia
- ✅ As 8 etapas ANIMA estão presentes?
- ✅ Flashcards testam conceitos-chave (não detalhes)?
- ✅ Casos têm "revelação" (twist final)?
- ✅ Linguagem é acessível sem simplificar?

### Juiz Precisão
- ✅ Mecanismo fisiológico é correto?
- ✅ Terminologia é exata?
- ✅ Sem erros científicos silenciosos?
- ✅ Consistente com blocos pais/filhos?

### Juiz Estética
- ✅ Imagens são claras e legíveis?
- ✅ Proporção texto:imagem saudável?
- ✅ Analogias iluminam (não confundem)?
- ✅ Conexões laterais bem linkadas?

### Adversarial
- ❌ Encontra armadilhas pedagógicas?
- ❌ Encontra erros científicos sutis?
- ❌ Encontra gaps na narrativa?
- ❌ Encontra conteúdo fora de escopo?

### Integrador
- 🔄 Sintetiza os 4 feedbacks
- 🔄 Pesa: erros científicos > falhas pedagógicas > estética
- 🔄 Retorna: APROVAR (pronto para gravar) ou REVISAR (volta para produtor)

---

## 🛠️ Técnico: Gravação de Bloco

Após INTEGRADOR aprovar:

```powershell
# 1. PowerShell
$bloco = [JSON do integrador] | ConvertFrom-Json

# 2. Atualizar metadata
$bloco.metadata.status = "produção"
$bloco.metadata.data_ultima_revisao = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
$bloco.metadata.nivel_confianca = "validado"
$bloco.metadata.versao = "1.0"

# 3. Gravar
$path = "C:\Users\vegag\.claude\anima\med\dist\blocos\go1\[ID].json"
$bloco | ConvertTo-Json -Depth 20 | Out-File -Encoding UTF8 -Path $path -Force

# 4. Validar
Test-Json -Path $path

# 5. Registrar
cd "C:\Users\vegag\.claude\anima\med"
npm run manifesto
```

---

## 📈 Métricas Esperadas

| Métrica | Meta |
|---------|------|
| **Blocos processados** | 10/10 |
| **Aprovados** | 9-10 |
| **Taxa aprovação** | >85% |
| **Tempo total** | 3-4 horas |
| **Nota média final** | 8.0+/10 |

---

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| Juiz retorna nota baixa (<5) | Bloco volta para PRODUTOR revisar |
| Integrador diz REVISAR | Seguir lista exata de correções |
| JSON não valida | Verificar encoding UTF8 e sintaxe JSON |
| `npm run manifesto` falha | Rodar `Test-Json` no arquivo antes |
| Flashcards muito específicos | Juiz Pedagogia deve rejeitar |
| Casos sem revelação | Adversarial deve encontrar |

---

## 📚 Referências Internas

- `ANIMA_FILOSOFIA.md` — Constituição pedagógica do ANIMA
- `ANIMA_BLOCO_CANONICO.md` — Template de referência (Tecido Epitelial)
- `ANIMA_DIRETRIZES_PRODUCAO.md` — Padrão de escrita de blocos
- `ANIMA_BIBLIOTECA_AGENTES.md` — Prompts aprovados para agentes
- `blueprint/s7-go1-blueprint.json` — Estrutura dos 10 blocos piloto

---

## 🎓 Próximas Etapas (Pós-GO1)

1. ✅ **Lote GO1** (este) — 10 blocos
2. ⏳ **Lotes GO2-GO4** — 3× mais disciplinas
3. ⏳ **Todas as 14 disciplinas do Semestre 7**
4. ⏳ **Semestres 8-10** (100+ disciplinas)

---

## 👤 Quem Pode Ajudar

- **Produtor:** Gera narrativa, flashcards, casos a partir do blueprint
- **Juiz Pedagogia:** Valida estrutura ANIMA e didática
- **Juiz Precisão:** Valida ciência e rigor
- **Juiz Estética:** Valida clareza visual e conexões
- **Adversarial:** Critica técnica independente
- **Integrador:** Sintetiza tudo e aprova/rejeita

---

## 📞 Suporte

Para dúvidas:
1. Ler **INSTRUÇÕES_LOTE_GO1.md** (seção Troubleshooting)
2. Verificar **LOTE_GO1_PLANO_EXECUCAO.md** (critérios)
3. Consultar **RELATORIO_LOTE_GO1_CONCLUSAO.md** (contexto)

---

## 📌 Status Atual

| Fase | Status |
|------|--------|
| Planejamento | ✅ COMPLETO |
| Documentação | ✅ COMPLETO (5 docs) |
| Scripts | ✅ COMPLETO (3 scripts PS) |
| Produção de Conteúdo | ⏳ PENDENTE (blocos 2-10 vazios) |
| Validação | ⏳ PRONTO (aguardando conteúdo) |
| Gravação | ⏳ PRONTO (scripts prontos) |
| Manifesto | ⏳ PRONTO (comando pronto) |

**Próximo passo:** Disparar Produtores para preencher blocos 2-10.

---

**Criado em:** 3 de julho de 2026  
**Última atualização:** 3 de julho de 2026, 23:55 UTC  
**Versão:** 1.0  

