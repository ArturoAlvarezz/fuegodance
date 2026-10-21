import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Music2, Flame, Play, ArrowRight } from 'lucide-react'

export default function PlaylistPreview() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/playlist/?order=votes&limit=5')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSongs(Array.isArray(data) ? data : []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || songs.length === 0) return null

  return (
    <section id="playlist" className="relative py-24 px-4 bg-dark-obsidian overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(230,57,70,.12),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(247,127,0,.08),transparent_35%)]" />
      <div className="absolute inset-0 fuego-grid opacity-15" />

      <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Music2 className="w-7 h-7 text-fire-red" />
              <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Hecha por los alumnos</span>
            </div>
            <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">
              <span className="text-fire-gradient">PLAYLIST</span> FUEGO
            </h2>
            <p className="text-silver/85 mt-3 max-w-xl">Las canciones más votadas por la comunidad de Fuego Dance.</p>
          </div>
          <Link to="/playlist" className="inline-flex items-center gap-2 self-start md:self-auto px-6 py-3 rounded-xl bg-fire-red text-white font-heading text-lg tracking-wider hover:bg-fire-orange transition-all fire-glow-hover">
            Escuchar playlist <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <ol className="space-y-3">
          {songs.map((song, i) => (
            <li key={song.id}>
              <Link to="/playlist" className="group flex items-center gap-3 sm:gap-4 p-3 rounded-2xl border bg-dark-charcoal/80 border-white/10 hover:border-fire-red/30 transition-all">
                <span className="w-6 sm:w-8 text-center font-heading text-2xl sm:text-3xl text-fire-gradient shrink-0">{i + 1}</span>
                <span className="relative shrink-0 w-20 sm:w-28 aspect-video rounded-xl overflow-hidden bg-dark-ash">
                  <img src={`https://i.ytimg.com/vi/${song.youtube_id}/mqdefault.jpg`} alt="" loading="lazy" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-fire-gold" />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-white font-semibold leading-snug line-clamp-2">{song.title}</span>
                  <span className="block text-muted text-xs mt-1 truncate">{song.style} · por {song.added_by_name}</span>
                </span>
                <span className="flex items-center gap-1 text-fire-gold text-sm font-semibold shrink-0">
                  <Flame className="w-4 h-4" />{song.votes}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
