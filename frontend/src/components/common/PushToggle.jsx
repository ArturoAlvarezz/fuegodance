import { useState } from 'react'
import { Bell, BellOff, BellRing, Loader2, Share } from 'lucide-react'
import { usePush } from '../../hooks/usePush'

export default function PushToggle({ fetchFn, description, className = '' }) {
  const { status, enable, disable, test } = usePush(fetchFn)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState(null)

  const run = async (action, okText) => {
    setWorking(true)
    setMessage(null)
    try {
      await action()
      if (okText) setMessage({ ok: true, text: okText })
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    } finally {
      setWorking(false)
    }
  }

  if (status === 'loading' || status === 'unsupported') return null

  const btn = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60'

  return (
    <div className={`rounded-[1.5rem] border border-white/10 bg-dark-charcoal/90 p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {status === 'on' ? <BellRing className="w-5 h-5 text-fire-gold shrink-0 mt-0.5" /> : <Bell className="w-5 h-5 text-silver shrink-0 mt-0.5" />}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm">{status === 'on' ? 'Avisos activados en este dispositivo' : 'Avisos en tu celular'}</p>
            <p className="text-muted text-xs mt-0.5">{description}</p>
          </div>
        </div>
        {status === 'off' && (
          <button type="button" disabled={working} onClick={() => run(enable, 'Listo, te llegarán los avisos en este dispositivo')} className={`${btn} bg-fire-red text-white hover:bg-fire-orange`}>
            {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Activar avisos
          </button>
        )}
        {status === 'on' && (
          <div className="flex gap-2">
            <button type="button" disabled={working} onClick={() => run(test, 'Enviamos una notificación de prueba')} className={`${btn} bg-white/5 text-silver hover:text-fire-orange`}>
              {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />} Probar
            </button>
            <button type="button" disabled={working} onClick={() => run(disable)} className={`${btn} bg-white/5 text-silver hover:text-fire-red`}>
              <BellOff className="w-4 h-4" /> Desactivar
            </button>
          </div>
        )}
      </div>
      {status === 'needs-install' && (
        <p className="text-silver text-xs mt-3 flex items-center gap-1.5 flex-wrap">
          En iPhone, primero toca <Share className="w-3.5 h-3.5 inline" /> Compartir → «Agregar a pantalla de inicio», abre Fuego Dance desde ese ícono y vuelve aquí.
        </p>
      )}
      {status === 'denied' && (
        <p className="text-silver text-xs mt-3">Bloqueaste las notificaciones de este sitio. Puedes volver a permitirlas en los ajustes del navegador.</p>
      )}
      {message && <p className={`text-xs mt-3 ${message.ok ? 'text-green-400' : 'text-fire-red'}`}>{message.text}</p>}
    </div>
  )
}
