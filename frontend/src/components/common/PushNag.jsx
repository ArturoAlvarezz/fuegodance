import { useState } from 'react'
import { BellRing, Loader2, Share, X } from 'lucide-react'
import { useAuth, useUserApi } from '../../hooks/useAuth'
import { usePush } from '../../hooks/usePush'

const DISMISS_KEY = 'fuego_push_nag_dismissed'

function readDismissed() {
  try { return sessionStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

// Insiste a los alumnos con sesión hasta que activen los avisos: ventana al entrar y barra fija que no se puede cerrar
function PushNagInner() {
  const { userApiFetch } = useUserApi()
  const { status, enable } = usePush(userApiFetch)
  const [dismissed, setDismissed] = useState(readDismissed)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState(null)

  if (!['off', 'needs-install', 'denied'].includes(status)) return null

  const activate = async () => {
    setWorking(true)
    setError(null)
    try {
      await enable()
    } catch (e) {
      setError(e.message)
    } finally {
      setWorking(false)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* sin almacenamiento: solo dura en memoria */ }
  }

  const activateButton = (
    <button type="button" onClick={activate} disabled={working} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-fire-red text-white rounded-xl font-heading tracking-wider hover:bg-fire-orange transition-all disabled:opacity-60 fire-glow">
      {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />} ACTIVAR AVISOS
    </button>
  )

  const help = status === 'needs-install'
    ? <>En iPhone: toca <Share className="w-3.5 h-3.5 inline -mt-0.5" /> Compartir → «Agregar a pantalla de inicio» y abre Fuego Dance desde ese ícono.</>
    : status === 'denied'
      ? 'Bloqueaste las notificaciones. Toca el candado junto a la dirección del sitio → Permisos → Notificaciones → Permitir, y recarga la página.'
      : 'Te avisamos cuando vence tu mensualidad y cuando confirmamos tu pago.'

  return (
    <>
      {status === 'off' && !dismissed && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="push-nag-title">
          <div className="relative w-full max-w-md bg-dark-charcoal rounded-[1.75rem] border border-fire-red/40 p-6 text-center animate-fade-up">
            <button type="button" onClick={dismiss} aria-label="Cerrar" className="absolute top-4 right-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
            <BellRing className="w-12 h-12 text-fire-gold mx-auto mb-4 animate-floaty" />
            <h2 id="push-nag-title" className="font-heading text-4xl tracking-wider mb-2">¡ACTIVA LOS <span className="text-fire-gradient">AVISOS!</span></h2>
            <p className="text-silver text-sm mb-6">Así te avisamos cuando vence tu mensualidad, cuando confirmamos tu pago y las novedades de la academia.</p>
            <div className="flex flex-col gap-3">
              {activateButton}
              <button type="button" onClick={dismiss} className="text-muted text-sm hover:text-silver">Ahora no</button>
            </div>
            {error && <p className="text-fire-red text-xs mt-3">{error}</p>}
          </div>
        </div>
      )}

      {/* Barra fija sin opción de cerrar: desaparece solo al activar los avisos */}
      <div className="h-28 sm:h-20" aria-hidden="true" />
      <div className="fixed bottom-0 inset-x-0 z-50 bg-dark-slate/95 backdrop-blur-xl border-t border-fire-red/50 shadow-[0_-10px_30px_rgba(230,57,70,.25)]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
          <BellRing className="hidden sm:block w-6 h-6 text-fire-gold shrink-0 animate-floaty" />
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-white font-semibold text-sm">Aún no activas los avisos de Fuego Dance</p>
            <p className="text-muted text-xs mt-0.5">{help}</p>
            {error && <p className="text-fire-red text-xs mt-1">{error}</p>}
          </div>
          {status === 'off' && activateButton}
        </div>
      </div>
    </>
  )
}

export default function PushNag() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <PushNagInner /> : null
}
