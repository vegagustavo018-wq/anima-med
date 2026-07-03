import type { ZonaCorpo, ZonaId } from '@core/anima/corpo'

interface Props {
  zonas: ZonaCorpo[]
  reduzirMovimento: boolean
  zonaFoco: ZonaId | null
  onZonaClick?: (id: ZonaId) => void
}

function pct(zonas: ZonaCorpo[], id: ZonaId): number {
  return zonas.find((z) => z.id === id)?.percentual ?? 0
}

function corPorPercentual(p: number): { cor: string; opac: number } {
  if (p === 0) return { cor: '#3a4a63', opac: 0.35 }
  if (p < 30) return { cor: '#2c7a7b', opac: 0.5 }
  if (p < 70) return { cor: '#4fd1c5', opac: 0.75 }
  return { cor: '#4fd1c5', opac: 1 }
}

/**
 * O Corpo que se Ilumina (bloco 8) — silhueta anatômica bioluminescente.
 * Cada zona acende conforme DOMÍNIO REAL da disciplina correspondente,
 * não por tempo estudado. Um órgão apagado deve doer mais que um número.
 */
export function CorpoIluminado({ zonas, reduzirMovimento, zonaFoco, onZonaClick }: Props) {
  const pele = corPorPercentual(pct(zonas, 'pele'))
  const cranio = corPorPercentual(pct(zonas, 'cranio'))
  const coracao = corPorPercentual(pct(zonas, 'coracao'))
  const nucleo = corPorPercentual(pct(zonas, 'nucleo'))
  const esqueleto = corPorPercentual(pct(zonas, 'esqueleto'))
  const pulmoes = corPorPercentual(pct(zonas, 'pulmoes'))
  const abdome = corPorPercentual(pct(zonas, 'abdome'))
  const auraPct = pct(zonas, 'aura')

  const animCoracao = reduzirMovimento ? undefined : 'brilhar 2.2s ease-in-out infinite'
  const animNucleo = reduzirMovimento ? undefined : 'pulso 3.4s ease-in-out infinite'
  const animAura = reduzirMovimento ? undefined : 'respirar 5s ease-in-out infinite'

  const clicavel = (id: ZonaId): React.CSSProperties => ({
    cursor: onZonaClick ? 'pointer' : 'default',
    opacity: zonaFoco && zonaFoco !== id ? 0.35 : 1,
    transition: 'opacity 0.25s ease',
  })

  return (
    <svg viewBox="0 0 320 520" width="100%" height="100%" style={{ maxWidth: 340, margin: '0 auto', display: 'block' }} role="img" aria-label="Corpo bioluminescente — domínio por sistema">
      <defs>
        <radialGradient id="auraGrad" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#4fd1c5" stopOpacity={0.05 + (auraPct / 100) * 0.15} />
          <stop offset="100%" stopColor="#4fd1c5" stopOpacity="0" />
        </radialGradient>
        <filter id="glowSoft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Aura geral — glow de fundo proporcional ao domínio "outros saberes" */}
      <ellipse cx="160" cy="230" rx="150" ry="230" fill="url(#auraGrad)" style={{ animation: animAura }} />

      {/* ── PELE — contorno externo do corpo (histologia) ───────────── */}
      <g style={clicavel('pele')} onClick={() => onZonaClick?.('pele')}>
        <path
          d="M160,20
             C185,20 200,38 200,62
             C200,80 195,90 195,100
             C230,110 250,140 252,180
             L260,280 C262,300 255,310 245,312
             L235,400 C233,420 225,430 210,432
             L205,480 C204,495 195,502 180,502
             L140,502 C125,502 116,495 115,480
             L110,432 C95,430 87,420 85,400
             L75,312 C65,310 58,300 60,280
             L68,180 C70,140 90,110 125,100
             C125,90 120,80 120,62
             C120,38 135,20 160,20 Z"
          fill="none"
          stroke={pele.cor}
          strokeWidth={2.2}
          strokeOpacity={pele.opac}
          filter="url(#glowSoft)"
        />
      </g>

      {/* ── CRÂNIO ───────────────────────────────────────────────────── */}
      <g style={clicavel('cranio')} onClick={() => onZonaClick?.('cranio')}>
        <circle cx="160" cy="58" r="32" fill={cranio.cor} fillOpacity={cranio.opac * 0.22} stroke={cranio.cor} strokeOpacity={cranio.opac} strokeWidth={1.6} />
        <path d="M140,50 Q160,42 180,50" stroke={cranio.cor} strokeOpacity={cranio.opac * 0.7} strokeWidth={1} fill="none" />
      </g>

      {/* ── ESQUELETO — linhas dos ossos longos (anatomia) ──────────── */}
      <g style={clicavel('esqueleto')} onClick={() => onZonaClick?.('esqueleto')} stroke={esqueleto.cor} strokeOpacity={esqueleto.opac} strokeWidth={2} strokeLinecap="round" fill="none">
        <line x1="160" y1="105" x2="160" y2="290" />
        <line x1="128" y1="130" x2="70" y2="220" />
        <line x1="70" y1="220" x2="62" y2="290" />
        <line x1="192" y1="130" x2="250" y2="220" />
        <line x1="250" y1="220" x2="258" y2="290" />
        <line x1="140" y1="300" x2="128" y2="410" />
        <line x1="128" y1="410" x2="122" y2="495" />
        <line x1="180" y1="300" x2="192" y2="410" />
        <line x1="192" y1="410" x2="198" y2="495" />
      </g>

      {/* ── PULMÕES ──────────────────────────────────────────────────── */}
      <g style={clicavel('pulmoes')} onClick={() => onZonaClick?.('pulmoes')}>
        <ellipse cx="135" cy="175" rx="22" ry="38" fill={pulmoes.cor} fillOpacity={pulmoes.opac * 0.28} stroke={pulmoes.cor} strokeOpacity={pulmoes.opac} strokeWidth={1.3} />
        <ellipse cx="185" cy="175" rx="22" ry="38" fill={pulmoes.cor} fillOpacity={pulmoes.opac * 0.28} stroke={pulmoes.cor} strokeOpacity={pulmoes.opac} strokeWidth={1.3} />
      </g>

      {/* ── CORAÇÃO — pulsa (embriologia/fisiologia/clínica) ────────── */}
      <g style={clicavel('coracao')} onClick={() => onZonaClick?.('coracao')}>
        <path
          d="M160,165 C150,150 128,152 124,172 C120,192 140,208 160,222 C180,208 200,192 196,172 C192,152 170,150 160,165 Z"
          fill={coracao.cor}
          fillOpacity={coracao.opac * 0.55}
          stroke={coracao.cor}
          strokeOpacity={coracao.opac}
          strokeWidth={1.6}
          filter="url(#glowSoft)"
          style={{ animation: animCoracao, transformOrigin: '160px 185px' }}
        />
      </g>

      {/* ── ABDOME — órgãos digestivos ───────────────────────────────── */}
      <g style={clicavel('abdome')} onClick={() => onZonaClick?.('abdome')}>
        <ellipse cx="160" cy="255" rx="46" ry="32" fill={abdome.cor} fillOpacity={abdome.opac * 0.2} stroke={abdome.cor} strokeOpacity={abdome.opac} strokeWidth={1.2} />
      </g>

      {/* ── NÚCLEO CELULAR — glow pulsante central (bioquímica/patologia) ── */}
      <g style={clicavel('nucleo')} onClick={() => onZonaClick?.('nucleo')}>
        <circle
          cx="160"
          cy="255"
          r="12"
          fill={nucleo.cor}
          fillOpacity={nucleo.opac * 0.85}
          filter="url(#glowSoft)"
          style={{ animation: animNucleo, transformOrigin: '160px 255px' }}
        />
      </g>
    </svg>
  )
}
