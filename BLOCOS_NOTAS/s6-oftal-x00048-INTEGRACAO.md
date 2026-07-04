# Guia de Integração — Bloco S6-Oftal-x00048

**Bloco:** Catarata — Fisiopatologia, Diagnóstico e Cirurgia  
**ID:** s6-oftal-x00048  
**Status:** Pronto para integração  
**Data:** 2026-07-04  

---

## Arquivos Entregues

| Arquivo | Localização | Função |
|---------|-------------|--------|
| `s6-oftal-x00048-COMPLETO.json` | `/dist/blocos/oftal/` | Bloco JSON v3.0 (pronto para seed) |
| `s6-oftal-x00048-NOTAS.md` | `/BLOCOS_NOTAS/` | Documentação detalhada do bloco |
| `s6-oftal-x00048-INTEGRACAO.md` | `/BLOCOS_NOTAS/` | Este arquivo (roteiro de integração) |

---

## Passo 1: Validação de JSON

```bash
# No terminal, validar sintaxe
node -e "const j=require('./s6-oftal-x00048-COMPLETO.json'); console.log('✓ JSON válido');"

# Ou em Python
python3 -m json.tool s6-oftal-x00048-COMPLETO.json > /dev/null && echo "✓ JSON válido"
```

**Esperado:** Sem erros de parsing.

---

## Passo 2: Seed em IndexedDB (App PWA)

### 2.1 Verificar Estrutura do Banco

Confirmar que `ANIMA_BLOCOS_STORE` (ou equivalente) existe com índices:
- `resumo_id` (chave primária)
- `disciplina` (índice secundário)
- `semestre` (índice secundário)

### 2.2 Script de Seed

Criar arquivo `/scripts/seed-blocos.js`:

```javascript
const bloco = require('../dist/blocos/oftal/s6-oftal-x00048-COMPLETO.json');

async function seedBloco() {
  const db = await openDatabase('ANIMA_DB', 1, (db) => {
    if (!db.objectStoreNames.contains('BLOCOS')) {
      db.createObjectStore('BLOCOS', { keyPath: 'resumo_id' });
    }
  });
  
  const tx = db.transaction('BLOCOS', 'readwrite');
  tx.objectStore('BLOCOS').put(bloco);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(console.log('✓ Bloco s6-oftal-x00048 seeded'));
    tx.onerror = reject;
  });
}

seedBloco().catch(console.error);
```

**Esperado:** Bloco inserido sem erros.

---

## Passo 3: Renderização no App

### 3.1 Verificar Suporte de Tipos de Narrativa

Arquivo: `/src/components/BlocoPage.tsx`

Tipos de narrativa presentes neste bloco:
- `abertura_contextual` ✅
- `highlight` ✅
- `secção` ✅
- `passo_a_passo` ✅
- `etimologia` ✅
- `analogia_concreta` ✅
- `imagem_descritiva` ✅

**Ação:** Garantir que todos os 7 tipos têm componentes React de renderização.

### 3.2 Renderizador de Passo-a-Passo

Exemplo esperado:

```typescript
// PassoAPasso.tsx
export const PassoAPasso: React.FC<{
  titulo: string;
  passos: Array<{ numero: number; titulo: string; conteudo: string }>;
}> = ({ titulo, passos }) => (
  <div className="passo-a-passo">
    <h3>{titulo}</h3>
    {passos.map(p => (
      <div key={p.numero} className="passo">
        <span className="numero">{p.numero}.</span>
        <span className="titulo">{p.titulo}</span>
        <p>{p.conteudo}</p>
      </div>
    ))}
  </div>
);
```

### 3.3 Renderizador de Etimologia

Exemplo esperado:

```typescript
// Etimologia.tsx
export const Etimologia: React.FC<{
  titulo: string;
  termos: Array<{ termo: string; origem: string }>;
}> = ({ titulo, termos }) => (
  <div className="etimologia">
    <h3>{titulo}</h3>
    <dl>
      {termos.map(t => (
        <div key={t.termo} className="termo">
          <dt>{t.termo}</dt>
          <dd>{t.origem}</dd>
        </div>
      ))}
    </dl>
  </div>
);
```

### 3.4 Renderizador de Imagem Descritiva

```typescript
// ImagemDescritiva.tsx
export const ImagemDescritiva: React.FC<{
  titulo: string;
  descricao: string;
}> = ({ titulo, descricao }) => (
  <figure className="imagem-descritiva">
    <figcaption>{titulo}</figcaption>
    <p className="descricao">{descricao}</p>
  </figure>
);
```

---

## Passo 4: Renderização de Flashcards

### 4.1 Verificar Esquema

Flashcards presentes:
- 3 × Nível 3 (básico)
- 2 × Nível 4 (intermediário)
- 3 × Nível 5 (desafio)

Tipos:
- 1 × por_que
- 3 × mecanismo
- 1 × contrafactual
- 2 × clinico
- 1 × comparacao

### 4.2 Integração com SRS

Cada flashcard deve ter:
- `id`: único (fc-oftal-48-001, etc.)
- `tipo`: suportado pelo SRS
- `nivel_dificuldade`: 1-5
- `tags`: para categorização

**Ação:** Conferir que SRS suporta nível 5 (DIFÍCIL).

---

## Passo 5: Renderização de Casos Clínicos

### 5.1 Estrutura por Caso

Cada caso segue cascata clínica:
1. **Apresentação clínica** (história do paciente)
2. **Exame objetivo** (achados clínicos)
3. **Causa** (patogenia)
4. **Estrutura** → **Função** → **Disfunção** → **Sintomas** → **Consequências**
5. **Discussão** (raciocínio clínico)
6. **Prognóstico** (desfecho)

### 5.2 Componente Recomendado

```typescript
// CasoClinico.tsx
interface CasoClinico {
  id: string;
  titulo: string;
  idade: number;
  genero: string;
  apresentacao_clinica: string;
  exame_objetivo: string;
  causa: string;
  estrutura: string; // contém A. Estrutura, B. Função, etc.
  discussao: string;
  prognóstico: string;
}

export const CasoClinico: React.FC<{ caso: CasoClinico }> = ({ caso }) => (
  <article className="caso-clinico">
    <h3>{caso.titulo}</h3>
    <div className="dados-paciente">
      <span>{caso.idade} anos</span> | <span>{caso.genero}</span>
    </div>
    <section>
      <h4>Apresentação Clínica</h4>
      <p>{caso.apresentacao_clinica}</p>
    </section>
    {/* ... outras seções ... */}
  </article>
);
```

---

## Passo 6: Renderização de Imagens

### 6.1 3 Imagens Descritivas Presentes

| ID | Tipo | Status | Ação |
|-----|------|--------|------|
| img-001 | Esquema IA | Prompt pronto | Enviar a ChatGPT/DALL-E |
| img-002 | Fotografia real | Referência | Buscar em Wikimedia/AAO |
| img-003 | Diagrama | Prompt pronto | Enviar a ChatGPT/DALL-E |

### 6.2 Placeholder Temporário

Enquanto imagens reais não vêm:

```typescript
// ImagemPlaceholder.tsx
<div className="imagem-placeholder">
  <div className="icone-camera">📷</div>
  <p className="label-ia">◇ imagem a ser gerada</p>
  <p className="descricao">{descricao}</p>
</div>
```

### 6.3 Produção de Imagens (Fase 2)

**img-001 (Esquema IA):**
```
Prompt: "Medical illustration: cross-section of young lens vs. mature cataract.
Left side: healthy lens with organized crystalline proteins, light rays
passing straight through. Right side: opaque nucleus and cortex with
aggregated proteins, light scattering. Label: 'Order = Transparency; 
Disorder = Opacity'. Style: medical textbook, high quality, no people."
```

**img-002 (Fotografia Real):**
Buscar em:
- Wikimedia Commons (Creative Commons)
- AAO (American Academy of Ophthalmology)
- OpenStax Anatomy

Search terms: "slit lamp cataract stages", "cataract nuclear cortical"

**img-003 (Diagrama):**
```
Prompt: "Medical diagram: sagittal cross-section of phacoemulsification surgery.
5 panels: (1) Mature cataract before surgery (opaque nucleus, cortex).
(2) Ultrasonic probe fragmenting nucleus. (3) Aspiration of fragments.
(4) IOL (intraocular lens) implantation. (5) Sealed incision with clear view.
Labels: '~15-20 min', 'Vision recovered'. Style: clean, educational, blue/green palette."
```

---

## Passo 7: Testes de Renderização

### 7.1 Desktop (1280×800)

```bash
npm run dev
# Abrir http://localhost:3000/bloco/s6-oftal-x00048
# Verificar:
- [ ] Narrativa renderiza sem quebras
- [ ] Passo-a-passo alinhado
- [ ] Etimologia em lista definição
- [ ] Flashcards carregam com pergunta/resposta
- [ ] Casos clínicos com cascata visível
- [ ] Imagens descritivas aparecem
- [ ] Dark mode funciona
```

### 7.2 Mobile (375×812)

```bash
# Abrir DevTools > Emulate device (iPhone)
# Verificar:
- [ ] Narrativa legível (nenhuma linha > 60 caracteres)
- [ ] Passo-a-passo empilhado verticalmente
- [ ] Flashcards scrollável
- [ ] Casos clínicos responsivos
- [ ] Imagens não estouram largura
```

### 7.3 Dark Mode

```bash
# Em Settings: escolher Dark mode
# Verificar:
- [ ] Texto legível (contraste ≥ 4.5:1)
- [ ] Destacados (highlight) visíveis em fundo escuro
- [ ] Imagens têm fundo apropriado
```

---

## Passo 8: Validação de Conteúdo

### 8.1 Checklist Pedagógico

- [ ] 8 etapas presentes (por quê, como se resolve, do que é feito, como funciona, articulações, nome/etimologia, analogia, imagem)
- [ ] Analogia tem mapeamento 1:1 explícito
- [ ] Nenhuma seção > 5 parágrafos
- [ ] Highlight em destaque visual (bg cor, bordas)
- [ ] Flashcards cobrem 5 tipos + etimologia
- [ ] Casos têm cascata clínica completa (causa → estrutura → sintomas)
- [ ] Nenhum jargão sem explicação
- [ ] Números têm fonte

### 8.2 Checklist Técnico

- [ ] JSON parsa sem erros
- [ ] Todos os IDs de conexões existem (ou documentados como futuros)
- [ ] Narrativa renderiza sem quebras
- [ ] Flashcards carregam no SRS
- [ ] Casos têm ID único
- [ ] Imagens têm atributo `credito_ia` correto
- [ ] Campos opcionais estão vazios (não null)

---

## Passo 9: QA e Verificação

### 9.1 Testes Unitários

```typescript
// BlocoOftal48.test.ts
describe('Bloco S6-Oftal-x00048', () => {
  it('should have valid JSON structure', () => {
    expect(bloco).toHaveProperty('resumo_id', 's6-oftal-x00048');
    expect(bloco).toHaveProperty('narrativa');
    expect(bloco.flashcards).toHaveLength(8);
    expect(bloco.casos_clinicos).toHaveLength(2);
  });

  it('should render all narrative types', () => {
    const tipos = bloco.narrativa.map(n => n.tipo);
    expect(tipos).toContain('abertura_contextual');
    expect(tipos).toContain('passo_a_passo');
    expect(tipos).toContain('etimologia');
  });

  it('should have valid connections', () => {
    bloco.conexoes.prerequisitos.forEach(c => {
      expect(c).toHaveProperty('bloco_id');
      expect(c).toHaveProperty('justificativa');
    });
  });
});
```

### 9.2 Testes de Integração

```bash
# Verificar seed
npm run test:seed -- s6-oftal-x00048

# Verificar renderização em browser
npm run test:e2e -- src/pages/BlocoPage.e2e.ts -k "s6-oftal-x00048"
```

---

## Passo 10: Deployment

### 10.1 Build PWA

```bash
npm run build

# Verificar bundle size
npm run analyze

# Esperado: bloco adiciona ~33KB (JSON) ao bundle
```

### 10.2 Deploy em Produção

```bash
npm run deploy

# Verificar:
- [ ] Bloco acessível em https://app.anima.med/bloco/s6-oftal-x00048
- [ ] Offline mode carrega conteúdo
- [ ] SRS sincroniza com backend
```

---

## Passo 11: Auditoria Interdisciplinar (Fase 2)

### 11.1 Oftalmólogo Sênior

Revisar:
- [ ] Indicação cirúrgica (limiares, critérios LOCS)
- [ ] Técnica cirúrgica (detalhes de facoemulsificação)
- [ ] Complicações (epidemiologia local)
- [ ] Terminologia (AAO standards)

### 11.2 Endocrinologista

Revisar:
- [ ] Mecanismo sorbitol em diabetes
- [ ] Limiar HbA1c para catarata precoce
- [ ] Controle glicêmico pré-operatório

---

## Checklist Final

- [ ] JSON seed completo e sem erros
- [ ] Todas as narrativa types renderizam
- [ ] Flashcards integram com SRS
- [ ] Casos clínicos visíveis e estruturados
- [ ] Imagens placeholder no lugar (produção fase 2)
- [ ] Testes unitários passam
- [ ] Testes de integração passam
- [ ] Dark mode funciona
- [ ] Mobile responsive
- [ ] Offline mode funciona
- [ ] PWA build aceita novo conteúdo
- [ ] Auditoria pedagógica: ✓ 8 etapas
- [ ] Auditoria técnica: ✓ schema v3.0

---

## Tempo Estimado de Integração

| Fase | Tempo | Dificuldade |
|------|-------|-------------|
| Seed JSON | 30 min | Baixa |
| Componentes renderização | 1h | Média |
| Testes desktop/mobile | 1h | Média |
| Dark mode + acessibilidade | 30 min | Média |
| Testes unitários/integração | 1h | Média |
| QA pedagógica | 30 min | Baixa |
| **TOTAL** | **~4.5h** | **Média** |

---

## Suporte Pós-Integração

Depois de integrado, manter:
1. Flashcards sincronizados com SRS
2. Imagens reais quando disponíveis (substitui placeholders)
3. Conexões entre blocos validadas conforme blocos adjacentes são criados
4. Atualizações conforme evidência clínica evolui (2-3 anos revisão)

---

**Status Final:** ✅ Pronto para integração em produção
