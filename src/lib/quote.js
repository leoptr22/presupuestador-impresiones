export const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function clampQuantity(value) {
  return Math.max(Number(value) || 0, 0)
}

export function getLaserPrice(product, profile, rangeIndex, side) {
  const price = product.prices[profile]?.[rangeIndex]
  if (!price) return null
  return side === 'two' ? price.two : price.one
}

export function makeLaserLine({ product, profile, rangeIndex, side, quantity, description }) {
  const qty = clampQuantity(quantity)
  const unitPrice = getLaserPrice(product, profile, rangeIndex, side)
  const rangeLabel = product.rangesByProfile[profile][rangeIndex]
  return {
    id: crypto.randomUUID(),
    type: 'laser',
    title: product.name,
    detail: `${product.format} - ${rangeLabel} - ${side === 'two' ? 'dos caras' : 'una cara'}${description ? ` - ${description}` : ''}`,
    quantity: qty,
    unit: 'hoja',
    unitPrice,
    total: unitPrice == null ? 0 : Math.round(unitPrice * qty),
  }
}

export function getFinishingPrice(group, item, profile, tierIndex) {
  if (group.mode === 'profile') return item.prices[profile] ?? null
  if (group.mode === 'fixed') return item.prices[0] ?? null
  return item.prices[tierIndex] ?? null
}

export function makeFinishingLine({ group, item, profile, tierIndex, quantity }) {
  const qty = clampQuantity(quantity)
  const unitPrice = getFinishingPrice(group, item, profile, tierIndex)
  const tierLabel = group.mode === 'profile' ? profilesLabel(profile) : group.mode === 'fixed' ? 'precio fijo' : group.tiers[tierIndex]
  return {
    id: crypto.randomUUID(),
    type: 'terminacion',
    title: item.name,
    detail: `${group.title} - ${tierLabel}`,
    quantity: qty,
    unit: group.unit,
    unitPrice,
    total: unitPrice == null ? 0 : Math.round(unitPrice * qty),
  }
}

export function profilesLabel(profile) {
  if (profile === 'imprenta') return 'Imprenta'
  if (profile === 'disenadores') return 'Disenadores'
  return 'Publico'
}

export function quoteTotal(lines) {
  return lines.reduce((sum, line) => sum + line.total, 0)
}

export function buildWhatsAppQuote({ profileLabel, profile, customer, lines }) {
  const total = quoteTotal(lines)
  const date = new Intl.DateTimeFormat('es-AR').format(new Date())
  const header = [
    'Presupuesto Rojas Impresiones',
    `Fecha: ${date}`,
    `Lista: ${profileLabel}${profile === 'imprenta' ? ' - ' : ''}`,
  ]
  const customerLines = [
    customer.name?.trim() ? `Cliente: ${customer.name.trim()}` : null,
    customer.contact?.trim() ? `Contacto: ${customer.contact.trim()}` : null,
  ].filter(Boolean)
  const itemLines = lines.map((line, index) => [
    `${index + 1}. ${line.title}`,
    `   ${line.detail}`,
    `   ${line.quantity} ${line.unit} x ${money.format(line.unitPrice)} = ${money.format(line.total)}`,
  ].join('\n'))
  const footer = [
    `Total: ${money.format(total)}${profile === 'imprenta' ? ' + IVA' : ''}`,
    'Valor estimativo sujeto a confirmacion y valido por 7 dias.',
  ]
  return [
    ...header,
    customerLines.length ? '\n' + customerLines.join('\n') : null,
    '\nDetalle:',
    itemLines.join('\n'),
    '\n' + footer.join('\n'),
  ].filter(Boolean).join('\n')
}
