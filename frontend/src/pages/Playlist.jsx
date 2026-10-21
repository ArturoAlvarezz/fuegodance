import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Flame, Music2, Play, Pause, SkipForward, Shuffle, Plus, Trash2, Youtube, Loader2 } from 'lucide-react'
import { useAuth, useUserApi } from '../hooks/useAuth'

const styles = [
  { id: 'all', label: 'Todas' },
  { id: 'salsa', label: 'Salsa' },
  { id: 'timba', label: 'Timba' },
  { id: 'bachata', label: 'Bachata' },
  { id: 'son', label: 'Son' },
  { id: 'otro', label: 'Otro' },
]

const styleColors = {
  salsa: 'bg-fire-red text-white',
  timba: 'bg-fire-orange text-white',
  bachata: 'bg-fire-gold text-dark-obsidian',
  son: 'bg-white/15 text-white',
  otro: 'bg-dark-ash text-silver',
}

// Carga una sola vez la IFrame Player API de YouTube
let youtubeApiPromise = null
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    })
  }
  return youtubeApiPromise
}

export default function Playlist() {
  const { userApiFetch } = useUserApi()
  const { logoutUser } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeStyle, setActiveStyle] = useState('all')
  const [order, setOrder] = useState('votes')
  const [form, setForm] = useState({ url: '', style: 'salsa' })
  const [adding, setAdding] = useState(false)
  const [formMessage, setFormMessage] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shuffle, setShuffle] = useState(false)

  const playerRef = useRef(null)
  const playerHostRef = useRef(null)
  // Los eventos del reproductor necesitan el estado más reciente
  const songsRef = useRef(songs)
  const currentIdRef = useRef(currentId)
  const shuffleRef = useRef(shuffle)
  songsRef.current = songs
  currentIdRef.current = currentId
  shuffleRef.current = shuffle

  const loadSongs = async () => {
    const params = new URLSearchParams({ order })
    if (activeStyle !== 'all') params.set('style', activeStyle)
    try {
      const r = await userApiFetch(`/api/playlist/?${params}`)
      if (r.status === 401 || r.status === 403) {
        logoutUser()
        setError('unauthorized')
        return
      }
      if (!r.ok) throw new Error()
      const data = await r.json()
      setSongs(Array.isArray(data) ? data : [])
      setError(null)
    } catch {
      setError('fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSongs() }, [activeStyle, order])

  useEffect(() => () => playerRef.current?.destroy(), [])

  const playSong = async (song) => {
    setCurrentId(song.id)
    const YT = await loadYouTubeApi()
    if (playerRef.current) {
      playerRef.current.loadVideoById(song.youtube_id)
      return
    }
    playerRef.current = new YT.Player(playerHostRef.current, {
      videoId: song.youtube_id,
      width: '100%',
      height: '100%',
      playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
      events: {
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) setIsPlaying(true)
          if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false)
          if (e.data === YT.PlayerState.ENDED) playNext()
        },
        // Video eliminado o que no se puede incrustar: pasar al siguiente
        onError: () => playNext(),
      },
    })
  }

  const playNext = () => {
    const list = songsRef.current
    if (list.length === 0) return
    const index = list.findIndex((s) => s.id === currentIdRef.current)
    let next
    if (shuffleRef.current && list.length > 1) {
      const others = list.filter((s) => s.id !== currentIdRef.current)
      next = others[Math.floor(Math.random() * others.length)]
    } else {
      next = list[(index + 1) % list.length]
    }
    playSong(next)
  }

  const togglePlay = () => {
    if (!playerRef.current) {
      if (songs.length > 0) playSong(shuffle ? songs[Math.floor(Math.random() * songs.length)] : songs[0])
      return
    }
    if (isPlaying) playerRef.current.pauseVideo()
    else playerRef.current.playVideo()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    setFormMessage(null)
    try {
      const r = await userApiFetch('/api/playlist/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.detail || 'No se pudo agregar la canción')
      setForm({ url: '', style: form.style })
      setFormMessage({ ok: true, text: `«${data.title}» agregada a la playlist 🔥` })
      loadSongs()
    } catch (err) {
      setFormMessage({ ok: false, text: err.message })
    } finally {
      setAdding(false)
    }
  }

  const handleVote = async (song) => {
    const r = await userApiFetch(`/api/playlist/${song.id}/vote`, { method: 'POST' })
    if (!r.ok) return
    const data = await r.json()
    setSongs((prev) => prev.map((s) => (s.id === song.id ? { ...s, votes: data.votes, voted: data.voted } : s)))
  }

  const handleDelete = async (song) => {
    if (!window.confirm(`¿Quitar «${song.title}» de la playlist?`)) return
    const r = await userApiFetch(`/api/playlist/${song.id}`, { method: 'DELETE' })
    if (r.ok) setSongs((prev) => prev.filter((s) => s.id !== song.id))
  }

  const current = songs.find((s) => s.id === currentId)
  const youtubeUrl = songs.length > 0
    ? `https://www.youtube.com/watch_videos?video_ids=${songs.slice(0, 50).map((s) => s.youtube_id).join(',')}`
    : null

  return (
    <>
    <Helmet>
      <title>Playlist de la academia | Fuego Dance</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <section className="relative pt-28 pb-24 px-4 bg-dark-obsidian min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(230,57,70,.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(247,127,0,.12),transparent_34%)]" />
      <div className="absolute inset-0 fuego-grid opacity-20" />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music2 className="w-7 h-7 text-fire-gold animate-floaty" />
            <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Hecha por los alumnos</span>
          </div>
          <h2 className="font-heading text-6xl sm:text-8xl tracking-wider leading-none">
            <span className="text-fire-gradient">PLAYLIST</span> FUEGO
          </h2>
          <p className="text-silver/85 mt-4 max-w-xl mx-auto">
            Propón las canciones que te hacen bailar y vota con 🔥 tus favoritas.
          </p>
        </div>

        {error === 'unauthorized' ? (
          <div className="relative max-w-3xl mx-auto rounded-[2rem] border border-fire-red/25 bg-white/[0.045] p-10 text-center backdrop-blur-xl">
            <Flame className="w-16 h-16 text-fire-red mx-auto mb-5 animate-floaty" />
            <h3 className="font-heading text-4xl tracking-wider mb-3">SESIÓN REQUERIDA</h3>
            <p className="text-silver/85 leading-relaxed mb-6">Tu sesión expiró. Vuelve a iniciar sesión para ver la playlist.</p>
            <a href="/login" className="inline-block px-7 py-3 rounded-2xl bg-fire-red text-white font-heading text-xl tracking-wider fire-glow hover:bg-fire-orange transition-all">INICIAR SESIÓN</a>
          </div>
        ) : (
          <>
            {/* Reproductor */}
            <div className="rounded-[1.75rem] border border-white/10 bg-dark-charcoal/90 overflow-hidden mb-8">
              <div className={`bg-black aspect-video sm:aspect-auto sm:h-[360px] [&>iframe]:w-full [&>iframe]:h-full ${currentId ? '' : 'hidden'}`}>
                <div ref={playerHostRef} />
              </div>
              <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={togglePlay} disabled={songs.length === 0} aria-label={isPlaying ? 'Pausar' : 'Reproducir'} className="w-12 h-12 shrink-0 rounded-full bg-fire-red text-white flex items-center justify-center fire-glow hover:bg-fire-orange transition-all disabled:opacity-40">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button type="button" onClick={playNext} disabled={!currentId} aria-label="Siguiente" className="w-10 h-10 shrink-0 rounded-full bg-white/5 border border-white/10 text-silver flex items-center justify-center hover:text-fire-orange transition-all disabled:opacity-40">
                  <SkipForward className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setShuffle(!shuffle)} aria-label="Aleatorio" aria-pressed={shuffle} className={`w-10 h-10 shrink-0 rounded-full border flex items-center justify-center transition-all ${shuffle ? 'bg-fire-red/20 border-fire-red/50 text-fire-gold' : 'bg-white/5 border-white/10 text-silver hover:text-fire-orange'}`}>
                  <Shuffle className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold truncate">{current ? current.title : 'Pulsa play para escuchar la playlist'}</p>
                  {current && <p className="text-muted text-xs truncate">Propuesta por {current.added_by_name}</p>}
                </div>
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-silver hover:text-fire-orange hover:border-fire-orange/40 transition-all">
                    <Youtube className="w-4 h-4 text-fire-red" /> Abrir en YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Proponer canción */}
            <form onSubmit={handleAdd} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="Pega el enlace de YouTube"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-dark-obsidian border border-white/10 text-white placeholder:text-muted focus:outline-none focus:border-fire-orange/60"
                />
                <select
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-dark-obsidian border border-white/10 text-white focus:outline-none focus:border-fire-orange/60"
                >
                  {styles.filter((s) => s.id !== 'all').map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button type="submit" disabled={adding} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-fire-red text-white font-heading text-lg tracking-wider hover:bg-fire-orange transition-all disabled:opacity-60">
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Agregar
                </button>
              </div>
              {formMessage && (
                <p className={`mt-3 text-sm ${formMessage.ok ? 'text-fire-gold' : 'text-fire-red'}`}>{formMessage.text}</p>
              )}
            </form>

            {/* Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button type="button" key={s.id} onClick={() => setActiveStyle(s.id)} className={`px-4 py-2 rounded-xl font-heading tracking-wider transition-all ${activeStyle === s.id ? 'bg-fire-red text-white fire-glow' : 'bg-white/[0.05] border border-white/10 text-silver hover:text-fire-orange hover:border-fire-orange/40'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex rounded-xl border border-white/10 overflow-hidden text-sm">
                {[['votes', 'Más votadas'], ['recent', 'Recientes']].map(([id, label]) => (
                  <button type="button" key={id} onClick={() => setOrder(id)} className={`px-4 py-2 transition-all ${order === id ? 'bg-white/10 text-fire-gold' : 'text-silver hover:text-fire-orange'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista */}
            {loading ? (
              <div className="flex justify-center py-20"><div className="h-12 w-12 rounded-full border-4 border-fire-red/30 border-t-fire-red animate-spin" /></div>
            ) : error === 'fetch' ? (
              <p className="text-center text-silver py-12">No se pudo cargar la playlist. Inténtalo de nuevo más tarde.</p>
            ) : songs.length === 0 ? (
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <Flame className="w-12 h-12 text-fire-red mx-auto mb-4 animate-floaty" />
                <p className="text-silver">Todavía no hay canciones aquí. ¡Propón la primera!</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {songs.map((song, i) => {
                  const active = song.id === currentId
                  return (
                    <li key={song.id} className={`flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border transition-all ${active ? 'bg-fire-red/10 border-fire-red/40' : 'bg-dark-charcoal/80 border-white/10 hover:border-fire-red/30'}`}>
                      <span className="hidden sm:block w-6 text-center text-muted text-sm">{i + 1}</span>
                      <button type="button" onClick={() => playSong(song)} aria-label={`Reproducir ${song.title}`} className="relative shrink-0 w-24 sm:w-32 aspect-video rounded-xl overflow-hidden bg-dark-ash group">
                        <img src={`https://i.ytimg.com/vi/${song.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
                        <span className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <Play className="w-7 h-7 text-fire-gold" />
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold leading-snug line-clamp-2">{song.title}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted">
                          <span className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${styleColors[song.style] || styleColors.otro}`}>{song.style}</span>
                          <span className="truncate">por {song.added_by_name}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleVote(song)} aria-pressed={song.voted} aria-label={song.voted ? 'Quitar voto' : 'Votar'} className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${song.voted ? 'bg-fire-red/20 border-fire-red/50 text-fire-gold' : 'bg-white/5 border-white/10 text-silver hover:text-fire-orange'}`}>
                        <Flame className={`w-5 h-5 ${song.voted ? 'fill-fire-orange' : ''}`} />
                        <span className="text-xs font-semibold">{song.votes}</span>
                      </button>
                      {song.can_delete && (
                        <button type="button" onClick={() => handleDelete(song)} aria-label="Quitar canción" className="shrink-0 p-2 rounded-xl text-muted hover:text-fire-red transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
    </>
  )
}
