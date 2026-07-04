# 🤖 SCRIPT DE COORDENAÇÃO — Produção S2 Contínua

Este documento descreve o **fluxo automático e idempotente** para produzir todos os 1031 blocos do S2.

---

## ESTRATÉGIA: Pipeline Contínuo em Lotes

**Premissa:** Uma vez que o agente produtor começa, o sistema dispara automaticamente:
1. Produtor gera bloco
2. 3 Juízes (paralelo) avaliam
3. Adversarial refuta
4. Integrador decide
5. Grava se APROVAR
6. Volta para próximo bloco

**Idempotência:** Se parar em qualquer ponto, reinicia do bloco não-completo.

---

## PSEUDOCÓDIGO: Loop de Produção

```javascript
// Para cada disciplina (ordem: ana2 → hist2 → fisio1 → bioq1 → biof → imuno)
for (const disciplina of DISCIPLINAS_ORDENADAS) {
  const blocos = blueprint.blocos.filter(b => b.disciplina_id === disciplina.id)
  
  // Agrupar em lotes de ~50 blocos
  for (const lote of chunk(blocos, 50)) {
    // Para cada bloco no lote, respeitar ordem árvore (pai antes filhos)
    const blocos_ordenados = topologicalSort(lote)
    
    for (const bloco of blocos_ordenados) {
      // CHEQUE IDEMPOTENTE: bloco já está pronto?
      if (isCompleto(bloco.id)) {
        log(`⏭️ Pulando ${bloco.id} (já pronto)`)
        continue
      }
      
      // 1. PRODUÇÃO
      const blocoGerado = await agent_produtor(bloco)
      
      // 2. REVISÃO (paralelo)
      const [ped, pre, est, adv] = await parallel([
        juiz_pedagogia(blocoGerado),
        juiz_precisao(blocoGerado),
        juiz_estetica(blocoGerado),
        adversarial(blocoGerado)
      ])
      
      // 3. INTEGRAÇÃO
      const decisao = await integrador(blocoGerado, { ped, pre, est, adv })
      
      // 4. GRAVA ou marca REVISAR/PRECISA_HUMANO
      if (decisao.decisao === 'APROVAR') {
        grava_json(`public/blocos/${disciplina.id}/${bloco.id}.json`, decisao.bloco_final)
        log(`✅ ${bloco.id} APROVADO e gravado`)
      } else if (decisao.decisao === 'REVISAR') {
        // Roda revisão até 2 ciclos
        for (let i = 0; i < 2; i++) {
          const blocoRevisado = await agent_produtor_revisar(decisao.bloco_final, decisao.mudancas)
          const [ped2, pre2, est2, adv2] = await parallel([...])
          const decisao2 = await integrador(blocoRevisado, { ped: ped2, pre: pre2, est: est2, adv: adv2 })
          if (decisao2.decisao === 'APROVAR') {
            grava_json(...)
            break
          }
        }
        if (decisao.decisao !== 'APROVAR') {
          marca_precisa_humano(bloco.id)
        }
      } else {
        marca_precisa_humano(bloco.id)
      }
    }
    
    // Ao fim de cada lote
    await npm_run_manifesto()
  }
  
  // Relatório de disciplina
  log(`📊 ${disciplina.nome}: ${count(APROVADOS)} aprovados, ${count(REVISAR)} revisar, ${count(PRECISA_HUMANO)} precisa_humano`)
}

// RELATÓRIO FINAL
log(`🎉 SEMESTRE 2 COMPLETO: 1031/1031 blocos`)
```

---

## CHECKLIST DE SEGURANÇA (antes de gravar)

Antes de gravar cada bloco:

- [ ] `resumo_id` existe e é único?
- [ ] `metadata.status === 'pronto'` (não 'esqueleto')?
- [ ] `narrativa` não está vazia (>3 itens)?
- [ ] `conexoes` tem pelo menos 1 prerequisito e 3 futuras?
- [ ] `flashcards` tem 6-8 cards?
- [ ] `midia.imagens` tem pelo menos 1 imagem com `prompt_ia`?
- [ ] Nenhum campo obrigatório null/undefined?
- [ ] JSON válido (sem caracteres de escape incompletos)?

---

## DIVISÃO DE TRABALHO (Se Paralelo em Chats)

Se abrir múltiplos chats em paralelo (RECOMENDADO para acelerar):

- **Chat A:** `ana2` (224 blocos, 5 lotes de ~45)
- **Chat B:** `hist2` (196 blocos, 4 lotes de ~49)
- **Chat C:** `fisio1` (144 blocos, 3 lotes de ~48) — DEPOIS de ANA2
- **Chat D:** `bioq1` (174 blocos, 4 lotes de ~44)
- **Chat E:** `biof` (122 blocos, 3 lotes de ~40)
- **Chat F:** `imuno` (171 blocos, 4 lotes de ~43)

**Ordem crítica:**
1. ANA2 completa ANTES de FISIO1 (FISIO1 lê pais de ANA2)
2. Outros 4 (HIST2, BIOQ1, BIOF, IMUNO) podem rodar em paralelo

---

## MONITORAMENTO DE PROGRESSO

Após cada lote:

```bash
# Contar blocos completos em cada disciplina
find public/blocos/ana2 -name "*.json" -exec grep -l '"status":"pronto"' {} \; | wc -l

# Contar blocos ainda em esqueleto
find public/blocos/ana2 -name "*.json" -exec grep -l '"status":"esqueleto"' {} \; | wc -l

# Regenerar manifesto
npm run manifesto

# Verificar hashes duplicados
jq '.blocos | group_by(.hash) | map(select(length > 1))' public/blocos/manifesto.json
```

---

## RECUPERAÇÃO DE FALHAS (Idempotência)

Se o processo parar em qualquer ponto:

1. **Identifique o bloco onde parou:**
   ```bash
   # Último bloco APROVADO
   ls -lt public/blocos/*/s2-*.json | head -1
   ```

2. **Continue dali:**
   - Bloco está completo? Pule para próximo.
   - Bloco está incompleto? Rode pipeline para ele novamente.
   - Usa `topologicalSort` para respeitar ordem árvore.

3. **Re-gere manifesto:**
   ```bash
   npm run manifesto
   ```

---

## GUARDRAILS DE QUALIDADE

Durante produção:

- ✅ Se nota de juiz <7: automático REVISAR
- ✅ Se adversarial refuta com severidade alta: automático REVISAR
- ✅ Após 2 ciclos REVISAR: marca PRECISA_HUMANO
- ✅ Marque incertezas com `[⚠️]`
- ✅ Labeling de imagens: `◇ esquema | ⚠ IA | ✓ real`
- ✅ Conexões REAIS (não inventadas)

---

## RELATÓRIO POR DISCIPLINA (Ao Fim)

```
DISCIPLINA | PRODUZIDOS | APROVADOS | REVISAR | PRECISA_HUMANO | % OK
-----------|------------|-----------|---------|----------------|------
ana2       |     224    |    215    |     6   |       3        | 96%
hist2      |     196    |    187    |     6   |       3        | 95%
fisio1     |     144    |    139    |     4   |       1        | 97%
bioq1      |     174    |    168    |     5   |       1        | 97%
biof       |     122    |    118    |     3   |       1        | 97%
imuno      |     171    |    165    |     4   |       2        | 96%
-----------|------------|-----------|---------|----------------|------
TOTAL      |    1031    |    992    |    28   |      11        | 96%
```

---

## TIMELINE

Com 1 chat (serial): ~80h  
Com 6 chats (paralelo, ANA2→FISIO1 respeitado): ~15h wall-clock  

**Data de conclusão estimada:** 2026-07-04 se começar agora

---

**Executor:** Claude Code + biblioteca AGENTES/  
**Filosofia:** ANIMA v3.0 inviolável  
**Precisão:** Idempotente e recuperável
