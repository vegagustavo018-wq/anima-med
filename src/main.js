import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from '@core/components/ui/ErrorBoundary';
import { bootstrap } from '@core/db/bootstrap';
import { db, registrarEvento } from '@core/db/database';
import { sincronizarMovimento } from '@core/store/uiStore';
import { registrarSW } from '@core/pwa';
sincronizarMovimento();
// Handlers globais — nada de erro engolido em silêncio.
window.addEventListener('error', (e) => void registrarEvento('window_error', { mensagem: e.message }));
window.addEventListener('unhandledrejection', (e) => void registrarEvento('unhandled_rejection', { motivo: String(e.reason) }));
function render() {
    createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }) }));
}
void (async () => {
    // Warm start (banco já povoado): pinta IMEDIATO e sincroniza em background.
    // Cold start (banco vazio): espera só a 1ª ingestão, para não pintar um app sem conteúdo.
    const jaTemDados = await db.blocos.count().catch(() => 0);
    if (jaTemDados > 0) {
        render();
        const despertar = () => void bootstrap();
        if ('requestIdleCallback' in window)
            requestIdleCallback(despertar, { timeout: 2000 });
        else
            setTimeout(despertar, 1);
    }
    else {
        await bootstrap();
        render();
    }
    registrarSW();
})();
