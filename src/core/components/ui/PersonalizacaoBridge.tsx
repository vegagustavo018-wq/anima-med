import { useEffect } from 'react'
import { useUIStore } from '@core/store/uiStore'

/**
 * Sincroniza as preferências de acessibilidade/personalização (uiStore) com
 * atributos no <html>, para que o CSS global (index.css) responda a elas.
 * Componente sem renderização — só efeitos colaterais.
 */
export function PersonalizacaoBridge() {
  const { tema, fonte, paleta, corAcento, larguraColuna, tamanhoFonte, reduzirMovimento } = useUIStore()

  useEffect(() => {
    // 'escuro' é o padrão do :root (Deep Ocean) — sem atributo; os demais ativam overrides
    if (tema === 'escuro') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = tema
  }, [tema])

  useEffect(() => {
    document.documentElement.dataset.fonte = fonte
  }, [fonte])

  useEffect(() => {
    document.documentElement.dataset.paleta = paleta
  }, [paleta])

  useEffect(() => {
    // 'padrao' é a cor do tema ativo — sem atributo; as demais ativam overrides
    if (corAcento === 'padrao') delete document.documentElement.dataset.cor
    else document.documentElement.dataset.cor = corAcento
  }, [corAcento])

  useEffect(() => {
    document.documentElement.dataset.largura = larguraColuna
  }, [larguraColuna])

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * tamanhoFonte}px`
  }, [tamanhoFonte])

  useEffect(() => {
    document.documentElement.dataset.reduzirMovimento = String(reduzirMovimento)
  }, [reduzirMovimento])

  return null
}
