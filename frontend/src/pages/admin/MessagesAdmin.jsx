import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useAuth'
import { Mail, Clock, User, AtSign } from 'lucide-react'

export default function MessagesAdmin() {
  const { apiFetch } = useApi()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/admin/contact/')
        setMessages(await res.json())
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">MENSAJES</span></h1>
        <p className="text-muted text-sm mt-1">Mensajes recibidos desde el formulario de contacto</p>
      </div>

      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="bg-dark-charcoal rounded-xl p-12 border border-dark-ash text-center text-muted">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              No hay mensajes aún
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="bg-dark-charcoal rounded-xl p-6 border border-dark-ash hover:border-fire-red/20 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-fire-red/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-fire-red" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{msg.name}</p>
                    <p className="text-silver text-sm flex items-center gap-1"><AtSign className="w-3 h-3" />{msg.email}</p>
                  </div>
                </div>
                <span className="text-muted text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(msg.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-silver leading-relaxed pl-13">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
