import { useEffect, useState } from 'react'
import { Pagina, CabecalhoPagina, Badge } from '@core/components/ui/primitivos'
import { useUIStore } from '@core/store/uiStore'
import { useDuvidasStore } from '@core/store/duvidasStore'
import { garantirPersistencia, type StatusArmazenamento } from '@core/db/storage'
import { baixarBackup } from '@core/db/backup'
import { anunciar } from '@core/store/anuncioStore'
import { tocar } from '@core/anima/som'

export function ConfigPage() {
  const {
    reduzirMovimento,
    setReduzirMovimento,
    som,
    setSom,
    tema,
    setTema,
    filtroNivel,
    toggleNivel,
    fonte,
    setFonte,
    tamanhoFonte,
    setTamanhoFonte,
    larguraColuna,
    setLarguraColuna,
    paleta,
    setPaleta,
    corAcento,
    setCorAcento,
    perfilSessao,
    setPerfilSessao,
  } = useUIStore()
  const { duvidas, carregar, resolver, remover } = useDuvidasStore()
  const [armazenamento, setArmazenamento] = useState<StatusArmazenamento | null>(null)

  useEffect(() => {
    carregar()
    garantirPersistencia().then(setArmazenamento)
  }, [carregar])

  const abertas = duvidas.filter((d) => !d.resolvida)

  return (
    <Pagina largura={760}>
      <CabecalhoPagina titulo="Ajustes" />

      <Secao titulo="Estudo">
        <Linha
          rotulo="Filtro de nível"
          desc="O que aparece por padrão nos temas."
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {(['CORE', 'EXPANSAO', 'APROFUNDAMENTO'] as const).map((n) => (
              <button
                key={n}
                onClick={() => toggleNivel(n)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: filtroNivel[n] ? 'var(--color-accent-glow)' : 'transparent',
                  color: filtroNivel[n] ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </Linha>
      </Secao>

      <Secao titulo="Perfil de sessão">
        <Linha rotulo="Como você está agora" desc="Ajusta densidade, quantidade e tom da ANIMA.">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(
              [
                { v: 'pico', l: 'Pico', icone: '↑' },
                { v: 'manutencao', l: 'Manutenção', icone: '→' },
                { v: 'exausto', l: 'Exausto', icone: '↓' },
                { v: 'padrao', l: 'Padrão', icone: '·' },
              ] as const
            ).map((p) => (
              <button
                key={p.v}
                onClick={() => setPerfilSessao(p.v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${perfilSessao === p.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: perfilSessao === p.v ? 'var(--color-accent-glow)' : 'transparent',
                  color: perfilSessao === p.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {p.icone} {p.l}
              </button>
            ))}
          </div>
        </Linha>
      </Secao>

      <Secao titulo="Aparência">
        <Linha rotulo="Tema" desc="A pele do organismo.">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(
              [
                { v: 'escuro', l: 'Deep Ocean' },
                { v: 'oled', l: 'OLED' },
                { v: 'sepia', l: 'Sépia' },
                { v: 'claro', l: 'Claro' },
              ] as const
            ).map((t) => (
              <button
                key={t.v}
                onClick={() => {
                  setTema(t.v)
                  tocar('transicao')
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${tema === t.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: tema === t.v ? 'var(--color-accent-glow)' : 'transparent',
                  color: tema === t.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.l}
              </button>
            ))}
          </div>
        </Linha>
        <Linha rotulo="Cor de acento" desc="A cor que acende o organismo — independe do tema claro/escuro.">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {(
              [
                { v: 'padrao', l: 'Padrão', cor: 'var(--color-accent)' },
                { v: 'rosa', l: 'Rosa', cor: '#e0568f' },
                { v: 'vermelho', l: 'Vermelho', cor: '#e0524f' },
                { v: 'verde', l: 'Verde', cor: '#3fae6f' },
                { v: 'roxo', l: 'Roxo', cor: '#8f6fe0' },
                { v: 'laranja', l: 'Laranja', cor: '#dd8c33' },
              ] as const
            ).map((c) => (
              <button
                key={c.v}
                onClick={() => {
                  setCorAcento(c.v)
                  tocar('transicao')
                }}
                title={c.l}
                aria-label={c.l}
                aria-pressed={corAcento === c.v}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: c.cor,
                  border: `2px solid ${corAcento === c.v ? 'var(--color-text-primary)' : 'transparent'}`,
                  outlineOffset: 2,
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </Linha>
        <Linha rotulo="Som" desc="Toques sutis ao revelar, acertar e firmar domínio.">
          <Toggle
            ativo={som}
            onClick={() => {
              const novo = !som
              setSom(novo)
              if (novo) tocar('sucesso')
            }}
          />
        </Linha>
      </Secao>

      <Secao titulo="Central de Acessibilidade">
        <Linha rotulo="Reduzir movimento" desc="Desliga pulsos e animações do fluxograma.">
          <Toggle ativo={reduzirMovimento} onClick={() => setReduzirMovimento(!reduzirMovimento)} />
        </Linha>
        <Linha rotulo="Tipografia" desc="Fonte de leitura da narrativa.">
          <div style={{ display: 'flex', gap: 8 }}>
            {(
              [
                { v: 'padrao', l: 'Padrão' },
                { v: 'dislexia', l: 'Dislexia' },
                { v: 'serifada', l: 'Serifada' },
              ] as const
            ).map((f) => (
              <button
                key={f.v}
                onClick={() => setFonte(f.v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${fonte === f.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: fonte === f.v ? 'var(--color-accent-glow)' : 'transparent',
                  color: fonte === f.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {f.l}
              </button>
            ))}
          </div>
        </Linha>
        <Linha rotulo="Tamanho da fonte" desc={`${Math.round(tamanhoFonte * 100)}%`}>
          <input
            type="range"
            min={0.85}
            max={1.4}
            step={0.05}
            value={tamanhoFonte}
            onChange={(e) => setTamanhoFonte(Number(e.target.value))}
            style={{ width: 140, accentColor: 'var(--color-accent)' }}
          />
        </Linha>
        <Linha rotulo="Largura de coluna" desc="Regula quanto texto cabe por linha.">
          <div style={{ display: 'flex', gap: 8 }}>
            {(
              [
                { v: 'estreita', l: 'Estreita' },
                { v: 'normal', l: 'Normal' },
                { v: 'larga', l: 'Larga' },
              ] as const
            ).map((l) => (
              <button
                key={l.v}
                onClick={() => setLarguraColuna(l.v)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 99,
                  border: `1px solid ${larguraColuna === l.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: larguraColuna === l.v ? 'var(--color-accent-glow)' : 'transparent',
                  color: larguraColuna === l.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {l.l}
              </button>
            ))}
          </div>
        </Linha>
        <Linha rotulo="Paleta de cores" desc="Alternativas para daltonismo e alto contraste.">
          <select
            value={paleta}
            onChange={(e) => setPaleta(e.target.value as typeof paleta)}
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              padding: '6px 10px',
            }}
          >
            <option value="padrao">Deep Ocean (padrão)</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
            <option value="alto-contraste">Alto contraste</option>
          </select>
        </Linha>
        <Linha rotulo="Navegação por teclado" desc="Paleta de comandos completa.">
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            <code>/</code> ou <code>Cmd+K</code> em qualquer lugar
          </span>
        </Linha>
      </Secao>

      <Secao titulo="Meus dados">
        <Linha rotulo="Backup do progresso" desc="Seu estudo é sagrado — leve uma cópia.">
          <button
            onClick={async () => {
              await baixarBackup()
              anunciar('Backup exportado — seu progresso está seguro.', { tipo: 'sucesso' })
            }}
            style={botao}
          >
            ↓ Exportar
          </button>
        </Linha>
        {armazenamento && (
          <Linha rotulo="Armazenamento" desc="Persistência protege contra perda de dados.">
            <span style={{ fontSize: 12, color: armazenamento.persistente ? 'var(--color-success)' : 'var(--color-warning)' }}>
              {armazenamento.persistente ? '✓ garantido' : '⚠ não garantido'}
              {armazenamento.usoMB != null && ` · ${armazenamento.usoMB} MB`}
            </span>
          </Linha>
        )}
      </Secao>

      <Secao titulo={`Minhas dúvidas (${abertas.length})`}>
        {abertas.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Nenhuma dúvida guardada. Selecione um trecho e aperte <code>q</code> para capturar.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {abertas.map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)' }}>{d.trecho}</p>
                  {d.contexto && d.contexto !== d.trecho && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>{d.contexto}</p>
                  )}
                  {d.resumo_id && <Badge>{d.resumo_id}</Badge>}
                </div>
                <button onClick={() => d.id && resolver(d.id)} title="Resolver" style={iconBtn}>✓</button>
                <button onClick={() => d.id && remover(d.id)} title="Remover" style={iconBtn}>×</button>
              </div>
            ))}
          </div>
        )}
      </Secao>
    </Pagina>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
        {titulo}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  )
}

function Linha({ rotulo, desc, children }: { rotulo: string; desc?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)' }}>{rotulo}</p>
        {desc && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ ativo, onClick }: { ativo: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        border: 'none',
        background: ativo ? 'var(--color-accent)' : 'var(--color-bg-hover)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: ativo ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s',
        }}
      />
    </button>
  )
}

const botao: React.CSSProperties = {
  padding: '8px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-elevated)',
  color: 'var(--color-text-secondary)',
  fontSize: 13,
  cursor: 'pointer',
}
const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'transparent',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  fontSize: 14,
  flexShrink: 0,
}
