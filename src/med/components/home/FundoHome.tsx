import { AnimaAtmosphere } from '@core/components/ui/AnimaAtmosphere'

interface Props {
  reduzirMovimento: boolean
}

/**
 * Fundo decorativo da Home — agora um alias fino sobre `AnimaAtmosphere`
 * (densidade alta, a mesma que a Home sempre teve) para não duplicar a rede
 * neural/blobs entre páginas. Explorar/Estudar usam `AnimaAtmosphere`
 * diretamente com densidade menor.
 */
export function FundoHome({ reduzirMovimento }: Props) {
  return <AnimaAtmosphere reduzirMovimento={reduzirMovimento} densidade="alta" />
}
