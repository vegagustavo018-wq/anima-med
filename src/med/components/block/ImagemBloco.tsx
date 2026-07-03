import type { NarrativaItem, OrigemImagem } from '@core/types/schema'

/**
 * Imagem de bloco com SELO DE PROVENIÊNCIA honesto. Política do projeto
 * (ver memória anima-imagens-por-ia): imagem de IA é conteúdo de 1ª classe,
 * nunca gatekeepada — mas SEMPRE rotulada, para o aluno saber o que está vendo.
 *
 * - real   → ✓ verde  (imagem real / domínio público verificada)
 * - ia     → ⚠ âmbar  (ilustração por IA: auxílio, pode conter imprecisões)
 * - esquema→ ◇ teal   (diagrama didático vetorial)
 *
 * Se `url` existe, mostra a imagem; senão, o placeholder didático com a
 * descrição (e o prompt fica pronto no dado para geração/curadoria).
 */

interface SeloInfo {
  icone: string
  rotulo: string
  aviso: string | null
  cor: string
}

const SELOS: Record<OrigemImagem, SeloInfo> = {
  real: {
    icone: '✓',
    rotulo: 'Imagem real',
    aviso: null,
    cor: 'var(--color-success)',
  },
  ia: {
    icone: '⚠',
    rotulo: 'Ilustração por IA',
    aviso: 'Auxílio ao estudo — pode conter imprecisões. Confira com atlas/lâmina real.',
    cor: 'var(--color-warning)',
  },
  esquema: {
    icone: '◇',
    rotulo: 'Esquema didático',
    aviso: null,
    cor: 'var(--color-accent)',
  },
}

export function SeloImagem({ origem }: { origem: OrigemImagem }) {
  const s = SELOS[origem]
  return (
    <span
      title={s.aviso ?? s.rotulo}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 9px',
        borderRadius: 99,
        border: `1px solid ${s.cor}`,
        color: s.cor,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.03em',
        background: 'color-mix(in srgb, currentColor 8%, transparent)',
      }}
    >
      <span aria-hidden="true">{s.icone}</span>
      {s.rotulo}
    </span>
  )
}

export function ImagemBloco({
  titulo,
  descricao,
  origem = 'ia',
  url,
}: {
  titulo: string
  descricao: string
  origem?: OrigemImagem
  url?: string | null
}) {
  const selo = SELOS[origem]
  return (
    <figure
      style={{
        border: url ? '1px solid var(--color-border)' : '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: url ? 12 : 24,
        margin: '1.5rem 0',
        background: 'var(--color-bg-card)',
        textAlign: url ? 'left' : 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: url ? 'space-between' : 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <figcaption style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>{titulo}</figcaption>
        <SeloImagem origem={origem} />
      </div>

      {url ? (
        <img
          src={url}
          alt={descricao}
          loading="lazy"
          style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block' }}
        />
      ) : (
        <div style={{ fontSize: 40, marginBottom: 12, color: 'var(--color-text-muted)', lineHeight: 1 }} aria-hidden="true">
          🖼
        </div>
      )}

      <p style={{ margin: url ? '10px 0 0' : 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {descricao}
      </p>

      {selo.aviso && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--color-warning)', lineHeight: 1.4 }}>
          {selo.aviso}
        </p>
      )}
      {!url && (
        <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Imagem pendente de geração
        </p>
      )}
    </figure>
  )
}

/**
 * Aba "Imagens & Resumos" do bloco — reúne todas as imagens/esquemas da
 * narrativa num só lugar, para o aluno revisar a parte visual de uma vez
 * (pedido do Gustavo: toda vez que entra no bloco, tem uma aba com as imagens
 * das estruturas e resumos). É o embrião da futura Galeria/Museu ANIMA-Med.
 */
export function ImagensAba({ narrativa }: { narrativa: NarrativaItem[] }) {
  const imagens = narrativa.filter((n): n is Extract<NarrativaItem, { tipo: 'imagem' }> => n.tipo === 'imagem')
  if (imagens.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        Este bloco ainda não tem imagens ou esquemas. Elas chegam conforme o conteúdo é produzido.
      </p>
    )
  }
  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
        As estruturas e resumos visuais deste tema, reunidos. Cada imagem traz seu selo de proveniência.
      </p>
      {imagens.map((img, i) => (
        <ImagemBloco
          key={i}
          titulo={img.titulo}
          descricao={img.descricao}
          origem={img.origem ?? 'ia'}
          url={img.url ?? null}
        />
      ))}
    </div>
  )
}
