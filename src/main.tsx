import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from '@core/components/ui/ErrorBoundary'
import { bootstrap } from '@core/db/bootstrap'
import { db, registrarEvento } from '@core/db/database'
import { sincronizarMovimento } from '@core/store/uiStore'
import { registrarSW } from '@core/pwa'

sincronizarMovimento()

// Handlers globais — nada de erro engolido em silêncio.
window.addEventListener('error', (e) => void registrarEvento('window_error', { mensagem: e.message }))
window.addEventListener('unhandledrejection', (e) =>
  void registrarEvento('unhandled_rejection', { motivo: String(e.reason) })
)

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  )
}

// Cold start pode levar alguns segundos (1ª ingestão do conteúdo). Em vez de uma
// tela preta muda, a ANIMA aparece respirando e diz o que está acontecendo.
function pintarBoot() {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML =
    '<div style="min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:var(--color-bg-base);padding:24px;text-align:center">' +
    '<span class="anima-respira" style="font-size:46px;color:var(--color-accent);line-height:1">✦</span>' +
    '<div>' +
    '<p style="margin:0 0 6px;font-size:16px;font-weight:600;color:var(--color-text-primary);font-family:var(--font-serif)">Estou me preparando para você…</p>' +
    '<p style="margin:0 auto;max-width:340px;font-size:13px;color:var(--color-text-muted);line-height:1.6">Organizando o conteúdo pela primeira vez neste dispositivo. Só acontece uma vez — depois eu abro na hora.</p>' +
    '</div></div>'
}

void (async () => {
  // Warm start (banco já povoado): pinta IMEDIATO e sincroniza em background.
  // Cold start (banco vazio): espera só a 1ª ingestão, para não pintar um app sem conteúdo.
  const jaTemDados = await db.blocos.count().catch(() => 0)
  if (jaTemDados > 0) {
    render()
    const despertar = () => void bootstrap()
    if ('requestIdleCallback' in window) requestIdleCallback(despertar, { timeout: 2000 })
    else setTimeout(despertar, 1)
  } else {
    pintarBoot()
    await bootstrap()
    render()
  }
  registrarSW()
})()
