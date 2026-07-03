import { useEffect, useMemo, useRef, useState } from 'react'
import { Pagina, CabecalhoPagina, Cartao, Grade, FalaAnima, EstadoVazio } from '@core/components/ui/primitivos'
import { Botao } from '@core/components/ui/controles'
import { useQuestoesStore, type EstatisticasQuestoes } from '@core/store/questoesStore'
import { ehMCQ, type ItemQuestao, type QuestaoMCQ } from '@core/types/questoes'
import type { Qualidade } from '@core/srs/sm2'
import { MCQPlayer } from '@med/components/questoes/MCQPlayer'
import { FlashcardPlayer } from '@med/components/questoes/FlashcardPlayer'
import { Cronometro } from '@med/components/questoes/Cronometro'
import { OclusaoDemo } from '@med/components/questoes/OclusaoDemo'
import { tocar } from '@core/anima/som'
import { anunciar } from '@core/store/anuncioStore'

type Modo = 'treino' | 'exame' | 'flashcards' | 'revisao'
type Fase = 'hub' | 'jogando' | 'relatorio'

const SEG_POR_QUESTAO = 90 // Modo Exame: ~1min30 por questão (ritmo Revalida)

export function QuestoesPage() {
  const store = useQuestoesStore()
  const [stats, setStats] = useState<EstatisticasQuestoes | null>(null)
  const [especialidade, setEspecialidade] = useState<string>('')
  const [quantidade, setQuantidade] = useState(10)

  const [fase, setFase] = useState<Fase>('hub')
  const [oclusao, setOclusao] = useState(false)
  const [modo, setModo] = useState<Modo>('treino')
  const [itens, setItens] = useState<ItemQuestao[]>([])
  const [indice, setIndice] = useState(0)
  const [escolhas, setEscolhas] = useState<Record<string, string>>({})
  const [revelado, setRevelado] = useState(false)
  const [acertos, setAcertos] = useState(0)
  const [inicioItem, setInicioItem] = useState(0)
  const finalizandoRef = useRef(false) // trava de idempotência do Modo Exame

  const recarregarStats = () => store.estatisticas().then(setStats)

  useEffect(() => {
    store.carregarProgresso().then(recarregarStats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const especialidades = useMemo(
    () => (stats?.porEspecialidade ?? []).filter((e) => e.total >= 3),
    [stats]
  )

  async function iniciar(m: Modo) {
    const esp = especialidade || undefined
    let lista: ItemQuestao[] = []
    if (m === 'revisao') {
      lista = await store.montarRevisao(quantidade)
    } else if (m === 'flashcards') {
      lista = await store.montarSessao({ tipo: 'flashcard', especialidade: esp, quantidade })
    } else {
      lista = await store.montarSessao({ tipo: 'mcq', especialidade: esp, quantidade })
    }
    if (lista.length === 0) {
      anunciar('Nada para essa seleção agora.', { tipo: 'info' })
      return
    }
    finalizandoRef.current = false
    setModo(m)
    setItens(lista)
    setIndice(0)
    setEscolhas({})
    setRevelado(false)
    setAcertos(0)
    setInicioItem(Date.now())
    setFase('jogando')
    tocar('transicao')
  }

  const atual = itens[indice]

  async function escolherMCQ(q: QuestaoMCQ, id: string) {
    setEscolhas((e) => ({ ...e, [q.id]: id }))
    if (modo === 'exame') {
      tocar('toque')
      return // feedback só no fim
    }
    const ms = Date.now() - inicioItem
    const r = await store.responderMCQ(q, id, modo === 'revisao' ? 'revisao' : 'treino', ms)
    tocar(r.acertou ? 'acerto' : 'erro')
    if (r.acertou) setAcertos((a) => a + 1)
    setRevelado(true)
  }

  async function avaliarFlash(q: string, nota: Qualidade) {
    await store.avaliarFlashcard(q, nota, 'treino')
    if (nota >= 3) setAcertos((a) => a + 1)
    avancar()
  }

  function avancar() {
    if (indice + 1 >= itens.length) {
      finalizar()
      return
    }
    setIndice((i) => i + 1)
    setRevelado(false)
    setInicioItem(Date.now())
  }

  async function finalizar() {
    // trava de idempotência: o Modo Exame tem dois gatilhos (botão Finalizar e
    // Cronometro aoZerar) que poderiam correr juntos e persistir/pontuar 2×,
    // corrompendo o SRS. A fase muda ANTES do loop para desmontar o Cronometro.
    if (finalizandoRef.current) return
    finalizandoRef.current = true
    const eraExame = modo === 'exame'
    setFase('relatorio')
    if (eraExame) {
      let ok = 0
      for (const it of itens) {
        if (!ehMCQ(it)) continue
        const esc = escolhas[it.id]
        if (esc == null || esc === '') continue // não vista → não penaliza o SRS
        const r = await store.responderMCQ(it, esc, 'exame')
        if (r.acertou) ok++
      }
      setAcertos(ok)
    }
    await recarregarStats()
    tocar('sucesso')
  }

  function voltarHub() {
    setFase('hub')
    recarregarStats()
  }

  // ── Oclusão de imagem (demo autocontido) ────────────────────────────────────
  if (oclusao) {
    return (
      <Pagina largura={640}>
        <OclusaoDemo onSair={() => setOclusao(false)} />
      </Pagina>
    )
  }

  // ── HUB ────────────────────────────────────────────────────────────────────
  if (fase === 'hub') {
    if (!stats) {
      return (
        <Pagina largura={860}>
          <CabecalhoPagina titulo="Questões" subtitulo="Carregando banco…" />
        </Pagina>
      )
    }
    if (stats.totalMCQ === 0 && stats.totalFlashcards === 0) {
      return (
        <Pagina largura={860}>
          <CabecalhoPagina titulo="Questões" />
          <EstadoVazio>
            <div style={{ fontSize: 40, marginBottom: 14 }}>✎</div>
            <FalaAnima texto="Ainda não tenho as questões comigo. Abra o app uma vez com internet que eu trago o banco inteiro pra você — e aí a gente treina." />
          </EstadoVazio>
        </Pagina>
      )
    }
    // acerto = acertos / TENTATIVAS (não / questões distintas) — senão passa de 100%
    const pct = stats.tentativasTotais ? Math.round((stats.acertos / stats.tentativasTotais) * 100) : 0
    return (
      <Pagina largura={860}>
        <CabecalhoPagina
          titulo="Questões"
          subtitulo={`${stats.totalMCQ} questões de múltipla escolha + ${stats.totalFlashcards} flashcards · fonte: Revalida Clinical`}
        />

        <div style={{ marginBottom: 24 }}>
          <FalaAnima texto="Aqui a gente testa o que já virou seu. Errar aqui é barato — errar na prova, não. Vamos?" />
        </div>

        <Grade min={130}>
          <Metrica valor={stats.totalMCQ} rotulo="MCQ no banco" />
          <Metrica valor={stats.respondidas} rotulo="respondidas" />
          <Metrica valor={`${pct}%`} rotulo="acerto" cor="var(--color-success)" />
          <Metrica valor={stats.vencidas} rotulo="a revisar" cor={stats.vencidas ? 'var(--color-warning)' : undefined} />
        </Grade>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', margin: '24px 0 16px' }}>
          <label htmlFor="q-area" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Área:</label>
          <select
            id="q-area"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13, padding: '7px 10px' }}
          >
            <option value="">Todas as áreas</option>
            {especialidades.map((e) => (
              <option key={e.especialidade} value={e.especialidade}>
                {e.especialidade} ({e.total})
              </option>
            ))}
          </select>
          <span id="q-qtd-label" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Quantidade:</span>
          <div role="radiogroup" aria-labelledby="q-qtd-label" style={{ display: 'flex', gap: 8 }}>
            {[10, 20, 30].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={quantidade === n}
                onClick={() => setQuantidade(n)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${quantidade === n ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: quantidade === n ? 'var(--color-accent-glow)' : 'transparent',
                  color: quantidade === n ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Grade min={240}>
          <Cartao onClick={() => iniciar('treino')} cor="var(--color-accent)">
            <AcaoCartao icone="⬡" titulo="Treino livre" desc="MCQ com feedback e comentário imediato a cada questão." />
          </Cartao>
          <Cartao onClick={() => iniciar('exame')} cor="var(--color-danger)">
            <AcaoCartao icone="⏱" titulo="Modo Exame" desc={`${quantidade} questões cronometradas (${Math.round((quantidade * SEG_POR_QUESTAO) / 60)} min), correção no fim.`} />
          </Cartao>
          <Cartao onClick={() => iniciar('flashcards')} cor="var(--color-success)">
            <AcaoCartao icone="🂠" titulo="Flashcards" desc="Recordação ativa com autoavaliação (SRS)." />
          </Cartao>
          <Cartao onClick={() => (stats.vencidas ? iniciar('revisao') : null)} cor="var(--color-warning)">
            <AcaoCartao icone="↻" titulo="Revisar vencidas" desc={stats.vencidas ? `${stats.vencidas} questões pedindo revisão.` : 'Nada vencido — em dia.'} />
          </Cartao>
          <Cartao onClick={() => setOclusao(true)} cor="var(--color-accent-dim)">
            <AcaoCartao icone="◫" titulo="Oclusão de imagem" desc="Recordar estruturas por região oculta (demo: neurônio)." />
          </Cartao>
        </Grade>
      </Pagina>
    )
  }

  // ── RELATÓRIO ───────────────────────────────────────────────────────────────
  if (fase === 'relatorio') {
    const total = modo === 'exame' ? itens.filter(ehMCQ).length : itens.length
    const pct = total ? Math.round((acertos / total) * 100) : 0
    return (
      <Pagina largura={760}>
        <CabecalhoPagina titulo={modo === 'exame' ? 'Resultado do exame' : 'Sessão concluída'} />
        <div style={{ textAlign: 'center', padding: '24px 0 12px' }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: pct >= 70 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            {pct}%
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            {acertos} de {total} corretas
          </p>
        </div>

        {modo === 'exame' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
            {itens.filter(ehMCQ).map((q, i) => {
              const esc = escolhas[q.id] ?? ''
              const ok = esc === q.correta
              return (
                <div key={q.id} style={{ padding: '10px 14px', border: `1px solid ${ok ? 'var(--color-success)' : 'var(--color-danger)'}`, borderLeft: `3px solid ${ok ? 'var(--color-success)' : 'var(--color-danger)'}`, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-card)' }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--color-text-primary)' }}>
                    <strong>{ok ? '✓' : '✕'} {i + 1}.</strong> {q.tema}
                  </p>
                  {!ok && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Correta: {q.alternativas.find((a) => a.id === q.correta)?.texto}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <Botao onClick={voltarHub} variante="primario">Voltar</Botao>
          {modo === 'exame' && (
            <Botao onClick={() => iniciar('revisao')} variante="secundario">Revisar erradas</Botao>
          )}
        </div>
      </Pagina>
    )
  }

  // ── JOGANDO ─────────────────────────────────────────────────────────────────
  const tempoTotal = quantidade * SEG_POR_QUESTAO
  return (
    <Pagina largura={720}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={voltarHub} style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }}>
          ← Sair
        </button>
        {modo === 'exame' && <Cronometro segundos={tempoTotal} aoZerar={finalizar} />}
        <div style={{ flex: modo === 'exame' ? 0 : 1 }} />
      </div>

      {atual && ehMCQ(atual) ? (
        <>
          <MCQPlayer
            questao={atual}
            escolhida={escolhas[atual.id] ?? null}
            revelar={modo !== 'exame' && revelado}
            aoEscolher={(id) => escolherMCQ(atual, id)}
            numero={indice + 1}
            total={itens.length}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
            {modo === 'exame' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {indice > 0 && (
                  <Botao variante="fantasma" onClick={() => { setIndice((i) => i - 1); }}>
                    Anterior
                  </Botao>
                )}
                <Botao variante="primario" onClick={() => (indice + 1 >= itens.length ? finalizar() : setIndice((i) => i + 1))}>
                  {indice + 1 >= itens.length ? 'Finalizar' : 'Próxima'}
                </Botao>
              </div>
            ) : (
              revelado && (
                <Botao variante="primario" onClick={avancar}>
                  {indice + 1 >= itens.length ? 'Concluir' : 'Próxima'}
                </Botao>
              )
            )}
          </div>
        </>
      ) : atual ? (
        <FlashcardPlayer
          card={atual}
          aoAvaliar={(nota) => avaliarFlash(atual.id, nota)}
          numero={indice + 1}
          total={itens.length}
        />
      ) : null}
    </Pagina>
  )
}

function Metrica({ valor, rotulo, cor }: { valor: string | number; rotulo: string; cor?: string }) {
  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: cor ?? 'var(--color-text-primary)' }}>{valor}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{rotulo}</div>
    </div>
  )
}

function AcaoCartao({ icone, titulo, desc }: { icone: string; titulo: string; desc: string }) {
  return (
    <div>
      <div style={{ fontSize: 24, marginBottom: 8 }} aria-hidden="true">{icone}</div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{titulo}</p>
      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>{desc}</p>
    </div>
  )
}
