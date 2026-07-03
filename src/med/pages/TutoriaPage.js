import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pagina, CabecalhoPagina } from '@core/components/ui/primitivos';
import { ChatShellFuturo } from '@med/components/ia/ChatShellFuturo';
/** IA & Tutoria (bloco 4) — recursos locais hoje, prontos para IA amanhã. */
export function TutoriaPage() {
    return (_jsxs(Pagina, { largura: 1000, children: [_jsx(CabecalhoPagina, { titulo: "Tutoria", subtitulo: "Alguns recursos j\u00E1 pensam com voc\u00EA agora. Outros esperam uma conex\u00E3o futura \u2014 sem fingir." }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }, children: [_jsx(ChatShellFuturo, { titulo: "Di\u00E1logo Socr\u00E1tico", sugestao: "Perguntas que te levam a construir a resposta, n\u00E3o que te d\u00E3o pronta." }), _jsx(ChatShellFuturo, { titulo: "Paciente Virtual", sugestao: "Pratique anamnese e racioc\u00EDnio conversando com um caso simulado." })] })] }));
}
