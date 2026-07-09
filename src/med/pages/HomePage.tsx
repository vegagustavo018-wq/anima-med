import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { motion } from 'motion/react'
import { Pagina, FalaAnima, Cartao, Grade, BotaoCTA } from '@core/components/ui/primitivos'
import { calcularEstado } from '@core/anima/estado'
import { resumoPendencias, montarFilaEstudo } from '@core/anima/fila'
import { calcularOnda, continuidadeAtual, type DiaRitmo } from '@core/anima/ritmo'
import { lerBemEstar, type LeituraBemEstar } from '@core/anima/bemestar'
import { useUIStore } from '@core/store/uiStore'
import { db } from '@core/db/database'
import { useCheckInStore } from '@core/store/checkinStore'
import { CheckInRapido } from '@med/components/bemestar/CheckInRapido'
import { RitualAbertura } from '@med/components/produtividade/RitualAbertura'
import { useProvasStore, diasAte } from '@core/store/provasStore'
import { useSessaoConfigStore } from '@core/store/sessaoConfigStore'
import { HomeHeader } from '@med/components/home/HomeHeader'
import { HeroContinuar } from '@med/components/home/HeroContinuar'
import { CartaoPlanoDia } from '@med/components/home/CartaoPlanoDia'
import { CartaoRevisar } from '@med/components/home/CartaoRevisar'
import { CartaoEnergia } from '@med/components/home/CartaoEnergia'
import { CartaoRitmo } from '@med/components/home/CartaoRitmo'
import { CartaoProgressoSemanal } from '@med/components/home/CartaoProgressoSemanal'
import { FundoHome } from '@med/components/home/FundoHome'
import { IconeNav } from '@med/components/navigation/icones'
import { RotuloClinico, BadgeStatus, BarraRotulada } from '@core/components/ui/hud'

const ENERGIA_PCT: Record<string, number> = { baixa: 35, media: 65, alta: 95 }

const gradeVariantes = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const itemVariante = {
  oculto: { opacity: 0, y: 16 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
}

function acessoRelativo(iso: string | null): string {
  if (!iso) return '—'
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  return `${dias}d atrás`
}

export function HomePage() {
  const navigate = useNavigate()
  const { ultimoBloco, reduzirMovimento, perfilSessao, setPerfilSessao } = useUIStore()
  // Reativo: recalcula sozinho quando blocos/progresso mudam (revisão, ingestão)
  const estado = useLiveQuery(() => calcularEstado(), []) ?? null
  const pendencias = useLiveQuery(() => resumoPendencias(), [])
  const [tituloUltimo, setTituloUltimo] = useState<string | null>(null)
  const [ultimoAcesso, setUltimoAcesso] = useState<string | null>(null)
  const [marcados, setMarcados] = useState(0)
  const [proximoRevisar, setProximoRevisar] = useState<string | undefined>(undefined)
  const [dias, setDias] = useState<DiaRitmo[]>([])
  const [bemEstar, setBemEstar] = useState<LeituraBemEstar | null>(null)
  const [checkInFeito, setCheckInFeito] = useState(false)
  const [checkInAberto, setCheckInAberto] = useState(false)
  const { carregarUltimo, ultimo: ultimoCheckIn } = useCheckInStore()
  const { carregar: carregarProvas, proxima } = useProvasStore()
  const { aplicarPreset } = useSessaoConfigStore()

  useEffect(() => {
    carregarProvas()
  }, [carregarProvas])

  useEffect(() => {
    calcularOnda().then(setDias)
    db.progresso.filter((p) => !!p.marcado_para_revisao).count().then(setMarcados)
    // Bloco real no topo da fila de revisão — alimenta o mini-bloco do CartaoRevisar
    // (evita rótulo genérico; mostra o que de fato está vencido).
    montarFilaEstudo(1).then(async (fila) => {
      if (fila.length === 0) return
      const b = await db.blocos.get(fila[0].resumo_id)
      if (b) setProximoRevisar(b.metadata.titulo)
    })
  }, [])

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
      db.progresso.get(ultimoBloco).then((p) => setUltimoAcesso(p?.ultima_leitura ?? null))
    }
  }, [ultimoBloco])

  useEffect(() => {
    lerBemEstar().then(setBemEstar)
  }, [])

  const streakDias = dias.length ? continuidadeAtual(dias) : 0
  const energiaPct = ultimoCheckIn ? (ENERGIA_PCT[ultimoCheckIn.energia] ?? 60) : 60
  const notificacoes = pendencias?.total ?? 0

  return (
    <Pagina largura={1240}>
     <div style={{ position: 'relative' }}>
      <FundoHome reduzirMovimento={reduzirMovimento} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <HomeHeader
        nome="Gustavo"
        energiaPct={energiaPct}
        streakDias={streakDias}
        notificacoes={notificacoes}
        onClickSino={() => navigate('/estudar')}
      />

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
            className="anima-chip"
            onClick={async () => {
              await aplicarPreset(r.preset)
              navigate(r.rota)
            }}
          >
            {r.label}
          </button>
        ))}
        {(() => {
          const p = proxima()
          if (!p) return null
          const d = diasAte(p.data)
          return (
            <button
              className="anima-chip"
              onClick={() => navigate('/provas')}
              style={{
                borderColor: 'color-mix(in srgb, var(--color-warning) 45%, transparent)',
                color: 'var(--color-warning)',
              }}
            >
              {p.titulo} em {d}d
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
            background: 'color-mix(in srgb, var(--color-warning) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-warning) 55%, transparent)',
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
        <div style={{ marginBottom: 24 }}>
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

      {/* Hero — continuar de onde parei */}
      <motion.div
        style={{ marginBottom: 24 }}
        initial={reduzirMovimento ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {ultimoBloco && tituloUltimo ? (
          <HeroContinuar
            titulo={tituloUltimo}
            progresso={estado?.percentualDominio ?? 0}
            dominados={estado?.blocosDominados ?? 0}
            ultimoAcessoLabel={acessoRelativo(ultimoAcesso)}
            marcados={marcados}
            reduzirMovimento={reduzirMovimento}
            onContinuar={() => navigate(`/bloco/${ultimoBloco}`)}
          />
        ) : (
          <div
            style={{
              padding: '36px 40px',
              borderRadius: 'var(--radius-xl)',
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 12%, var(--color-bg-card)) 0%, var(--color-bg-elevated) 100%)',
              border: '1px solid var(--color-border-accent)',
              boxShadow: '0 20px 56px rgba(0,0,0,0.38)',
            }}
          >
            <FalaAnima grande texto="Ainda não começamos. Escolha um ponto de partida e eu acompanho você a partir daí." />
            <div style={{ marginTop: 20 }}>
              <BotaoCTA onClick={() => navigate('/explorar')}>Explorar o currículo →</BotaoCTA>
            </div>
          </div>
        )}
      </motion.div>

      {/* Cards secundários — hierarquia por tamanho, não uma grade uniforme */}
      <RotuloSecao>Seu dia</RotuloSecao>
      <motion.div
        className="home-grid"
        initial={reduzirMovimento ? false : 'oculto'}
        animate="visivel"
        variants={gradeVariantes}
      >
        <motion.div className="span-2" variants={itemVariante}>
          <CartaoProgressoSemanal dias={dias} reduzirMovimento={reduzirMovimento} onClick={() => navigate('/progresso')} />
        </motion.div>

        <motion.div variants={itemVariante}>
          <CartaoPlanoDia
            blocos={pendencias?.blocos ?? 0}
            cards={pendencias?.cards ?? 0}
            questoes={pendencias?.questoes ?? 0}
            onClick={() => navigate('/estudar')}
          />
        </motion.div>

        {estado && estado.cardsVencidos > 0 && (
          <motion.div variants={itemVariante}>
            <CartaoRevisar
              cardsVencidos={estado.cardsVencidos}
              proximoTitulo={proximoRevisar}
              onClick={() => navigate('/estudar')}
            />
          </motion.div>
        )}

        <motion.div variants={itemVariante}>
        <Cartao onClick={() => navigate('/explorar')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <RotuloClinico cor="var(--color-text-muted)">Currículo completo</RotuloClinico>
            <BadgeStatus tipo="ia">Matriz</BadgeStatus>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Explorar o currículo
              </p>
              <p style={{ margin: '6px 0 16px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                Percorra os semestres, disciplinas e temas — do primeiro tecido à clínica.
              </p>
            </div>
            <span
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-accent-glow)',
                color: 'var(--color-accent)',
              }}
              aria-hidden="true"
            >
              <IconeNav nome="explorar" tamanho={16} />
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-accent)', fontWeight: 600 }}>Acessar matriz médica →</p>
        </Cartao>
        </motion.div>

        <motion.div variants={itemVariante}>
          <CartaoEnergia perfilSessao={perfilSessao} onEscolher={setPerfilSessao} />
        </motion.div>

        <motion.div variants={itemVariante}>
          <CartaoRitmo
            dias={dias}
            streakDias={streakDias}
            reduzirMovimento={reduzirMovimento}
            onClick={() => navigate('/corpo')}
          />
        </motion.div>
      </motion.div>

      {/* Estado do organismo — discreto, embaixo */}
      {estado && (
        <div style={{ marginTop: 40 }}>
          <RotuloSecao>O organismo hoje</RotuloSecao>
          <div style={{ marginBottom: 18, maxWidth: 640 }}>
            <BarraRotulada
              rotulo="Domínio cognitivo do acervo"
              valor={`${estado.percentualDominio}% · ${estado.blocosDominados}/${estado.totalBlocos}`}
              pct={estado.percentualDominio}
              reduzirMovimento={reduzirMovimento}
            />
          </div>
          <Grade min={160}>
            <Metrica valor={estado.totalBlocos} rotulo="blocos existentes" />
            <Metrica valor={estado.blocosIniciados} rotulo="iniciados" />
            <Metrica valor={estado.blocosDominados} rotulo="em domínio" />
            <Metrica valor={`${estado.percentualDominio}%`} rotulo="do que existe" />
          </Grade>
        </div>
      )}

      <p
        style={{
          margin: '48px 0 12px',
          textAlign: 'center',
          fontSize: 12.5,
          fontStyle: 'italic',
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-text-faint)',
        }}
      >
        Pequenos hábitos diários constroem grandes resultados.
      </p>
      </div>
     </div>
    </Pagina>
  )
}

function RotuloSecao({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        margin: '0 0 14px',
      }}
    >
      {children}
    </p>
  )
}

function Metrica({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 18px',
      }}
    >
      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1 }}>{valor}</p>
      <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{rotulo}</p>
    </div>
  )
}
