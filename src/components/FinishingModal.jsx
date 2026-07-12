import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { finishingGroups } from '../data/pricing.js'
import { getFinishingPrice, makeFinishingLine, money } from '../lib/quote.js'
import { Modal } from './Modal.jsx'

function groupByMode(items) {
  return items.reduce((groups, item) => {
    const key = item.mode === 'profile' ? 'Por perfil' : item.mode === 'fixed' ? 'Precio fijo' : 'Por rango'
    groups[key] ??= []
    groups[key].push(item)
    return groups
  }, {})
}

export function FinishingModal({ profile, onAdd, onClose }) {
  const [groupId, setGroupId] = useState(finishingGroups[0].id)
  const [itemId, setItemId] = useState(finishingGroups[0].items[0].id)
  const [tierIndex, setTierIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const group = finishingGroups.find(item => item.id === groupId) ?? finishingGroups[0]
  const item = group.items.find(option => option.id === itemId) ?? group.items[0]
  const price = getFinishingPrice(group, item, profile, tierIndex)

  const groupsByMode = useMemo(() => groupByMode(finishingGroups), [])

  function selectGroup(nextId) {
    const next = finishingGroups.find(item => item.id === nextId)
    setGroupId(nextId)
    setItemId(next.items[0].id)
    setTierIndex(0)
  }

  function addLine() {
    if (price == null) return
    onAdd(makeFinishingLine({ group, item, profile, tierIndex, quantity }))
  }

  return (
    <Modal title="Encuadernacion y terminaciones" eyebrow="Modulo independiente" onClose={onClose}>
      <div className="modal-layout">
        <aside className="modal-nav">
          {Object.entries(groupsByMode).map(([title, groups]) => (
            <div key={title}>
              <h3>{title}</h3>
              {groups.map(option => (
                <button key={option.id} type="button" className={group.id === option.id ? 'active' : ''} onClick={() => selectGroup(option.id)}>
                  {option.title}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="modal-body">
          <div className="item-grid">
            {group.items.map(option => (
              <button key={option.id} type="button" className={item.id === option.id ? 'finish-card active' : 'finish-card'} onClick={() => setItemId(option.id)}>
                <b>{option.name}</b>
                <span>{group.unit}</span>
              </button>
            ))}
          </div>

          {group.mode === 'tiered' && (
            <label className="full-field">
              Rango
              <select value={tierIndex} onChange={event => setTierIndex(Number(event.target.value))}>
                {group.tiers.map((tier, index) => <option key={tier} value={index}>{tier}</option>)}
              </select>
            </label>
          )}

          <div className="config-grid two">
            <label>
              Cantidad a cobrar
              <input type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} />
              <small className="field-help">Cantidad real de unidades, hojas o servicios de esta terminacion.</small>
            </label>
            <div className="price-box">
              <small>Unitario</small>
              <strong>{price == null ? 'Consultar' : money.format(price)}</strong>
            </div>
          </div>

          <button className="primary-action modal-add" type="button" onClick={addLine} disabled={price == null}>
            <Plus size={18} />
            Agregar terminacion
          </button>
        </div>
      </div>
    </Modal>
  )
}
