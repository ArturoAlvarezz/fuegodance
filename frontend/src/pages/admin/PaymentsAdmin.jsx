import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Wallet, ChevronLeft, ChevronRight, Save, Loader2, Banknote, Landmark, FileText, Undo2, Ban, X, MessageCircle, Search, Settings } from 'lucide-react'
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

  const update = async (row, changes) => {
    setBusy(row.user_id)
    setMessage(null)
    try {
      const res = await apiFetch(`/api/admin/payments/${row.user_id}/${data.period}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (res.status === 401) { handleAuthError(); return }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.detail || 'No se pudo guardar')
      await load()
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setBusy(null)
    }
  }

  const reject = (row) => {
    const reason = window.prompt(`¿Por qué rechazas el comprobante de ${row.full_name}? (lo verá el alumno)`, 'No pudimos verificar la transferencia')
    if (reason === null) return
    update(row, { status: 'pending', note: reason })
  }

  const undo = (row) => {
    if (!window.confirm(`¿Volver a dejar pendiente ${monthLabel(data.period)} de ${row.full_name}?`)) return
    update(row, { status: 'pending', note: '' })
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
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-fire-red text-white rounded-lg font-heading tracking-wider hover:bg-fire-orange transition-all disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
            </button>
          </div>
        </form>
      )}

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
              const loading = busy === row.user_id
              const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50'
              return (
                <div key={row.user_id} className="flex flex-col lg:flex-row lg:items-center gap-3 bg-dark-charcoal rounded-xl p-4 border border-dark-ash hover:border-fire-red/20 transition-all">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold">{row.full_name}{!row.is_active && <span className="text-muted text-xs font-normal"> · inactivo</span>}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                      <span className="text-silver text-sm">{formatCLP(row.amount)}</span>
                      {row.status === 'paid' && row.method && <span className="capitalize">· {row.method}</span>}
                      {row.paid_at && <span>· {new Date(row.paid_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>}
                      {row.owed_months.length > 1 && <span className="text-fire-red">· debe {row.owed_months.length} meses</span>}
                    </div>
                    {row.note && <p className="text-muted text-xs mt-1.5">Nota: {row.note}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
                    {row.has_receipt && (
                      <button type="button" onClick={() => openReceipt(row)} className={`${btn} bg-white/5 text-silver hover:text-white`}>
                        <FileText className="w-4 h-4" /> Comprobante
                      </button>
                    )}
                    {row.status === 'review' && (
                      <>
                        <button type="button" disabled={loading} onClick={() => update(row, { status: 'paid', method: 'transferencia' })} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
                          <Landmark className="w-4 h-4" /> Aprobar
                        </button>
                        <button type="button" disabled={loading} onClick={() => reject(row)} className={`${btn} bg-white/5 text-silver hover:text-fire-red`}>
                          <X className="w-4 h-4" /> Rechazar
                        </button>
                      </>
                    )}
                    {row.status === 'pending' && (
                      <>
                        <button type="button" disabled={loading} onClick={() => update(row, { status: 'paid', method: 'efectivo', note: '' })} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
                          <Banknote className="w-4 h-4" /> Efectivo
                        </button>
                        <button type="button" disabled={loading} onClick={() => update(row, { status: 'paid', method: 'transferencia', note: '' })} className={`${btn} bg-green-500/15 text-green-400 hover:bg-green-500/25`}>
                          <Landmark className="w-4 h-4" /> Transferencia
                        </button>
                        <a href={reminderUrl(row)} target="_blank" rel="noopener noreferrer" className={`${btn} bg-white/5 text-silver hover:text-green-400`}>
                          <MessageCircle className="w-4 h-4" /> Recordar
                        </a>
                        <button type="button" disabled={loading} onClick={() => update(row, { status: 'waived' })} title="Por ejemplo, vacaciones o beca" className={`${btn} bg-white/5 text-silver hover:text-white`}>
                          <Ban className="w-4 h-4" /> No corresponde
                        </button>
                      </>
                    )}
                    {(row.status === 'paid' || row.status === 'waived') && (
                      <button type="button" disabled={loading} onClick={() => undo(row)} className={`${btn} bg-white/5 text-silver hover:text-fire-orange`}>
                        <Undo2 className="w-4 h-4" /> Deshacer
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
