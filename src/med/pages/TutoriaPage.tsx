import { Pagina, CabecalhoPagina } from '@core/components/ui/primitivos'
import { ChatShellFuturo } from '@med/components/ia/ChatShellFuturo'

/** IA & Tutoria (bloco 4) — recursos locais hoje, prontos para IA amanhã. */
export function TutoriaPage() {
  return (
    <Pagina largura={1000}>
      <CabecalhoPagina titulo="Tutoria" subtitulo="Alguns recursos já pensam com você agora. Outros esperam uma conexão futura — sem fingir." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        <ChatShellFuturo titulo="Diálogo Socrático" sugestao="Perguntas que te levam a construir a resposta, não que te dão pronta." />
        <ChatShellFuturo titulo="Paciente Virtual" sugestao="Pratique anamnese e raciocínio conversando com um caso simulado." />
      </div>
    </Pagina>
  )
}
