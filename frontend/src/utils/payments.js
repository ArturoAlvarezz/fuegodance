export const formatCLP = (amount) => `$${Number(amount || 0).toLocaleString('es-CL')}`

export function monthLabel(period) {
  const [year, month] = period.split('-').map(Number)
  const label = new Date(year, month - 1, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function nextPeriod(period) {
  const [year, month] = period.split('-').map(Number)
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`
}

export function previousPeriod(period) {
  const [year, month] = period.split('-').map(Number)
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`
}

export function paymentBadge({ status, overdue }) {
  if (status === 'paid') return { label: 'Pagado', className: 'bg-green-500/15 text-green-400' }
  if (status === 'review') return { label: 'En revisión', className: 'bg-fire-gold/15 text-fire-gold' }
  if (status === 'waived') return { label: 'No corresponde', className: 'bg-white/10 text-muted' }
  if (overdue) return { label: 'Atrasado', className: 'bg-fire-red/20 text-fire-red' }
  return { label: 'Pendiente', className: 'bg-white/10 text-silver' }
}
