import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { ListMusic, Trash2, Flame, ExternalLink, Check, EyeOff, Edit2, X, Save, Plus, Loader2, CheckCheck } from 'lucide-react'

const tabs = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'hidden', label: 'Ocultas' },
  { id: 'all', label: 'Todas' },
]

const styles = ['salsa', 'timba', 'bachata', 'son', 'otro']

const statusBadge = {
  pending: { label: 'Pendiente', className: 'bg-fire-gold/15 text-fire-gold' },
  approved: { label: 'Aprobada', className: 'bg-green-500/15 text-green-400' },
  hidden: { label: 'Oculta', className: 'bg-white/10 text-muted' },
}

export default function PlaylistAdmin() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [songs, setSongs] = useState([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, hidden: 0 })
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [addForm, setAddForm] = useState({ url: '', style: 'salsa' })
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState(null)

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  const load = async () => {
    try {
      const query = tab === 'all' ? '' : `?status=${tab}`
      const res = await apiFetch(`/api/admin/playlist/${query}`)
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setSongs(data.songs)
      setCounts(data.counts)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  const update = async (song, changes) => {
    try {
      const res = await apiFetch(`/api/admin/playlist/${song.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (res.status === 401) { handleAuthError(); return false }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error al guardar')
      }
      await load()
      return true
    } catch (e) {
      setMessage({ ok: false, text: e.message })
      return false
    }
  }

  const handleDelete = async (song) => {
    if (!window.confirm(`¿Eliminar «${song.title}» definitivamente? También se borran sus votos.`)) return
    try {
      const res = await apiFetch(`/api/admin/playlist/${song.id}`, { method: 'DELETE' })
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error('Error al eliminar')
      load()
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    }
  }

  const handleApproveAll = async () => {
    if (!window.confirm(`¿Aprobar las ${counts.pending} canciones pendientes?`)) return
    const res = await apiFetch('/api/admin/playlist/approve-pending', { method: 'POST' })
    if (res.status === 401) { handleAuthError(); return }
    if (res.ok) {
      const data = await res.json()
      setMessage({ ok: true, text: `${data.approved} canciones aprobadas` })
      load()
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (await update(editing, { title: editing.title, style: editing.style })) setEditing(null)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    setMessage(null)
    try {
      const res = await apiFetch('/api/playlist/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (res.status === 401) { handleAuthError(); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'No se pudo agregar')
      setAddForm({ url: '', style: addForm.style })
      setMessage({ ok: true, text: `«${data.title}» agregada y publicada` })
      load()
    } catch (err) {
      setMessage({ ok: false, text: err.message })
    } finally {
      setAdding(false)
    }
  }

  const total = counts.pending + counts.approved + counts.hidden
  const tabCount = (id) => (id === 'all' ? total : counts[id])

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">PLAYLIST</span></h1>
        <p className="text-muted text-sm mt-1">Las canciones que proponen los alumnos quedan pendientes hasta que las apruebes. Las ocultas no se ven en la web, pero se pueden volver a publicar.</p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 bg-dark-charcoal rounded-xl p-4 border border-dark-ash mb-4">
        <input
          type="url"
          required
          value={addForm.url}
          onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
          placeholder="Agregar canción: enlace de YouTube"
          className="flex-1 min-w-0 px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white placeholder:text-muted focus:outline-none focus:border-fire-orange/60"
        />
        <select value={addForm.style} onChange={(e) => setAddForm({ ...addForm, style: e.target.value })} className="px-3 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white capitalize">
          {styles.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" disabled={adding} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-fire-red text-white rounded-lg font-heading tracking-wider hover:bg-fire-orange transition-all disabled:opacity-60">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Agregar
        </button>
      </form>

      {message && (
        <p className={`mb-4 text-sm ${message.ok ? 'text-green-400' : 'text-fire-red'}`}>{message.text}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => { setTab(t.id); setLoading(true) }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-fire-red/20 text-fire-gold ring-1 ring-fire-red/40' : 'bg-dark-charcoal text-silver hover:text-fire-orange'}`}
            >
              {t.label}
              <span className={`min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs ${t.id === 'pending' && counts.pending > 0 ? 'bg-fire-red text-white' : 'bg-white/10'}`}>{tabCount(t.id)}</span>
            </button>
          ))}
        </div>
        {tab === 'pending' && counts.pending > 1 && (
          <button type="button" onClick={handleApproveAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all">
            <CheckCheck className="w-4 h-4" /> Aprobar todas
          </button>
        )}
      </div>

      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="space-y-3">
          {songs.length === 0 && (
            <div className="bg-dark-charcoal rounded-xl p-12 border border-dark-ash text-center text-muted">
              <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
              {tab === 'pending' ? 'No hay canciones esperando aprobación' : 'No hay canciones aquí'}
            </div>
          )}
          {songs.map((song) => {
            const badge = statusBadge[song.status]
            return (
              <div key={song.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-dark-charcoal rounded-xl p-3 border border-dark-ash hover:border-fire-red/20 transition-all">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <a href={`https://www.youtube.com/watch?v=${song.youtube_id}`} target="_blank" rel="noopener noreferrer" aria-label="Escuchar en YouTube" className="relative shrink-0 group">
                    <img src={`https://i.ytimg.com/vi/${song.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="w-28 aspect-video object-cover rounded-lg" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </span>
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold line-clamp-2">{song.title}</p>
                    <p className="text-muted text-xs mt-1">
                      {song.channel && <>{song.channel} · </>}
                      <span className="capitalize">{song.style}</span> · por {song.added_by_name} · {new Date(song.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                      <span className="flex items-center gap-1 text-fire-gold text-xs"><Flame className="w-3.5 h-3.5" />{song.votes}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  {song.status !== 'approved' && (
                    <button type="button" onClick={() => update(song, { status: 'approved' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all">
                      <Check className="w-4 h-4" /> {song.status === 'hidden' ? 'Publicar' : 'Aprobar'}
                    </button>
                  )}
                  {song.status !== 'hidden' && (
                    <button type="button" onClick={() => update(song, { status: 'hidden' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-white/5 text-silver hover:text-white transition-all">
                      <EyeOff className="w-4 h-4" /> Ocultar
                    </button>
                  )}
                  <button type="button" onClick={() => setEditing({ ...song })} aria-label="Editar" className="p-2 rounded-lg text-silver hover:text-fire-orange transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(song)} aria-label="Eliminar" className="p-2 rounded-lg text-silver hover:text-fire-red transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)} role="presentation">
          <form onSubmit={handleSaveEdit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-dark-charcoal rounded-2xl border border-dark-ash p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-2xl tracking-wider">EDITAR CANCIÓN</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Cerrar" className="text-silver hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <label className="block text-sm text-silver mb-1" htmlFor="song-title">Título</label>
            <input id="song-title" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white mb-4 focus:outline-none focus:border-fire-orange/60" />
            <label className="block text-sm text-silver mb-1" htmlFor="song-style">Estilo</label>
            <select id="song-style" value={editing.style} onChange={(e) => setEditing({ ...editing, style: e.target.value })} className="w-full px-4 py-2.5 rounded-lg bg-dark-obsidian border border-dark-ash text-white capitalize mb-6">
              {styles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg bg-white/5 text-silver hover:text-white">Cancelar</button>
              <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-fire-red text-white rounded-lg font-heading tracking-wider hover:bg-fire-orange transition-all">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
