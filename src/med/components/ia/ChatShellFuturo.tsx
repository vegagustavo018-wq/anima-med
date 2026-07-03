import { useState } from 'react'

interface Mensagem {
  autor: 'usuario' | 'sistema'
  texto: string
}

/**
 * Shell de chat pronto para conectar a um provedor de IA no futuro (bloco 4).
 * Sem chave de API configurada, o organismo é honesto sobre isso — não
 * finge uma resposta inteligente que não pode dar.
 */
export function ChatShellFuturo({ titulo, sugestao }: { titulo: string; sugestao: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')

  const enviar = () => {
    if (!texto.trim()) return
    setMensagens((m) => [
      ...m,
      { autor: 'usuario', texto },
      {
        autor: 'sistema',
        texto: 'Este recurso está pronto para funcionar assim que uma chave de IA for configurada. Por ora, é um espaço reservado — a conversa real ainda não acontece.',
      },
    ])
    setTexto('')
  }

  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 20, display: 'flex', flexDirection: 'column', height: 420 }}>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{titulo}</p>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-text-muted)' }}>{sugestao}</p>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {mensagens.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.autor === 'usuario' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: m.autor === 'usuario' ? 'var(--color-accent-glow)' : 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
            }}
          >
            {m.texto}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escreva sua pergunta..."
          style={{ flex: 1, padding: '9px 12px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 13 }}
        />
        <button onClick={enviar} style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Enviar
        </button>
      </div>
    </div>
  )
}
