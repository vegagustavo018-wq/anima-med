# Guia de Integração: Streak-Ritmo

## Resumo Executivo

O Streak-Ritmo foi implementado com **3 arquivos de código + 1 documentação**:

```
src/core/types/streak.ts              (tipos + algoritmo)
src/core/anima/streak-ritmo.ts        (serviço)
src/core/db/database.ts               (schema v6 - ATUALIZADO)
└─ 3 novas tabelas: sessoesEstudo, diasEstudo, streakAtual
```

**Status:** Pronto para integração. Zero breaking changes.

---

## Quick Start: 3 Passos

### Passo 1: Registrar uma sessão (EstudarPage)

```typescript
// src/med/pages/EstudarPage.tsx
import { registrarSessaoEstudo } from '@core/anima/streak-ritmo'

// Quando aluno finaliza estudo (ex: ao fechar a página):
async function finalizarEstudo() {
  await registrarSessaoEstudo({
    hora_inicio: new Date(sessoInicio).toISOString().split('T')[1],
    hora_fim: new Date().toISOString().split('T')[1],
    blocos_estudados: [
      {
        bloco_id: 's1-ana-02-001',
        tempo_minutos: 15,
        cards_revisados: 8,
        qualidade_media: 3.5,  // agregado das respostas SRS
      },
    ],
    tempo_total_minutos: 15,
    tempo_sessao_ativa_minutos: 12,
    qualidade_flashcards_media: 3.5,
    finalizado_em: new Date().toISOString(),
  })
  
  // Pronto! streak é recalculado automaticamente
}
```

### Passo 2: Exibir dashboard (ProgressoPage)

```typescript
// src/med/pages/ProgressoPage.tsx
import { gerarResumoRitmo } from '@core/anima/streak-ritmo'

export function ProgressoPage() {
  const [resumo, setResumo] = useState<ResumoRitmo | null>(null)

  useEffect(() => {
    gerarResumoRitmo().then(setResumo)
  }, [])

  if (!resumo) return <Loading />

  return (
    <>
      {/* Heatmap 84 células */}
      <Heatmap heatmap={resumo.heatmap_ultimas_12_semanas} />

      {/* Streak display */}
      <div>
        <div className="text-4xl font-bold">
          {resumo.streak_atual.dias_atuais} dias
        </div>
        <div className="text-sm text-gray-600">
          Recorde: {resumo.streak_atual.recorde} dias
        </div>
        <div className="text-lg">
          Fase: <Badge>{resumo.fase}</Badge>
        </div>
      </div>

      {/* Próximo milestone */}
      {resumo.proxima_meta && (
        <MilestoneAlert meta={resumo.proxima_meta} dias_faltando={
          resumo.proxima_meta.dias - resumo.streak_atual.dias_atuais
        } />
      )}
    </>
  )
}
```

### Passo 3: Renderizar heatmap (componente)

```typescript
// src/components/ritmo/Heatmap.tsx
import { intensidadeParaCor } from '@core/types/streak'

export function Heatmap({ heatmap }: { heatmap: DiaEstudo[] }) {
  // Agrupar em semanas (7 dias cada)
  const semanas = []
  for (let i = 0; i < heatmap.length; i += 7) {
    semanas.push(heatmap.slice(i, i + 7))
  }

  return (
    <div className="space-y-1">
      {semanas.map((semana, sIdx) => (
        <div key={sIdx} className="flex gap-1">
          {semana.map((dia) => (
            <Tooltip
              key={dia.data}
              title={`${dia.data}: ${dia.tempo_total_minutos}m, qual ${dia.qualidade_media.toFixed(1)}/5`}
            >
              <div
                className="w-4 h-4 rounded-sm cursor-pointer hover:ring-2 ring-offset-1"
                style={{
                  backgroundColor: intensidadeParaCor(dia.intensidade),
                }}
              />
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  )
}
```

---

## Checklist de Integração

- [ ] **Database**: v6 aplicada (sessoesEstudo, diasEstudo, streakAtual criadas)
- [ ] **EstudarPage**: Chamada `registrarSessaoEstudo()` ao finalizar
- [ ] **ProgressoPage**: Exibe `gerarResumoRitmo()` e renderiza heatmap
- [ ] **Corpo**: Mostra `obterMilestonesHistoricos()` como badges
- [ ] **RitualPassagem**: Hook para disparar Descoberta quando milestone atingido
- [ ] **Notificações** (v2): `detectarRiscoQuebra()` para alerta

---

## Arquitetura

```
                    EstudarPage
                         ↓
                  [finalizar sessão]
                         ↓
           registrarSessaoEstudo(sessao)
                         ↓
         ┌─────────────────┼──────────────────┐
         ↓                 ↓                  ↓
   sessoesEstudo     diasEstudo         streakAtual
   (granular)       (cache/dia)        (recalculado)
         ↓                 ↓                  ↓
         └─────────────────┼──────────────────┘
                           ↓
                 [milestone atingido?]
                     ↙              ↘
                  SIM               NÃO
                    ↓
           registrarDescoerta
           (RitualPassagem)
                    ↓
            🎉 Confete + Som
```

---

## Exemplos de Integração

### EstudarPage: Capturar qualidade média das respostas

```typescript
// Ao finalizar cada card:
function avaliarCard(qualidade: number) {
  // 0 = "esqueci" ... 5 = "perfeito"
  historicoQualidade.push(qualidade)
}

// Ao fechar página:
async function onUnmount() {
  const qualidadeMedia = 
    historicoQualidade.reduce((a, b) => a + b, 0) / historicoQualidade.length

  await registrarSessaoEstudo({
    qualidade_flashcards_media: qualidadeMedia,
    // ... resto dos dados
  })
}
```

### ProgressoPage: Adicionar aviso de risco

```typescript
import { detectarRiscoQuebra } from '@core/anima/streak-ritmo'

useEffect(() => {
  detectarRiscoQuebra().then((diasAteQuebra) => {
    if (diasAteQuebra === 0) {
      showAlert('⚠️ Seu streak está em risco HOJE!')
    } else if (diasAteQuebra && diasAteQuebra < 3) {
      showAlert(`⚠️ ${diasAteQuebra} dias até quebra do streak`)
    }
  })
}, [])
```

### Corpo: Exibir milestones como badges

```typescript
import { obterMilestonesHistoricos, MILESTONES_PADRAO } from '@core/anima/streak-ritmo'

export function CorpoMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    obterMilestonesHistoricos().then(setMilestones)
  }, [])

  return (
    <div className="flex gap-4">
      {milestones.map((m) => (
        <div key={m.tipo} className="text-center">
          <div className="text-4xl">{m.emoji}</div>
          <div className="text-xs font-bold">{m.dias} dias</div>
        </div>
      ))}
    </div>
  )
}
```

### RitualPassagem: Disparar celebração

```typescript
// No hook que processa milestones:
import { registrarDescoerta } from '@core/anima/descobertas'
import { MILESTONES_PADRAO } from '@core/types/streak'

async function verificarMilestones(streak: Streak) {
  for (const [chave, milestone] of Object.entries(MILESTONES_PADRAO)) {
    if (streak.dias_atuais === milestone.dias) {
      await registrarDescoerta({
        tipo: 'dominio_firmado',
        titulo: milestone.titulo,
        narrativa: milestone.descricao,
      })
      
      // Reproduzir som (v1.1)
      // playSound(milestone.som_celebracao)
      
      // Mostrar confete (v1.1)
      // showConfettiBurst(milestone.cor_fundo)
    }
  }
}
```

---

## Tipos Exports

Todos os tipos estão disponíveis em:

```typescript
import type {
  SessaoEstudo,
  DiaEstudo,
  Streak,
  ResumoRitmo,
  CelHeatmap,
  Milestone,
  FaseRitmo,
} from '@core/types/streak'

import {
  registrarSessaoEstudo,
  gerarResumoRitmo,
  gerarHeatmap,
  detectarRiscoQuebra,
  obterStreakAtual,
  obterMilestonesHistoricos,
  // utilidades:
  computarIntensidade,
  intensidadeParaCor,
  intensidadeParaRaio,
} from '@core/anima/streak-ritmo'
```

---

## Performance Notes

### Otimizações

1. **DiaEstudo como cache**: Não rescanneia 90 SessaoEstudo, lê 84 DiaEstudo
2. **Streak recalculado incrementalmente**: O(90) na pior caso, não O(infinito)
3. **Índices Dexie**: `data` em sessoesEstudo e diasEstudo
4. **Singleton em streakAtual**: Busca O(1), não O(n)

### Limites

- Histórico mantido por 90 dias (ajustável)
- Heatmap renderiza 84 células (12 semanas fixed)
- 1 sessão por dia (merge automático se múltiplas)

---

## Testes Sugeridos

```typescript
describe('streak-ritmo', () => {
  it('registra sessão e atualiza streak', async () => {
    await registrarSessaoEstudo({...})
    const streak = await obterStreakAtual()
    expect(streak?.dias_atuais).toBeGreaterThan(0)
  })

  it('gera heatmap com 84 células', async () => {
    const heatmap = await gerarHeatmap()
    expect(heatmap).toHaveLength(84)
  })

  it('detecta risco com 3+ dias sem estudo', async () => {
    // criar histórico com 3 dias vazio
    const risco = await detectarRiscoQuebra()
    expect(risco).toBe(0) // iminente
  })

  it('calcula fase corretamente', () => {
    expect(calcularFase({ dias_atuais: 3 }, 1)).toBe('iniciante')
    expect(calcularFase({ dias_atuais: 15 }, 1)).toBe('consistente')
    expect(calcularFase({ dias_atuais: 50 }, 1)).toBe('intenso')
  })
})
```

---

## Troubleshooting

### Problema: Heatmap mostra branco (sem cores)

**Causa**: DiaEstudo não foi populado (qualidade_media ainda 0)

**Solução**: Verificar se `registrarSessaoEstudo()` foi chamado com `qualidade_flashcards_media > 0`

### Problema: Streak não incrementa

**Causa**: `tem_dados` em DiaEstudo está false

**Solução**: Garantir que `qualidade_media > 0` no DiaEstudo calculado

### Problema: Milestones não disparam

**Causa**: Hook de RitualPassagem não está verificando streak

**Solução**: Adicionar loop em `verificarMilestones()` após `recalcularStreak()`

---

## Próximas Fases

### V1.1 (Curto prazo)
- [ ] Componente visual de confete (CSS animation)
- [ ] Reprodução de sons de milestone
- [ ] Página de histórico de streaks (para recorde > 1)

### V2 (Médio prazo)
- [ ] Notificações push
- [ ] Modo streak freeze
- [ ] Análise de fase → recomendações
- [ ] Dashboard de comparativo (anônimo)

### V3 (Longo prazo)
- [ ] Integração com calendario de provas
- [ ] Vídeo personalizado da ANIMA
- [ ] Exportar badges para redes sociais

---

**Documentação de integração criada em 03/07/2026.**
**Pronto para começar!**
