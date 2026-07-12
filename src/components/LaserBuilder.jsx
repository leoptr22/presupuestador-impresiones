import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { laserProducts } from '../data/pricing.js'
import { getLaserPrice, makeLaserLine, money } from '../lib/quote.js'
import { SegmentedControl } from './SegmentedControl.jsx'

const pdfSectionOrder = {
  publico: [
    'COPIAS A4 75G',
    'A 4',
    'LAMINADOS A4',
    'Impresion INKJET COLOR',
    'A 3 / Super A 3 32x47cm',
    'LAMINADOS A3',
    'Plancha Iman 30x42',
  ],
  disenadores: [
    'COPIAS A4 75G',
    'LAMINADOS A3+',
    'Plancha Iman 30x42',
    'A 3 / Super A 3 32x47cm',
    'Impresion INKJET COLOR',
  ],
  imprenta: [
    'COPIAS A4 75G',
    'LAMINADOS A3+',
    'Plancha Iman 30x42',
    'A 3 / Super A 3 32x47cm',
    'Impresion INKJET COLOR',
  ],
}

function hasProfilePrice(item, profile) {
  return item.prices[profile]?.some(price => price.one != null || price.two != null)
}

function orderedGroups(items, profile) {
  const groups = items.reduce((current, item) => {
    current[item.section] ??= []
    current[item.section].push(item)
    return current
  }, {})
  const order = pdfSectionOrder[profile] ?? []
  return Object.entries(groups).sort(([a], [b]) => {
    const aIndex = order.indexOf(a)
    const bIndex = order.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

export function LaserBuilder({ profile, onAdd }) {
  const [query, setQuery] = useState('')
  const [productId, setProductId] = useState('')
  const [rangeIndex, setRangeIndex] = useState(0)
  const [side, setSide] = useState('one')
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')

  const profileProducts = useMemo(() => laserProducts.filter(item => hasProfilePrice(item, profile)), [profile])
  const product = profileProducts.find(item => item.id === productId) ?? null
  const ranges = product?.rangesByProfile[profile] ?? []
  const safeRangeIndex = ranges.length ? Math.min(rangeIndex, ranges.length - 1) : 0
  const price = product ? getLaserPrice(product, profile, safeRangeIndex, side) : null
  const subtotal = price == null ? null : Math.round(price * (Number(quantity) || 0))

  const grouped = useMemo(() => {
    const text = query.trim().toLowerCase()
    const filtered = profileProducts.filter(item => {
      const haystack = `${item.name} ${item.format} ${item.section} ${item.finish}`.toLowerCase()
      return !text || haystack.includes(text)
    })
    return orderedGroups(filtered, profile)
  }, [profile, profileProducts, query])

  function selectProduct(nextId) {
    setProductId(nextId)
    setRangeIndex(0)
    setSide('one')
  }

  function addLine() {
    if (!product || price == null) return
    onAdd(makeLaserLine({ product, profile, rangeIndex: safeRangeIndex, side, quantity, description }))
  }

  return (
    <section className="panel builder-panel">
      <div className="section-title">
        <span>01</span>
        <div>
          <h2>Bajada laser</h2>
          <p>Elegi el producto, rango y caras. El precio se toma segun el perfil activo.</p>
        </div>
      </div>

      <div className="search-box">
        <Search size={17} />
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar A4, A3, autoadhesivo, medio corte..." />
      </div>

      <div className="product-list">
        {grouped.map(([section, items]) => (
          <div className="product-group" key={section}>
            <h3>{section}</h3>
            <div>
              {items.map(item => {
                const active = item.id === productId
                const sample = getLaserPrice(item, profile, 0, 'one')
                return (
                  <button key={item.id} type="button" className={active ? 'product-card active' : 'product-card'} onClick={() => selectProduct(item.id)}>
                    <b>{item.name}</b>
                    <span>{item.format}</span>
                    <small>{item.finish}</small>
                    <em>{sample == null ? 'Consultar' : `desde ${money.format(sample)} / hoja`}</em>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="config-grid">
        <label>
          Rango de hojas
          <select disabled={!product} value={safeRangeIndex} onChange={event => setRangeIndex(Number(event.target.value))}>
            {ranges.map((range, index) => <option key={range} value={index}>{range}</option>)}
          </select>
        </label>
        <SegmentedControl
          label="Caras"
          value={side}
          onChange={setSide}
          disabled={!product}
          options={[{ value: 'one', label: 'Una cara' }, { value: 'two', label: 'Dos caras' }]}
        />
        <label>
          Cantidad a cobrar
          <input
            disabled={!product}
            type="number"
            min="1"
            value={quantity}
            onChange={event => setQuantity(event.target.value)}
            placeholder="Ingrese la cantidad de trabajo"
          />
          <small className="field-help">Cantidad real de hojas/planchas. El rango solo define el precio unitario.</small>
        </label>
        <label>
          Detalle opcional
          <input disabled={!product} value={description} onChange={event => setDescription(event.target.value)} placeholder="Ej. portada, interior, stickers..." />
        </label>
      </div>

      <div className="selected-item-box">
        {product ? (
          <div>
            <small>Item seleccionado</small>
            <h3>{product.name}</h3>
            <p>{product.section} - {product.format}</p>
            <span>{ranges[safeRangeIndex]} - {side === 'two' ? 'dos caras' : 'una cara'} - {quantity || 0} hojas/planchas</span>
          </div>
        ) : (
          <div>
            <small>Item seleccionado</small>
            <h3>Ningun item seleccionado</h3>
            <p>Elegir una opcion de la lista para calcular.</p>
            <span>Sin precio hasta seleccionar un item.</span>
          </div>
        )}
        <strong>{subtotal == null ? 'Consultar' : money.format(subtotal)}</strong>
      </div>

      <div className="action-row">
        <div>
          <small>Precio unitario</small>
          <strong>{price == null ? 'Consultar' : money.format(price)}</strong>
          <p>{quantity || 0} x {price == null ? 'sin precio' : money.format(price)}</p>
        </div>
        <button className="primary-action" type="button" disabled={!product || price == null} onClick={addLine}>
          <Plus size={18} />
          Agregar bajada
        </button>
      </div>
    </section>
  )
}
