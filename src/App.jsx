import { BookOpen, Layers, Plus } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useState } from 'react'
import { FinishingModal } from './components/FinishingModal.jsx'
import { LaserBuilder } from './components/LaserBuilder.jsx'
import { ProfilePicker } from './components/ProfilePicker.jsx'
import { QuoteSummary } from './components/QuoteSummary.jsx'
import { profiles } from './data/pricing.js'
import { money, quoteTotal } from './lib/quote.js'

export function App() {
  const [profile, setProfile] = useState('publico')
  const [lines, setLines] = useState([])
  const [customer, setCustomer] = useState({ name: '', contact: '' })
  const [finishingOpen, setFinishingOpen] = useState(false)

  function addLine(line) {
    setLines(current => [...current, line])
  }

  function updateCustomer(field, value) {
    setCustomer(current => ({ ...current, [field]: value }))
  }

  function exportPdf() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let y = 18

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(19)
    doc.setTextColor(22, 43, 49)
    doc.text('Presupuesto de impresiones', margin, y)
    doc.setFontSize(9)
    doc.setTextColor(101, 116, 122)
    doc.text(new Intl.DateTimeFormat('es-AR').format(new Date()), pageWidth - margin, y, { align: 'right' })
    y += 10

    doc.setFillColor(22, 43, 49)
    doc.rect(margin, y, contentWidth, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`Lista: ${profiles[profile].label}`, margin + 4, y + 7.5)
    doc.text(profile === 'imprenta' ? 'SIN IVA' : 'ORIENTATIVO', pageWidth - margin - 4, y + 7.5, { align: 'right' })
    y += 20

    doc.setTextColor(22, 43, 49)
    doc.setFont('helvetica', 'bold')
    doc.text('Cliente', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(77, 91, 97)
    doc.text(customer.name || '-', margin, y)
    doc.text(customer.contact || '-', margin, y + 5)
    y += 16

    lines.forEach((line, index) => {
      if (y > 260) {
        doc.addPage()
        y = 18
      }
      doc.setDrawColor(224, 231, 228)
      doc.line(margin, y - 2, pageWidth - margin, y - 2)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(22, 43, 49)
      doc.text(`${index + 1}. ${line.title}`, margin, y + 3)
      doc.text(money.format(line.total), pageWidth - margin, y + 3, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(93, 109, 115)
      doc.setFontSize(8.5)
      doc.text(doc.splitTextToSize(line.detail, 118), margin, y + 8)
      doc.text(`${line.quantity} ${line.unit} x ${money.format(line.unitPrice)}`, pageWidth - margin, y + 8, { align: 'right' })
      doc.setFontSize(10)
      y += 17
    })

    y += 5
    doc.setFillColor(214, 38, 91)
    doc.rect(margin, y, contentWidth, 17, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(profile === 'imprenta' ? 'Total sin IVA' : 'Total', margin + 5, y + 10)
    doc.setFontSize(15)
    doc.text(money.format(quoteTotal(lines)), pageWidth - margin - 5, y + 10, { align: 'right' })

    doc.save('presupuesto-impresiones.pdf')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <img className="brand-logo" src="/logo-rojas.png" alt="Rojas Impresiones" />
        <div className="brand-copy">
          <strong>Presupuestador</strong>
          <span>Bajada laser y terminaciones</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p>Impresiones</p>
            <h1>PRESUPUESTADOR PARA BAJADAS LASER Y TERMINACIONES</h1>
          </div>
          <button className="open-modal-button" type="button" onClick={() => setFinishingOpen(true)}>
            <BookOpen size={18} />
            Terminaciones
          </button>
        </section>

        <section className="panel profile-panel">
          <div className="section-title compact">
            <span>00</span>
            <div>
              <h2>Perfil de precio</h2>
              <p>El perfil afecta todos los items que se agreguen desde ahora.</p>
            </div>
          </div>
          <ProfilePicker value={profile} onChange={setProfile} />
        </section>

        <div className="workspace">
          <div className="left-column">
            <LaserBuilder profile={profile} onAdd={addLine} />
            <section className="panel helper-panel">
              <div>
                <Layers size={22} />
                <span>
                  <b>Terminaciones como modulo aparte</b>
                  <small>Anillados, plastificados, tapas, binder, foil y guillotina se agregan desde un modal para no mezclar el calculo principal.</small>
                </span>
              </div>
              <button type="button" className="secondary-action" onClick={() => setFinishingOpen(true)}>
                <Plus size={17} />
                Agregar terminacion
              </button>
            </section>
          </div>

          <QuoteSummary
            profile={profile}
            lines={lines}
            customer={customer}
            onCustomerChange={updateCustomer}
            onRemove={id => setLines(current => current.filter(line => line.id !== id))}
            onClear={() => setLines([])}
            onExport={exportPdf}
          />
        </div>
      </main>

      {finishingOpen && (
        <FinishingModal
          profile={profile}
          onClose={() => setFinishingOpen(false)}
          onAdd={line => {
            addLine(line)
            setFinishingOpen(false)
          }}
        />
      )}
    </div>
  )
}
