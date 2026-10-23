import { useState, useEffect, useCallback, useRef } from 'react'

const supported = typeof window !== 'undefined'
  && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
// En iPhone las notificaciones web solo funcionan con la app agregada a la pantalla de inicio
const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = typeof window !== 'undefined'
  && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

async function postJSON(fetchFn, url, body) {
  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'No se pudo completar la acción')
  }
  return res.json()
}

// status: loading | unsupported | needs-install | denied | off | on
export function usePush(fetchFn) {
  const [status, setStatus] = useState('loading')
  // Se lee desde una ref para que el efecto inicial no se repita cuando cambia la función
  const fetchRef = useRef(fetchFn)
  fetchRef.current = fetchFn
  const apiFetch = useCallback((...args) => fetchRef.current(...args), [])

  useEffect(() => {
    if (!supported) {
      setStatus(isIOS && !isStandalone ? 'needs-install' : 'unsupported')
      return
    }
    if (Notification.permission === 'denied') { setStatus('denied'); return }
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then(async (sub) => {
        if (!sub) { setStatus('off'); return }
        // Vuelve a asociar el dispositivo a la cuenta con la que se entró ahora
        await postJSON(apiFetch, '/api/push/subscribe', sub.toJSON()).catch(() => {})
        setStatus('on')
      })
      .catch(() => setStatus('unsupported'))
  }, [apiFetch])

  const enable = useCallback(async () => {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'denied' : 'off')
      throw new Error('No diste permiso para mostrar notificaciones')
    }
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const res = await fetch('/api/push/public-key')
    const { public_key: key } = await res.json()
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })
    await postJSON(apiFetch, '/api/push/subscribe', sub.toJSON())
    setStatus('on')
  }, [apiFetch])

  const disable = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await postJSON(apiFetch, '/api/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {})
      await sub.unsubscribe()
    }
    setStatus('off')
  }, [apiFetch])

  const test = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration('/sw.js')
    const sub = await reg?.pushManager.getSubscription()
    if (!sub) throw new Error('Este dispositivo no tiene los avisos activados')
    await postJSON(apiFetch, '/api/push/test', { endpoint: sub.endpoint })
  }, [apiFetch])

  return { status, enable, disable, test }
}
