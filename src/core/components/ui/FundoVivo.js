import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useUIStore } from '@core/store/uiStore';
const QTD = 34;
export function FundoVivo() {
    const canvasRef = useRef(null);
    const reduzirMovimento = useUIStore((s) => s.reduzirMovimento);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let largura = 0;
        let altura = 0;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particulas = [];
        let raf = 0;
        let rodando = true;
        const corAccent = () => getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() ||
            '#4fd1c5';
        function semear() {
            particulas = Array.from({ length: QTD }, (_, i) => ({
                x: Math.random() * largura,
                y: Math.random() * altura,
                r: 0.6 + Math.random() * 2.2,
                velY: 4 + Math.random() * 10, // px/s subindo
                faseW: (i / QTD) * Math.PI * 2 + Math.random(),
                ampW: 6 + Math.random() * 18,
                brilhoBase: 0.14 + Math.random() * 0.32,
            }));
        }
        function redimensionar() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            largura = window.innerWidth;
            altura = window.innerHeight;
            canvas.width = largura * dpr;
            canvas.height = altura * dpr;
            canvas.style.width = `${largura}px`;
            canvas.style.height = `${altura}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (particulas.length === 0)
                semear();
        }
        function hexParaRgb(hex) {
            const h = hex.replace('#', '');
            const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
            const int = parseInt(n, 16);
            return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
        }
        let ultimo = 0;
        function quadro(ts) {
            if (!rodando)
                return;
            const dt = ultimo ? Math.min((ts - ultimo) / 1000, 0.05) : 0;
            ultimo = ts;
            ctx.clearRect(0, 0, largura, altura);
            const [rC, gC, bC] = hexParaRgb(corAccent());
            for (const p of particulas) {
                p.y -= p.velY * dt;
                p.faseW += dt * 0.6;
                if (p.y < -8) {
                    p.y = altura + 8;
                    p.x = Math.random() * largura;
                }
                const x = p.x + Math.sin(p.faseW) * p.ampW;
                const cintila = 0.75 + 0.25 * Math.sin(p.faseW * 1.7);
                const alfa = p.brilhoBase * cintila;
                const grad = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 6);
                grad.addColorStop(0, `rgba(${rC},${gC},${bC},${alfa})`);
                grad.addColorStop(1, `rgba(${rC},${gC},${bC},0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, p.y, p.r * 6, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(quadro);
        }
        function quadroEstatico() {
            // frame único, sem movimento (respeita reduzir-movimento)
            redimensionar();
            ctx.clearRect(0, 0, largura, altura);
            const [rC, gC, bC] = hexParaRgb(corAccent());
            for (const p of particulas) {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                grad.addColorStop(0, `rgba(${rC},${gC},${bC},${p.brilhoBase})`);
                grad.addColorStop(1, `rgba(${rC},${gC},${bC},0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        const aoVisibilidade = () => {
            if (document.hidden) {
                rodando = false;
                cancelAnimationFrame(raf);
            }
            else if (!reduzirMovimento) {
                rodando = true;
                ultimo = 0;
                raf = requestAnimationFrame(quadro);
            }
        };
        redimensionar();
        window.addEventListener('resize', redimensionar);
        document.addEventListener('visibilitychange', aoVisibilidade);
        if (reduzirMovimento) {
            quadroEstatico();
        }
        else {
            raf = requestAnimationFrame(quadro);
        }
        return () => {
            rodando = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', redimensionar);
            document.removeEventListener('visibilitychange', aoVisibilidade);
        };
    }, [reduzirMovimento]);
    return (_jsx("canvas", { ref: canvasRef, "aria-hidden": "true", style: {
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            opacity: 0.55,
        } }));
}
