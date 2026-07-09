import type { ReactNode } from 'react'

/**
 * Ícones lineares da navegação — traço fino (1.6), cantos arredondados,
 * herdam a cor via currentColor. Substituem os glifos tipográficos (✦ ◎ ⬡),
 * que rendiam com peso/altura inconsistentes entre fontes e sistemas.
 */
const TRACOS: Record<string, ReactNode> = {
  inicio: (
    <>
      <path d="M3 10.2 12 3l9 7.2" />
      <path d="M5.4 8.8V20a1 1 0 0 0 1 1h11.2a1 1 0 0 0 1-1V8.8" />
      <path d="M9.6 21v-6.4h4.8V21" />
    </>
  ),
  explorar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-1.8 4.6-4.6 1.8 1.8-4.6z" />
    </>
  ),
  estudar: (
    <>
      <path d="M12 6.5C10.4 5 8.2 4.4 5.5 4.4c-.9 0-1.7.1-2.5.3v13.6c.8-.2 1.6-.3 2.5-.3 2.7 0 4.9.6 6.5 2.1 1.6-1.5 3.8-2.1 6.5-2.1.9 0 1.7.1 2.5.3V4.7c-.8-.2-1.6-.3-2.5-.3-2.7 0-4.9.6-6.5 2.1Z" />
      <path d="M12 6.5v13.6" />
    </>
  ),
  questoes: (
    <>
      <path d="M9.2 5.8A3.6 3.6 0 0 1 12.6 4c1.9 0 3.4 1.4 3.4 3.1 0 1.6-1 2.4-2 3.1-.9.6-1.6 1.2-1.6 2.3v.6" />
      <circle cx="12.3" cy="17.6" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="10" />
    </>
  ),
  provas: (
    <>
      <circle cx="12" cy="13.4" r="7.6" />
      <path d="M12 9.6v3.8l2.6 1.6" />
      <path d="M9.8 2.6h4.4" />
      <path d="M12 2.6v3.2" />
    </>
  ),
  clinica: (
    <path d="M3 12h4.2l2.2-5.6 3.2 11.2 2.2-5.6H21" />
  ),
  calculadora: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.4 7.4h7.2" />
      <path d="M8.4 12.2h.01M12 12.2h.01M15.6 12.2h.01M8.4 16.6h.01M12 16.6h.01M15.6 16.6h.01" />
    </>
  ),
  tutoria: (
    <>
      <path d="M21 11.6a8 8 0 0 1-8.4 7.9 8.6 8.6 0 0 1-3.2-.6L4 20l1.2-4.2a7.7 7.7 0 0 1-1.2-4.2A8 8 0 0 1 12.4 3.7 8 8 0 0 1 21 11.6Z" />
      <path d="M8.8 10.2h6.4M8.8 13.4h4" />
    </>
  ),
  lacunas: (
    <>
      <circle cx="12" cy="12" r="8.4" strokeDasharray="4.4 4.4" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  sintese: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9.4h18" />
      <path d="M9.6 9.4V20" />
    </>
  ),
  corpo: (
    <>
      <circle cx="12" cy="6.2" r="3.2" />
      <path d="M5.6 21c.5-4.4 3.1-6.8 6.4-6.8s5.9 2.4 6.4 6.8" />
    </>
  ),
  jardim: (
    <>
      <path d="M12 21v-8.4" />
      <path d="M12 12.6C12 8.8 9.4 6 5.4 6c0 3.8 2.6 6.6 6.6 6.6Z" />
      <path d="M12 9.8c.4-3.4 2.8-5.6 6.6-5.6 0 3.4-2.2 5.9-5.6 6.3" />
    </>
  ),
  progresso: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-9" />
      <path d="M22 20V7" />
    </>
  ),
  sinais: (
    <path d="M12 20.4 4.8 13a4.7 4.7 0 0 1 0-6.6 4.5 4.5 0 0 1 6.5 0l.7.7.7-.7a4.5 4.5 0 0 1 6.5 0 4.7 4.7 0 0 1 0 6.6Z" />
  ),
  memoria: (
    <>
      <path d="M4.2 15.8a8 8 0 1 1 15.6 0" />
      <path d="M12 15.8 15 10" />
      <circle cx="12" cy="15.8" r="1.4" />
    </>
  ),
  'eu-passado': (
    <>
      <path d="M3.6 8.2A9 9 0 1 1 3 12" />
      <path d="M3.6 3.6v4.6h4.6" />
      <path d="M12 8v4.4l3 1.8" />
    </>
  ),
  grafo: (
    <>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="18" cy="8.4" r="2.6" />
      <circle cx="10.4" cy="18" r="2.6" />
      <path d="m8.4 7 7.2 1M7 8.4l2.6 7.2M12.6 16.4l3.8-5.8" />
    </>
  ),
  diario: (
    <>
      <path d="M20 3.6c-4.8.4-8.4 2-10.6 5.2-1.8 2.6-2.4 6-2.4 9.6 3.6 0 7-.6 9.6-2.4C19.8 13.8 19.6 8.4 20 3.6Z" />
      <path d="M4 20c2.8-4.8 6.4-8.6 11.2-11.4" />
    </>
  ),
  leech: (
    <>
      <path d="M9.4 3.6h5.2v5.8h5.8v5.2h-5.8v5.8H9.4v-5.8H3.6V9.4h5.8Z" />
    </>
  ),
  respirar: (
    <>
      <path d="M3 8.6h9.4a2.6 2.6 0 1 0-2.5-3.4" />
      <path d="M3 12.4h14.6a2.8 2.8 0 1 1-2.6 3.7" />
      <path d="M3 16.2h6.8a2.3 2.3 0 1 1-2.2 3" />
    </>
  ),
  studio: (
    <>
      <path d="M5.4 21v-7M5.4 10V3M12 21v-9M12 8V3M18.6 21v-5M18.6 12V3" />
      <path d="M3 14h4.8M9.6 12h4.8M16.2 16h4.8" />
    </>
  ),
  config: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.4 20.4-4.5-4.5" />
    </>
  ),
  'seta-esq': <path d="m14.5 6-6 6 6 6" />,
  'seta-dir': <path d="m9.5 6 6 6-6 6" />,

  // ── Ícones adicionais — Home/Explorar/Estudar (mesmo traço 1.6, currentColor) ──
  energia: <path d="M12.8 2.6 5 13.6h5.4L10.2 21.4 19 10h-5.4Z" />,
  sequencia: (
    <>
      <path d="M12 21.5c-4 0-6.6-2.6-6.6-6.2 0-2.6 1.4-4.3 2.6-5.8.3 1.6 1 2.6 1.9 3.2-.2-2.8.8-5.6 3.3-7.7.5 2.4 1.6 3.9 3 5.3 1.5 1.5 2.4 3.1 2.4 5 0 3.6-2.6 6.2-6.6 6.2Z" />
    </>
  ),
  sino: (
    <>
      <path d="M18 8.4A6 6 0 0 0 6 8.4c0 6.6-2.8 8.4-2.8 8.4h17.6s-2.8-1.8-2.8-8.4" />
      <path d="M13.7 20.6a2 2 0 0 1-3.4 0" />
    </>
  ),
  revisar: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.6" />
      <path d="M20 4v4.6h-4.6" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.4" />
      <path d="M4 20v-4.6h4.6" />
    </>
  ),
  plano: (
    <>
      <rect x="4" y="3.6" width="16" height="16.8" rx="2" />
      <path d="m7.6 10.2 1.8 1.8 3-3.6" />
      <path d="M13.6 15h4" />
      <path d="M7.6 15h.01" />
    </>
  ),
  ritmo: <path d="M2.6 12.8h4l1.8-5.6 3 10.2 2-8.4 1.6 3.8h6.4" />,
  'sol-cheio': (
    <>
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  'meio-sol': (
    <>
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 3v2M4.2 4.2l1.4 1.4M3 12h2M4.2 19.8l1.4-1.4" />
    </>
  ),
  nuvem: (
    <path d="M7.2 18.4a4.2 4.2 0 0 1-.4-8.4 5.4 5.4 0 0 1 10.4-1.8 4.4 4.4 0 0 1-.6 10.2Z" />
  ),
  lua: <path d="M20 13.2A8.4 8.4 0 1 1 10.8 4a6.6 6.6 0 0 0 9.2 9.2Z" />,
}

export function IconeNav({ nome, tamanho = 17 }: { nome: string; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {TRACOS[nome] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}

/**
 * Marca da ANIMA — núcleo orgânico com anel e satélite, em vez do glifo ✦.
 * Mesma linguagem do OrganismoHero: célula viva, não estrela tipográfica.
 */
export function LogoAnima({ tamanho = 26 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="logoNucleo" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="var(--color-accent-dim)" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13.4" stroke="var(--color-border-accent)" strokeWidth="1" />
      <circle cx="16" cy="16" r="9" stroke="var(--color-accent)" strokeWidth="1" opacity="0.35" />
      <circle cx="16" cy="16" r="5.2" fill="url(#logoNucleo)" />
      <circle cx="25.4" cy="9.4" r="1.7" fill="var(--color-accent)" />
      <circle cx="7.6" cy="23.2" r="1.1" fill="var(--color-accent)" opacity="0.6" />
    </svg>
  )
}
