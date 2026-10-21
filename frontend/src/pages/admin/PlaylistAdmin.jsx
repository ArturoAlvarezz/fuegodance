import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { ListMusic, Trash2, Flame, ExternalLink } from 'lucide-react'

export default function PlaylistAdmin() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/playlist/?order=recent')
        if (res.status === 401) { handleAuthError(); return }
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setSongs(Array.isArray(data) ? data : [])
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (song) => {
    if (!window.confirm(`¿Quitar «${song.title}» de la playlist?`)) return
    try {
      const res = await apiFetch(`/api/playlist/${song.id}`, { method: 'DELETE' })
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error('Error al eliminar')
      setSongs((prev) => prev.filter((s) => s.id !== song.id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">PLAYLIST</span></h1>
        <p className="text-muted text-sm mt-1">Canciones propuestas por los alumnos, de la más reciente a la más antigua</p>
      </div>

      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="space-y-3">
          {songs.length === 0 && (
            <div className="bg-dark-charcoal rounded-xl p-12 border border-dark-ash text-center text-muted">
              <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Aún no hay canciones propuestas
            </div>
          )}
          {songs.map((song) => (
            <div key={song.id} className="flex items-center gap-4 bg-dark-charcoal rounded-xl p-3 border border-dark-ash hover:border-fire-red/20 transition-all">
              <img src={`https://i.ytimg.com/vi/${song.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="w-28 aspect-video object-cover rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold line-clamp-2">{song.title}</p>
                <p className="text-muted text-xs mt-1">
                  {song.style} · por {song.added_by_name} · {new Date(song.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <span className="flex items-center gap-1 text-fire-gold text-sm shrink-0"><Flame className="w-4 h-4" />{song.votes}</span>
              <a href={`https://www.youtube.com/watch?v=${song.youtube_id}`} target="_blank" rel="noopener noreferrer" aria-label="Ver en YouTube" className="p-2 rounded-lg text-silver hover:text-fire-orange transition-colors shrink-0">
                <ExternalLink className="w-4 h-4" />
              </a>
              <button type="button" onClick={() => handleDelete(song)} aria-label="Eliminar" className="p-2 rounded-lg text-silver hover:text-fire-red transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
