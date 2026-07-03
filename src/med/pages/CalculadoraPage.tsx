import { useState } from 'react'
import { Pagina, CabecalhoPagina } from '@core/components/ui/primitivos'
import { CALCULADORAS } from '@core/anima/calculosClinicos'

/** Bancada de Cálculo Clínico (bloco 5). Fins educacionais — não é conduta real. */
export function CalculadoraPage() {
  return (
    <Pagina largura={900}>
      <CabecalhoPagina titulo="Bancada de Cálculo" subtitulo="Fórmulas para praticar raciocínio quantitativo — não substitui julgamento clínico real." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {CALCULADORAS.map((c) => (
          <CartaoCalculadora key={c.id} calc={c} />
        ))}
      </div>
    </Pagina>
  )
}

function CartaoCalculadora({ calc }: { calc: (typeof CALCULADORAS)[number] }) {
  const [valores, setValores] = useState<Record<string, string>>({})
  const [opcoes, setOpcoes] = useState<Record<string, string>>(
    Object.fromEntries((calc.extras ?? []).map((e) => [e.chave, e.opcoes[0].v]))
  )

  const numericos = Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, parseFloat(v)]))
  const resultado = calc.calcular(numericos, opcoes)

  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{calc.nome}</p>
      <p style={{ margin: '0 0 16px', fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{calc.formula}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {calc.campos.map((f) => (
          <div key={f.chave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)' }}>{f.label}</label>
            <input
              type="number"
              value={valores[f.chave] ?? ''}
              onChange={(e) => setValores((v) => ({ ...v, [f.chave]: e.target.value }))}
              style={{ width: 90, padding: '6px 8px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: 13 }}
            />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 44 }}>{f.unidade}</span>
          </div>
        ))}
        {calc.extras?.map((e) => (
          <div key={e.chave} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)' }}>{e.label}</label>
            <select
              value={opcoes[e.chave]}
              onChange={(ev) => setOpcoes((o) => ({ ...o, [e.chave]: ev.target.value }))}
              style={{ padding: '6px 8px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: 12 }}
            >
              {e.opcoes.map((op) => (
                <option key={op.v} value={op.v}>{op.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
        {resultado ? (
          <>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
              {resultado.valor.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)' }}>{resultado.unidade}</span>
            </p>
            {resultado.interpretacao && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>{resultado.interpretacao}</p>}
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>Preencha os campos</p>
        )}
      </div>
    </div>
  )
}
