import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Instagram, ExternalLink } from 'lucide-react'
import logoImg from '../../assets/logo.jpg'

export default function InstagramCarousel() {
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchFeed = useCallback(() => {
    fetch('/api/instagram/feed')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.slice(0, 10))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchFeed()
    // Auto-refresh every 6 hours
    const refreshTimer = setInterval(fetchFeed, 6 * 60 * 60 * 1000)
    return () => clearInterval(refreshTimer)
  }, [fetchFeed])

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (posts.length < 2) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [posts.length, next])

  if (loading) return null
  if (posts.length === 0) return null

  const post = posts[current]

  return (
    <section id="instagram-carousel" className="relative py-24 px-4 bg-dark-obsidian overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(230,57,70,.13),transparent_42%),radial-gradient(circle_at_20%_70%,rgba(247,127,0,.08),transparent_35%)]" />
      <div className="absolute inset-0 fuego-grid opacity-15" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="w-7 h-7 text-fire-red" />
              <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Publicaciones oficiales</span>
            </div>
            <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">
              PULSO <span className="text-fire-gradient">FUEGO</span>
            </h2>
            <p className="text-silver/85 max-w-2xl mt-3">
              Clases, intensivos, eventos y comunidad directo desde el perfil oficial de Instagram
            </p>
          </div>
          <a
            href="https://www.instagram.com/fuegodance.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-fire-red/40 text-fire-gold hover:bg-fire-red/10 transition-all font-heading text-lg tracking-wider"
          >
            VER PERFIL <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center select-none">
          {/* Nav arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-dark-obsidian/80 border border-white/15 text-silver hover:text-white hover:border-fire-red/50 flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-dark-obsidian/80 border border-white/15 text-silver hover:text-white hover:border-fire-red/50 flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Instagram-style card */}
          <div className="relative w-full max-w-md">
            {/* Glow ring */}
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-fire-red/20 via-fire-orange/10 to-fire-gold/20 blur-3xl animate-pulse-slow pointer-events-none" />

            {/* Card with Instagram gradient border */}
            <div
              key={current}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-fire-red via-fire-orange to-fire-gold p-[3px] shadow-[0_0_60px_rgba(230,57,70,.25)]"
            >
              <div className="bg-dark-charcoal rounded-[calc(1rem-3px)] overflow-hidden">
                {/* Instagram header bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-fire-red/50">
                    <img
                      src={logoImg}
                      alt="Fuego Dance"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">fuegodance.cl</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider">Curicó, Chile</p>
                  </div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fire-red/20 text-fire-gold text-xs font-semibold hover:bg-fire-red/30 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    Ver
                  </a>
                </div>

                {/* Post image */}
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden"
                >
                  <img
                    src={post.media_url}
                    alt="Publicación de Fuego Dance"
                    className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500"
                    draggable={false}
                    loading="lazy"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-obsidian/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-heading tracking-wider">VER EN INSTAGRAM →</span>
                  </div>
                </a>

                {/* Instagram footer bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                  <div className="flex items-center gap-5">
                    {/* Heart */}
                    <button className="text-fire-red hover:scale-110 transition-transform" aria-label="Me gusta">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                    {/* Comment */}
                    <button className="text-silver hover:text-white hover:scale-110 transition-all" aria-label="Comentar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                    {/* Share */}
                    <button className="text-silver hover:text-white hover:scale-110 transition-all" aria-label="Compartir">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                  {/* Bookmark */}
                  <button className="text-silver hover:text-white hover:scale-110 transition-all" aria-label="Guardar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Pop-out shadow */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-full bg-fire-red/20 blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {posts.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2.5 bg-fire-red fire-glow'
                  : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Ir a publicación ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
