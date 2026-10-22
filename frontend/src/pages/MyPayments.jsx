import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Wallet, Upload, Copy, Check, Loader2, CalendarClock } from 'lucide-react'
import { useAuth, useUserApi } from '../hooks/useAuth'
import { formatCLP, monthLabel, nextPeriod, paymentBadge } from '../utils/payments'

export default function MyPayments() {
  const { userApiFetch } = useUserApi()
  const { logoutUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(null)
  const [message, setMessage] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef(null)
  const targetPeriod = useRef(null)

  const handleAuthError = () => {
    logoutUser()
    navigate('/login', { state: { from: '/mis-pagos' } })
  }

  const load = async () => {
    try {
      const res = await userApiFetch('/api/payments/me')
      if (res.status === 401) { handleAuthError(); return }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.detail || 'No se pudieron cargar tus pagos')
      setData(body)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  const pickFile = (period) => {
    targetPeriod.current = period
    fileRef.current.value = ''
    fileRef.current.click()
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    const period = targetPeriod.current
    if (!file || !period) return
    setUploading(period)
    setMessage(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await userApiFetch(`/api/payments/me/${period}/receipt`, { method: 'POST', body: form })
      if (res.status === 401) { handleAuthError(); return }
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.detail || 'No se pudo subir el comprobante')
      setMessage({ ok: true, text: `Recibimos tu comprobante de ${monthLabel(period)}. Te avisaremos cuando quede confirmado.` })
      load()
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setUploading(null)
    }
  }

  const copyTransferInfo = async () => {
    try {
      await navigator.clipboard.writeText(data.transfer_info)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* el portapapeles puede no estar disponible */ }
  }

  const advance = data && nextPeriod(data.current_period)
  const months = data ? data.months : []
  const canAdvance = data && !months.some((m) => m.period === advance)
  const inReview = months.some((m) => m.status === 'review')

  return (
    <>
    <Helmet>
      <title>Mis pagos | Fuego Dance</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <section className="relative pt-28 pb-24 px-4 bg-dark-obsidian min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(230,57,70,.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(247,127,0,.12),transparent_34%)]" />
      <div className="absolute inset-0 fuego-grid opacity-20" />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wallet className="w-7 h-7 text-fire-gold animate-floaty" />
            <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Mensualidad</span>
          </div>
          <h2 className="font-heading text-6xl sm:text-8xl tracking-wider leading-none">
            MIS <span className="text-fire-gradient">PAGOS</span>
          </h2>
        </div>

        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />

        {error && <p className="text-center text-fire-red">{error}</p>}
        {!data && !error && <p className="text-center text-muted">Cargando...</p>}

        {data && (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-[1.5rem] border p-5 ${data.owed > 0 ? 'bg-fire-red/10 border-fire-red/40' : inReview ? 'bg-fire-gold/10 border-fire-gold/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <p className="text-xs uppercase tracking-wider text-muted mb-1">{data.owed > 0 ? 'Por pagar' : 'Estado'}</p>
                <p className={`font-heading text-4xl tracking-wider ${data.owed > 0 || inReview ? 'text-fire-gold' : 'text-green-400'}`}>
                  {data.owed > 0 ? formatCLP(data.owed) : inReview ? 'EN REVISIÓN' : '¡AL DÍA!'}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-dark-charcoal/90 p-5">
                <p className="text-xs uppercase tracking-wider text-muted mb-1">Mensualidad</p>
                <p className="font-heading text-4xl tracking-wider text-white">{formatCLP(data.monthly_fee)}</p>
                <p className="text-muted text-xs mt-1 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Vence el día {data.due_day} de cada mes</p>
              </div>
            </div>

            {data.transfer_info && (
              <div className="rounded-[1.5rem] border border-white/10 bg-dark-charcoal/90 p-5 mb-6">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs uppercase tracking-wider text-muted">Datos para transferir</p>
                  <button type="button" onClick={copyTransferInfo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-silver hover:text-fire-orange transition-all">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-white text-sm whitespace-pre-line">{data.transfer_info}</p>
                <p className="text-muted text-xs mt-3">Después de transferir, sube el comprobante en el mes que corresponde.</p>
              </div>
            )}

            {message && (
              <p className={`mb-4 text-sm text-center ${message.ok ? 'text-green-400' : 'text-fire-red'}`}>{message.text}</p>
            )}

            <ul className="space-y-3">
              {canAdvance && (
                <li className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-white/15 bg-dark-charcoal/50">
                  <div>
                    <p className="text-white font-semibold">{monthLabel(advance)}</p>
                    <p className="text-muted text-xs">¿Quieres pagar por adelantado?</p>
                  </div>
                  <button type="button" onClick={() => pickFile(advance)} disabled={uploading === advance} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-silver hover:text-fire-orange transition-all disabled:opacity-60">
                    {uploading === advance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Subir comprobante
                  </button>
                </li>
              )}
              {months.map((m) => {
                const badge = paymentBadge(m)
                const canUpload = m.status === 'pending' || m.status === 'review'
                return (
                  <li key={m.period} className="p-4 rounded-2xl border border-white/10 bg-dark-charcoal/80">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white font-semibold">{monthLabel(m.period)}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                          <span className="text-silver text-sm">{formatCLP(m.amount)}</span>
                          {m.status === 'paid' && m.method && <span className="text-muted text-xs capitalize">· {m.method}</span>}
                        </div>
                      </div>
                      {canUpload && (
                        <button type="button" onClick={() => pickFile(m.period)} disabled={uploading === m.period} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${m.status === 'pending' ? 'bg-fire-red text-white hover:bg-fire-orange' : 'bg-white/5 text-silver hover:text-fire-orange'}`}>
                          {uploading === m.period ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {m.status === 'pending' ? 'Subir comprobante' : 'Cambiar comprobante'}
                        </button>
                      )}
                    </div>
                    {m.note && <p className="text-muted text-xs mt-2">Nota: {m.note}</p>}
                  </li>
                )
              })}
            </ul>

            <p className="text-muted text-xs text-center mt-8">¿Pagaste en efectivo? Lo registramos en la academia y aparecerá aquí como pagado.</p>
          </>
        )}
      </div>
    </section>
    </>
  )
}
