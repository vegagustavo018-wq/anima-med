import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagina, FalaAnima } from '@core/components/ui/primitivos'
import { useUIStore } from '@core/store/uiStore'
import { RespiracaoGuiada } from '@med/components/bemestar/RespiracaoGuiada'

export function RespirarPage() {
  const navigate = useNavigate()
  const { reduzirMovimento } = useUIStore()
  const [completo, setCompleto] = useState(false)

  return (
    <Pagina largura={520}>
      <div style={{ paddingTop: 40, textAlign: 'center' }}>
        <FalaAnima texto={completo ? 'Pronto. Você está mais firme agora.' : 'Vamos respirar juntos. Quatro tempos, quatro vezes.'} />
        <div style={{ marginTop: 20 }}>
          {!completo ? (
            <RespiracaoGuiada reduzirMovimento={reduzirMovimento} ciclos={4} onCompleto={() => setCompleto(true)} />
          ) : (
            <div style={{ padding: '40px 0' }}>
              <div style={{ fontSize: 48, color: 'var(--color-accent)' }}>✦</div>
            </div>
          )}
        </div>
        {completo && (
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: 'var(--color-bg-base)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Continuar
          </button>
        )}
      </div>
    </Pagina>
  )
}
