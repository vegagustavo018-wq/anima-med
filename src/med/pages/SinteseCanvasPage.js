import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@core/db/database';
import { useSinteseStore } from '@core/store/sinteseStore';
const CORES = [
    { v: 'amarelo', hex: '#f6e05e' },
    { v: 'vermelho', hex: '#fc8181' },
    { v: 'roxo', hex: '#b794f4' },
    { v: 'verde', hex: '#68d391' },
];
let contador = 0;
function novoId() {
    contador += 1;
    return `no_${contador}`;
}
/** Editor do canvas de síntese — arrastar, conectar, colorir (bloco 9). */
export function SinteseCanvasPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { salvarConteudo } = useSinteseStore();
    const [titulo, setTitulo] = useState('');
    const [nos, setNos] = useState([]);
    const [arestas, setArestas] = useState([]);
    const [conectando, setConectando] = useState(null);
    const [arrastando, setArrastando] = useState(null);
    const [salvo, setSalvo] = useState(true);
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!id)
            return;
        db.sinteses.get(Number(id)).then((s) => {
            if (!s)
                return;
            setTitulo(s.titulo);
            setNos(s.nos);
            setArestas(s.arestas);
        });
    }, [id]);
    useEffect(() => {
        if (salvo || !id)
            return;
        const t = setTimeout(async () => {
            await salvarConteudo(Number(id), nos, arestas);
            setSalvo(true);
        }, 500);
        return () => clearTimeout(t);
    }, [nos, arestas, salvo, id, salvarConteudo]);
    const marcarSujo = () => setSalvo(false);
    const criarNo = (x, y) => {
        const no = { id: novoId(), x, y, texto: 'novo conceito', cor: 'amarelo' };
        setNos((n) => [...n, no]);
        marcarSujo();
    };
    const aoDuploClique = (e) => {
        if (!canvasRef.current || e.target !== canvasRef.current)
            return;
        const rect = canvasRef.current.getBoundingClientRect();
        criarNo(e.clientX - rect.left, e.clientY - rect.top);
    };
    const iniciarArrasto = (noId, e) => {
        if (!canvasRef.current)
            return;
        const no = nos.find((n) => n.id === noId);
        if (!no)
            return;
        const rect = canvasRef.current.getBoundingClientRect();
        setArrastando({ id: noId, offX: e.clientX - rect.left - no.x, offY: e.clientY - rect.top - no.y });
    };
    const aoMoverMouse = useCallback((e) => {
        if (!arrastando || !canvasRef.current)
            return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - arrastando.offX;
        const y = e.clientY - rect.top - arrastando.offY;
        setNos((ns) => ns.map((n) => (n.id === arrastando.id ? { ...n, x, y } : n)));
    }, [arrastando]);
    const aoSoltarMouse = () => {
        if (arrastando)
            marcarSujo();
        setArrastando(null);
    };
    const clicarNo = (noId) => {
        if (!conectando) {
            setConectando(noId);
            return;
        }
        if (conectando === noId) {
            setConectando(null);
            return;
        }
        setArestas((a) => {
            const existe = a.some((x) => (x.de === conectando && x.para === noId) || (x.de === noId && x.para === conectando));
            if (existe)
                return a;
            return [...a, { de: conectando, para: noId }];
        });
        marcarSujo();
        setConectando(null);
    };
    const editarTexto = (noId, texto) => {
        setNos((ns) => ns.map((n) => (n.id === noId ? { ...n, texto } : n)));
        marcarSujo();
    };
    const mudarCor = (noId, cor) => {
        setNos((ns) => ns.map((n) => (n.id === noId ? { ...n, cor } : n)));
        marcarSujo();
    };
    const removerNo = (noId) => {
        setNos((ns) => ns.filter((n) => n.id !== noId));
        setArestas((as) => as.filter((a) => a.de !== noId && a.para !== noId));
        marcarSujo();
    };
    const noPorId = new Map(nos.map((n) => [n.id, n]));
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '82vh' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }, children: [_jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center' }, children: [_jsx("button", { onClick: () => navigate('/sintese'), style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 14, cursor: 'pointer' }, children: "\u2190 S\u00EDnteses" }), _jsx("h1", { style: { margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }, children: titulo })] }), _jsxs("span", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: [salvo ? 'salvo' : 'salvando...', " \u00B7 duplo-clique para criar \u00B7 clique dois n\u00F3s para conectar"] })] }), _jsxs("div", { ref: canvasRef, onDoubleClick: aoDuploClique, onMouseMove: aoMoverMouse, onMouseUp: aoSoltarMouse, onMouseLeave: aoSoltarMouse, style: {
                    flex: 1,
                    position: 'relative',
                    background: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px) 0 0/24px 24px, var(--color-bg-base)',
                    overflow: 'hidden',
                    cursor: 'crosshair',
                }, children: [_jsx("svg", { style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }, children: arestas.map((a, i) => {
                            const de = noPorId.get(a.de);
                            const para = noPorId.get(a.para);
                            if (!de || !para)
                                return null;
                            return _jsx("line", { x1: de.x, y1: de.y, x2: para.x, y2: para.y, stroke: "var(--color-accent)", strokeOpacity: 0.4, strokeWidth: 1.5 }, i);
                        }) }), nos.map((n) => {
                        const cor = CORES.find((c) => c.v === n.cor)?.hex ?? '#f6e05e';
                        const emConexao = conectando === n.id;
                        return (_jsxs("div", { onMouseDown: (e) => {
                                e.stopPropagation();
                                iniciarArrasto(n.id, e);
                            }, onClick: (e) => {
                                e.stopPropagation();
                                clicarNo(n.id);
                            }, style: {
                                position: 'absolute',
                                left: n.x,
                                top: n.y,
                                transform: 'translate(-50%, -50%)',
                                minWidth: 100,
                                maxWidth: 200,
                                background: 'var(--color-bg-elevated)',
                                border: `2px solid ${emConexao ? 'var(--color-accent)' : cor}`,
                                borderRadius: 'var(--radius-md)',
                                padding: '8px 12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                cursor: 'grab',
                                userSelect: 'none',
                            }, children: [_jsx("div", { contentEditable: true, suppressContentEditableWarning: true, onBlur: (e) => editarTexto(n.id, e.currentTarget.textContent ?? ''), onMouseDown: (e) => e.stopPropagation(), style: { fontSize: 13, color: 'var(--color-text-primary)', outline: 'none' }, children: n.texto }), _jsxs("div", { style: { display: 'flex', gap: 4, marginTop: 6, alignItems: 'center' }, onMouseDown: (e) => e.stopPropagation(), children: [CORES.map((c) => (_jsx("button", { onClick: () => mudarCor(n.id, c.v), style: { width: 12, height: 12, borderRadius: '50%', background: c.hex, border: n.cor === c.v ? '2px solid var(--color-text-primary)' : 'none', cursor: 'pointer', padding: 0 } }, c.v))), _jsx("button", { onClick: () => removerNo(n.id), style: { marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer' }, children: "\u00D7" })] })] }, n.id));
                    }), nos.length === 0 && (_jsx("p", { style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 13, color: 'var(--color-text-muted)' }, children: "Duplo-clique em qualquer lugar para criar o primeiro n\u00F3" }))] })] }));
}
