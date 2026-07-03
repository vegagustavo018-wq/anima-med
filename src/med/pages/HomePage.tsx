import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pagina, FalaAnima, Cartao, Grade } from '@core/components/ui/primitivos'
import { calcularEstado } from '@core/anima/estado'
import { resumoPendencias } from '@core/anima/fila'
import { saudacao } from '@core/anima/voz'
import { lerBemEstar, type LeituraBemEstar } from '@core/anima/bemestar'
import { useUIStore } from '@core/store/uiStore'
import { db } from '@core/db/database'
import { useCheckInStore } from '@core/store/checkinStore'
import { CheckInRapido } from '@med/components/bemestar/CheckInRapido'
import { RitualAbertura } from '@med/components/produtividade/RitualAbertura'
import { useProvasStore, diasAte } from '@core/store/provasStore'
import { useSessaoConfigStore } from '@core/store/sessaoConfigStore'

export function HomePage() {
  const navigate = useNavigate()
  const { ultimoBloco } = useUIStore()
  // Reativo: recalcula sozinho quando blocos/progresso mudam (revisão, ingestão)
  const estado = useLiveQuery(() => calcularEstado(), []) ?? null
  const pendencias = useLiveQuery(() => resumoPendencias(), [])
  const fala = useMemo(
    () =>
      estado
        ? saudacao({
            diasDesdeUltima: estado.diasDesdeUltima,
            cardsVencidos: estado.cardsVencidos,
            totalBlocos: estado.totalBlocos,
          })
        : '',
    [estado]
  )
  const [tituloUltimo, setTituloUltimo] = useState<string | null>(null)
  const [bemEstar, setBemEstar] = useState<LeituraBemEstar | null>(null)
  const [checkInFeito, setCheckInFeito] = useState(false)
  const [checkInAberto, setCheckInAberto] = useState(false)
  const { carregarUltimo } = useCheckInStore()
  const { carregar: carregarProvas, proxima } = useProvasStore()
  const { aplicarPreset } = useSessaoConfigStore()

  useEffect(() => {
    carregarProvas()
  }, [carregarProvas])

  useEffect(() => {
    carregarUltimo().then(() => {
      const u = useCheckInStore.getState().ultimo
      if (u) {
        const hoje = new Date().toISOString().slice(0, 10)
        setCheckInFeito(u.criado_em.slice(0, 10) === hoje)
      }
    })
  }, [carregarUltimo])

  useEffect(() => {
    if (ultimoBloco) {
      db.blocos.get(ultimoBloco).then((b) => setTituloUltimo(b?.metadata.titulo ?? null))
    }
  }, [ultimoBloco])

  useEffect(() => {
    lerBemEstar().then(setBemEstar)
  }, [])

  return (
    <Pagina largura={900}>
      <div style={{ paddingTop: 24, marginBottom: 20 }}>
        {fala && <FalaAnima texto={fala} grande />}
      </div>

      <RitualAbertura />

      {/* Rotinas — receitas de sessão de um toque */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Pré-Plantão', preset: 'plantao' as const, rota: '/estudar' },
          { label: 'Tema Novo', preset: 'exploracao' as const, rota: '/explorar' },
          { label: 'Véspera de Prova', preset: 'prova' as const, rota: '/estudar' },
        ].map((r) => (
          <button
            key={r.label}
            onClick={async () => {
              await aplicarPreset(r.preset)
              navigate(r.rota)
            }}
            style={{
              padding: '7px 14px',
              border: '1px solid var(--color-border)',
              borderRadius: 99,
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {r.label}
          </button>
        ))}
        {(() => {
          const p = proxima()
          if (!p) return null
          const dias = diasAte(p.data)
          return (
            <button
              onClick={() => navigate('/provas')}
              style={{
                padding: '7px 14px',
                border: '1px solid var(--color-warning)',
                borderRadius: 99,
                background: 'transparent',
                color: 'var(--color-warning)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {p.titulo} em {dias}d
            </button>
          )
        })()}
      </div>

      {/* Barômetro de Bem-Estar — nunca bloqueia, só oferece pausa */}
      {bemEstar?.sobrecarga && (
        <div
          style={{
            marginBottom: 20,
            padding: '14px 18px',
            background: 'rgba(246,173,85,0.08)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }}>{bemEstar.motivo}</p>
          <button
            onClick={() => navigate('/respirar')}
            style={{ padding: '6px 12px', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            Respirar um pouco
          </button>
        </div>
      )}

      {/* Check-in rápido — opcional, some depois de feito ou dispensado */}
      {!checkInFeito && (
        <div style={{ marginBottom: 20 }}>
          {checkInAberto ? (
            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <CheckInRapido
                compacto
                onFeito={() => {
                  setCheckInFeito(true)
                  setCheckInAberto(false)
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setCheckInAberto(true)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Check-in rápido de energia
            </button>
          )}
        </div>
      )}

      {/* Ações do dia — o primeiro minuto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {estado && estado.cardsVencidos > 0 && (
          <Cartao onClick={() => navigate('/estudar')} cor="var(--color-accent)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Revisar agora
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {estado.cardsVencidos} {estado.cardsVencidos === 1 ? 'bloco vencido' : 'blocos vencidos'} — eu conduzo
                </p>
              </div>
              <span style={{ fontSize: 22, color: 'var(--color-accent)' }}>⬡</span>
            </div>
          </Cartao>
        )}

        {pendencias && pendencias.questoes > 0 && (
          <Cartao onClick={() => navigate('/questoes')} cor="var(--color-warning)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Questões pedindo revisão
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {pendencias.questoes} {pendencias.questoes === 1 ? 'questão venceu' : 'questões venceram'} — reencontre o que já foi seu
                </p>
              </div>
              <span style={{ fontSize: 22, color: 'var(--color-warning)' }}>✎</span>
            </div>
          </Cartao>
        )}

        {ultimoBloco && tituloUltimo && (
          <Cartao onClick={() => navigate(`/bloco/${ultimoBloco}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>Continuar</p>
                <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {tituloUltimo}
                </p>
              </div>
              <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>→</span>
            </div>
          </Cartao>
        )}

        <Cartao onClick={() => navigate('/explorar')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Explorar o currículo
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Percorrer os semestres, disciplinas e temas
              </p>
            </div>
            <span style={{ fontSize: 20, color: 'var(--color-text-secondary)' }}>◎</span>
          </div>
        </Cartao>
      </div>

      {/* Estado do organismo — discreto, embaixo */}
      {estado && (
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 12,
            }}
          >
            O organismo hoje
          </p>
          <Grade min={160}>
            <Metrica valor={estado.totalBlocos} rotulo="blocos existentes" />
            <Metrica valor={estado.blocosIniciados} rotulo="iniciados" />
            <Metrica valor={estado.blocosDominados} rotulo="em domínio" />
            <Metrica valor={`${estado.percentualDominio}%`} rotulo="do que existe" />
          </Grade>
        </div>
      )}
    </Pagina>
  )
}

function Metrica({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
      }}
    >
      <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: 'var(--color-accent)' }}>{valor}</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{rotulo}</p>
    </div>
  )
}
