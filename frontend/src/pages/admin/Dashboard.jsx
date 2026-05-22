import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Music, Camera, Video, Mail } from 'lucide-react'

export default function Dashboard() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ figures: 0, photos: 0, videos: 0, messages: 0 })
  const [loading, setLoading] = useState(true)

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  useEffect(() => {
    async function load() {
      try {
        const [figRes, galRes, vidRes, msgRes] = await Promise.all([
          apiFetch('/api/admin/figures/'),
          apiFetch('/api/admin/gallery/'),
          apiFetch('/api/admin/videos/'),
          apiFetch('/api/admin/contact/'),
        ])
        for (const res of [figRes, galRes, vidRes, msgRes]) {
          if (!res.ok) {
            if (res.status === 401) { handleAuthError(); return }
            throw new Error(`Error ${res.status}`)
          }
        }
        const [figures, photos, videos, messages] = await Promise.all([
          figRes.json(), galRes.json(), vidRes.json(), msgRes.json(),
        ])
        setStats({
          figures: Array.isArray(figures) ? figures.length : 0,
          photos: Array.isArray(photos) ? photos.length : 0,
          videos: Array.isArray(videos) ? videos.length : 0,
          messages: Array.isArray(messages) ? messages.length : 0,
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Figuras', count: stats.figures, icon: Music, color: 'text-fire-red', bg: 'bg-fire-red/10', border: 'border-fire-red/30' },
    { label: 'Fotos', count: stats.photos, icon: Camera, color: 'text-fire-orange', bg: 'bg-fire-orange/10', border: 'border-fire-orange/30' },
    { label: 'Videos', count: stats.videos, icon: Video, color: 'text-fire-gold', bg: 'bg-fire-gold/10', border: 'border-fire-gold/30' },
    { label: 'Mensajes', count: stats.messages, icon: Mail, color: 'text-fire-red', bg: 'bg-fire-red/10', border: 'border-fire-red/30' },
  ]

  return (
    <div>
      <h1 className="font-heading text-4xl sm:text-5xl tracking-wider mb-2">
        <span className="text-fire-gradient">DASHBOARD</span>
      </h1>
      <p className="text-muted mb-8">Bienvenido al panel de administración de Fuego Dance</p>

      {loading ? (
        <p className="text-muted">Cargando estadísticas...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.label} className={`bg-dark-charcoal rounded-xl p-6 border ${card.border}`}>
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <p className="text-muted text-sm mb-1">{card.label}</p>
              <p className={`font-heading text-4xl tracking-wider ${card.color}`}>{card.count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
