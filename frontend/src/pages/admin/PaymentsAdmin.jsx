import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Wallet, ChevronLeft, ChevronRight, Save, Loader2, Banknote, Landmark, FileText, Undo2, Ban, X, MessageCircle, Search, Settings, Download, History } from 'lucide-react'
import PushToggle from '../../components/common/PushToggle'
import { formatCLP, monthLabel, nextPeriod, previousPeriod, paymentBadge } from '../../utils/payments'

const tabs = [
  { id: 'all', label: 'Todos' },
  { id: 'review', label: 'En revisión' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagados' },
]

export default function PaymentsAdmin() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState(null)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [settings, setSettings] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState(null)
  const [history, setHistory] = useState(null)
  const [exporting, setExporting] = useState(null)

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  const load = async () => {
    try {
      const query = period ? `?period=${period}` : ''
      const res = await apiFetch(`/api/admin/payments/${query}`)
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const body = await res.json()
      setData(body)
      if (!period) setPeriod(body.period)
      setSettings((current) => current || body.settings)
    } catch (e) {
      setMessage({ ok: false, text: 'No se pudieron cargar las mensualidades' })
      console.error(e)
    }
  }

  useEffect(() => { load() }, [period])

  const saveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await apiFetch('/api/admin/payments/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, monthly_fee: Number(settings.monthly_fee), due_day: Number(settings.due_day) }),
      })
      if (res.status === 401) { handleAuthError(); return }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.detail || 'No se pudo guardar')
      setSettings(body)
      setMessage({ ok: true, text: `Configuración guardada: la mensualidad es de ${formatCLP(body.monthly_fee)}` })
      load()
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const loadHistory = async (userId) => {
    const res = await apiFetch(`/api/admin/payments/user/${userId}`)
    if (res.status === 401) { handleAuthError(); return }
    if (res.ok) setHistory(await res.json())
  }

  const update = async (row, changes, period = data.period) => {
    setBusy(`${row.user_id}-${period}`)
    setMessage(null)
    try {
      const res = await apiFetch(`/api/admin/payments/${row.user_id}/${period}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (res.status === 401) { handleAuthError(); return }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.detail || 'No se pudo guardar')
      await load()
      if (history?.user.id === row.user_id) await loadHistory(row.user_id)
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setBusy(null)
    }
  }

  const reject = (row, period = data.period) => {
    const reason = window.prompt(`¿Por qué rechazas el comprobante de ${row.full_name}? (lo verá el alumno)`, 'No pudimos verificar la transferencia')
    if (reason === null) return
    update(row, { status: 'pending', note: reason }, period)
  }

  const undo = (row, period = data.period) => {
    if (!window.confirm(`¿Volver a dejar pendiente ${monthLabel(period)} de ${row.full_name}?`)) return
    update(row, { status: 'pending', note: '' }, period)
  }

  const exportCsv = async (query, key) => {
    setExporting(key)
    setMessage(null)
    try {
      const res = await apiFetch(`/api/admin/payments/export?${query}`)
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error('No se pudo exportar')
      const name = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'mensualidades.csv'
      const url = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setExporting(null)
    }
  }

  const openReceipt = async (row) => {
    // Se abre la pestaña antes del fetch para que el navegador del móvil no la bloquee
    const win = window.open('', '_blank')
    try {
      const res = await apiFetch(`/api/admin/payments/${row.payment_id}/receipt`)
      if (res.status === 401) { win?.close(); handleAuthError(); return }
      if (!res.ok) throw new Error('No se encontró el comprobante')
      const url = URL.createObjectURL(await res.blob())
      if (win) win.location = url
      else window.location = url
    } catch (err) {
      win?.close()
      setMessage({ ok: false, text: err.message })
    }
  }

  const reminderUrl = (row) => {
    const months = row.owed_months.length > 1
      ? `${row.owed_months.length} mensualidades (${row.owed_months.map(monthLabel).join(', ')})`
      : `la mensualidad de ${monthLabel(row.owed_months[0] || data.period)}`
    const text = `Hola ${row.full_name.split(' ')[0]}! 🔥 Te recordamos que tienes pendiente ${months} de Fuego Dance. Puedes ver los datos de pago y subir tu comprobante en https://fuegodance.cl/mis-pagos`
    return `https://wa.me/56${row.phone}?text=${encodeURIComponent(text)}`
  }

  const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50'

  // Acciones de un mes de un alumno; se usan en la lista mensual y en su historial
  const renderActions = (user, m, period) => {
    const loading = busy === `${user.user_id}-${period}`
    return (
      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
        {m.has_receipt && (
          <button type="button" onClick={() => openReceipt(m)} className={`${btn} bg-white/5 text-silver hover:text-white`}>
            <FileText className="w-4 h-4" /> Comprobante
          </button>
        )}
        {m.status === 'review' && (
          <>
            <button type="button" disabled={loading} onClick={() => update(user, { status: 'paid', method: 'transferencia' }, period)} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
              <Landmark className="w-4 h-4" /> Aprobar
            </button>
            <button type="button" disabled={loading} onClick={() => reject(user, period)} className={`${btn} bg-white/5 text-silver hover:text-fire-red`}>
              <X className="w-4 h-4" /> Rechazar
            </button>
          </>
        )}
        {m.status === 'pending' && (
          <>
            <button type="button" disabled={loading} onClick={() => update(user, { status: 'paid', method: 'efectivo', note: '' }, period)} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
              <Banknote className="w-4 h-4" /> Efectivo
            </button>
            <button type="button" disabled={loading} onClick={() => update(user, { status: 'paid', method: 'transferencia', note: '' }, period)} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
              <Landmark className="w-4 h-4" /> Transferencia
            </button>
            {user.owed_months && (
              <a href={reminderUrl(user)} target="_blank" rel="noopener noreferrer" className={`${btn} bg-white/5 text-silver hover:text-green-400`}>
                <MessageCircle className="w-4 h-4" /> Recordar
              </a>
            )}
            <button type="button" disabled={loading} onClick={() => update(user, { status: 'waived' }, period)} title="Por ejemplo, vacaciones o beca" className={`${btn} bg-white/5 text-silver hover:text-white`}>
              <Ban className="w-4 h-4" /> No corresponde
            </button>
          </>
        )}
        {(m.status === 'paid' || m.status === 'waived') && (
          <button type="button" disabled={loading} onClick={() => undo(user, period)} className={`${btn} bg-white/5 text-silver hover:text-fire-orange`}>
            <Undo2 className="w-4 h-4" /> Deshacer
          </button>
        )}
      </div>
    )
  }

  const rows = (data?.rows || []).filter((r) => {
    if (tab !== 'all' && r.status !== tab) return false
    return !search || r.full_name.toLowerCase().includes(search.toLowerCase())
  })
  const summary = data?.summary

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">MENSUALIDADES</span></h1>
          <p className="text-muted text-sm mt-1">Los alumnos suben su comprobante desde «Mis pagos». Aprueba las transferencias y registra aquí los pagos en efectivo.</p>
        </div>
        <button type="button" onClick={() => setShowSettings(!showSettings)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${showSettings ? 'bg-fire-red/20 text-fire-gold ring-1 ring-fire-red/40' : 'bg-dark-charcoal text-silver hover:text-fire-orange'}`}>
          <Settings className="w-4 h-4" /> Configuración{settings && ` · ${formatCLP(settings.monthly_fee)}`}
        </button>
      </div>

      {showSettings && settings && (
        <form onSubmit={saveSettings} className="bg-dark-charcoal rounded-xl p-4 border border-dark-ash mb-4 grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-silver mb-1" htmlFor="fee">Mensualidad (CLP)</label>
            <input id="fee" type="number" min="1000" max="1000000" step="500" required value={settings.monthly_fee} onChange={(e) => setSettings({ ...settings, monthly_fee: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white focus:outline-none focus:border-fire-orange/60" />
          </div>
          <div>
            <label className="block text-sm text-silver mb-1" htmlFor="due">Vence el día</label>
            <input id="due" type="number" min="1" max="28" required value={settings.due_day} onChange={(e) => setSettings({ ...settings, due_day: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white focus:outline-none focus:border-fire-orange/60" />
          </div>
          <div>
            <label className="block text-sm text-silver mb-1" htmlFor="start">Cobrar desde</label>
            <input id="start" type="month" required value={settings.billing_start} onChange={(e) => setSettings({ ...settings, billing_start: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white focus:outline-none focus:border-fire-orange/60 [color-scheme:dark]" />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm text-silver mb-1" htmlFor="transfer">Datos para transferir (los ven los alumnos)</label>
            <textarea id="transfer" rows={4} maxLength={1000} value={settings.transfer_info} onChange={(e) => setSettings({ ...settings, transfer_info: e.target.value })} placeholder={'Nombre\nRUT\nBanco y tipo de cuenta\nNúmero de cuenta\nCorreo'} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white placeholder:text-muted focus:outline-none focus:border-fire-orange/60" />
            <p className="text-muted text-xs mt-1">Al cambiar la mensualidad, los meses pendientes se cobran al nuevo valor. Los pagos ya registrados conservan su monto.</p>
          </div>
          <label className="sm:col-span-3 flex items-start gap-3 text-sm text-silver cursor-pointer">
            <input type="checkbox" checked={settings.reminders_enabled} onChange={(e) => setSettings({ ...settings, reminders_enabled: e.target.checked })} className="mt-0.5 w-4 h-4 accent-fire-red" />
            <span>Enviar recordatorios automáticos a los alumnos con avisos activados: 3 días antes del vencimiento, el día que vence y 3 días después si sigue pendiente.</span>
          </label>
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-fire-red text-white rounded-lg font-heading tracking-wider hover:bg-fire-orange transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
            </button>
          </div>
        </form>
      )}

      <PushToggle
        fetchFn={apiFetch}
        description="Te avisamos en este dispositivo cuando un alumno sube un comprobante."
        className="mb-4 !rounded-xl !bg-dark-charcoal border-dark-ash"
      />

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-green-400' : 'text-fire-red'}`}>{message.text}</p>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between gap-3 bg-dark-charcoal rounded-xl p-2 border border-dark-ash mb-4">
            <button type="button" onClick={() => setPeriod(previousPeriod(data.period))} aria-label="Mes anterior" className="p-2 rounded-lg text-silver hover:text-fire-orange"><ChevronLeft className="w-5 h-5" /></button>
            <div className="text-center">
              <p className="font-heading text-2xl tracking-wider">{monthLabel(data.period).toUpperCase()}</p>
              {data.period !== data.current_period && (
                <button type="button" onClick={() => setPeriod(data.current_period)} className="text-xs text-fire-orange hover:underline">Volver al mes actual</button>
              )}
            </div>
            <button type="button" onClick={() => setPeriod(nextPeriod(data.period))} aria-label="Mes siguiente" className="p-2 rounded-lg text-silver hover:text-fire-orange"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="flex flex-wrap justify-end gap-2 mb-4">
            <button type="button" disabled={!!exporting} onClick={() => exportCsv(`period=${data.period}`, 'month')} className={`${btn} bg-dark-charcoal text-silver hover:text-fire-orange`}>
              {exporting === 'month' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exportar {monthLabel(data.period).toLowerCase()}
            </button>
            <button type="button" disabled={!!exporting} onClick={() => exportCsv(`year=${data.period.slice(0, 4)}`, 'year')} className={`${btn} bg-dark-charcoal text-silver hover:text-fire-orange`}>
              {exporting === 'year' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exportar año {data.period.slice(0, 4)}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-dark-charcoal rounded-xl p-4 border border-dark-ash">
              <p className="text-muted text-xs uppercase tracking-wider">Recaudado</p>
              <p className="font-heading text-2xl tracking-wider text-green-400">{formatCLP(summary.collected)}</p>
              <p className="text-muted text-xs">de {formatCLP(summary.expected)}</p>
            </div>
            <div className="bg-dark-charcoal rounded-xl p-4 border border-dark-ash">
              <p className="text-muted text-xs uppercase tracking-wider">Pagados</p>
              <p className="font-heading text-2xl tracking-wider">{summary.paid} <span className="text-muted text-base">/ {data.rows.length - summary.waived}</span></p>
            </div>
            <div className="bg-dark-charcoal rounded-xl p-4 border border-dark-ash">
              <p className="text-muted text-xs uppercase tracking-wider">En revisión</p>
              <p className="font-heading text-2xl tracking-wider text-fire-gold">{summary.review}</p>
            </div>
            <div className="bg-dark-charcoal rounded-xl p-4 border border-dark-ash">
              <p className="text-muted text-xs uppercase tracking-wider">Atrasados</p>
              <p className="font-heading text-2xl tracking-wider text-fire-red">{summary.overdue}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => {
                const count = t.id === 'all' ? data.rows.length : summary[t.id]
                return (
                  <button type="button" key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-fire-red/20 text-fire-gold ring-1 ring-fire-red/40' : 'bg-dark-charcoal text-silver hover:text-fire-orange'}`}>
                    {t.label}
                    <span className={`min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs ${t.id === 'review' && count > 0 ? 'bg-fire-red text-white' : 'bg-white/10'}`}>{count}</span>
                  </button>
                )
              })}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alumno" className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-lg bg-dark-charcoal border border-dark-ash text-white text-sm placeholder:text-muted focus:outline-none focus:border-fire-orange/60" />
            </div>
          </div>

          <div className="space-y-3">
            {rows.length === 0 && (
              <div className="bg-dark-charcoal rounded-xl p-12 border border-dark-ash text-center text-muted">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                {data.rows.length === 0 ? 'No hay alumnos con mensualidad este mes' : 'No hay alumnos aquí'}
              </div>
            )}
            {rows.map((row) => {
              const badge = paymentBadge(row)
              return (
                <div key={row.user_id} className="flex flex-col lg:flex-row lg:items-center gap-3 bg-dark-charcoal rounded-xl p-4 border border-dark-ash hover:border-fire-red/20 transition-all">
                  <div className="min-w-0 flex-1">
                    <button type="button" onClick={() => loadHistory(row.user_id)} className="group inline-flex items-center gap-1.5 text-left text-white font-semibold hover:text-fire-orange transition-colors">
                      {row.full_name}
                      <History className="w-3.5 h-3.5 text-muted group-hover:text-fire-orange" />
                      {!row.is_active && <span className="text-muted text-xs font-normal"> · inactivo</span>}
                    </button>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                      <span className="text-silver text-sm">{formatCLP(row.amount)}</span>
                      {row.status === 'paid' && row.method && <span className="capitalize">· {row.method}</span>}
                      {row.paid_at && <span>· {new Date(row.paid_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>}
                      {row.owed_months.length > 1 && <span className="text-fire-red">· debe {row.owed_months.length} meses</span>}
                    </div>
                    {row.note && <p className="text-muted text-xs mt-1.5">Nota: {row.note}</p>}
                  </div>
                  {renderActions(row, row, data.period)}
                </div>
              )
            })}
          </div>
        </>
      )}

      {history && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setHistory(null)} role="presentation">
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="history-title" className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-dark-charcoal rounded-t-2xl sm:rounded-2xl border border-dark-ash">
            <div className="p-5 border-b border-dark-ash">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 id="history-title" className="font-heading text-3xl tracking-wider truncate">{history.user.full_name.toUpperCase()}</h2>
                  <p className="text-muted text-xs">+56 {history.user.phone}{!history.user.is_active && ' · inactivo'}</p>
                </div>
                <button type="button" onClick={() => setHistory(null)} aria-label="Cerrar" className="text-silver hover:text-white shrink-0"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-dark-obsidian rounded-xl p-3">
                  <p className="text-muted text-xs uppercase tracking-wider">Ha pagado</p>
                  <p className="font-heading text-2xl tracking-wider text-green-400">{formatCLP(history.paid_total)}</p>
                </div>
                <div className="bg-dark-obsidian rounded-xl p-3">
                  <p className="text-muted text-xs uppercase tracking-wider">Debe</p>
                  <p className={`font-heading text-2xl tracking-wider ${history.owed > 0 ? 'text-fire-red' : 'text-silver'}`}>{formatCLP(history.owed)}</p>
                </div>
              </div>
            </div>
            <ul className="overflow-y-auto p-5 space-y-3">
              {history.months.length === 0 && <li className="text-muted text-sm text-center py-6">Todavía no tiene meses de cobro</li>}
              {history.months.map((m) => {
                const badge = paymentBadge(m)
                return (
                  <li key={m.period} className="flex flex-col gap-2 bg-dark-obsidian rounded-xl p-3 border border-dark-ash">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="text-white font-semibold text-sm">{monthLabel(m.period)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                      <span className="text-silver text-sm">{formatCLP(m.amount)}</span>
                      {m.status === 'paid' && m.method && <span className="capitalize">· {m.method}</span>}
                      {m.paid_at && <span>· {new Date(m.paid_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    {m.note && <p className="text-muted text-xs">Nota: {m.note}</p>}
                    {renderActions({ user_id: history.user.id, full_name: history.user.full_name }, m, m.period)}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
