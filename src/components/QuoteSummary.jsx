import { Check, Copy, Download, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { profiles } from '../data/pricing.js'
import { buildWhatsAppQuote, money, quoteTotal } from '../lib/quote.js'

export function QuoteSummary({ profile, lines, customer, onCustomerChange, onRemove, onClear, onExport }) {
  const [copied, setCopied] = useState(false)
  const total = quoteTotal(lines)
  const ivaNote = profile === 'imprenta' ? 'Valores sin IVA' : 'Valores finales orientativos'

  async function copyQuote() {
    const text = buildWhatsAppQuote({ profile, profileLabel: profiles[profile].label, customer, lines })
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <aside className="panel quote-panel">
      <div className="quote-head">
        <span>Presupuesto</span>
        <b>{profiles[profile].label}</b>
      </div>

      <div className="customer-card">
        <label>
          Cliente
          <input value={customer.name} onChange={event => onCustomerChange('name', event.target.value)} placeholder="Nombre o razon social" />
        </label>
        <label>
          Contacto
          <input value={customer.contact} onChange={event => onCustomerChange('contact', event.target.value)} placeholder="Telefono / email" />
        </label>
      </div>

      <div className="quote-lines">
        {lines.length === 0 ? (
          <p>Agrega bajadas laser y terminaciones para armar el presupuesto.</p>
        ) : lines.map(line => (
          <div key={line.id} className="quote-line">
            <span>
              <b>{line.title}</b>
              <small>{line.detail}</small>
              <em>{line.quantity} {line.unit} x {money.format(line.unitPrice)}</em>
            </span>
            <strong>{money.format(line.total)}</strong>
            <button type="button" onClick={() => onRemove(line.id)} aria-label={`Quitar ${line.title}`}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <dl className="totals">
        <div><dt>Items</dt><dd>{lines.length}</dd></div>
        <div><dt>Condicion</dt><dd>{ivaNote}</dd></div>
        <div className="grand-total"><dt>Total</dt><dd>{money.format(total)}</dd></div>
      </dl>

      <div className="quote-actions">
        <button type="button" className="secondary-action copy-action" onClick={copyQuote} disabled={lines.length === 0}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <button type="button" className="secondary-action" onClick={onClear} disabled={lines.length === 0}>
          <RotateCcw size={17} />
          Limpiar
        </button>
        <button type="button" className="primary-action" onClick={onExport} disabled={lines.length === 0}>
          <Download size={17} />
          PDF
        </button>
      </div>
    </aside>
  )
}
