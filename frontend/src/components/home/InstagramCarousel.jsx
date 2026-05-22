import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Instagram, ExternalLink } from 'lucide-react'

export default function InstagramCarousel() {
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState(0) // -1 left, 1 right, 0 initial

  useEffect(() => {
    fetch('/api/instagram/feed')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (posts.length < 2) return
    const timer = setInterval(next, 6000)
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

            {/* Card with Instagram border */}
            <div
              key={current}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-fire-red via-fire-orange to-fire-gold p-[3px] shadow-[0_0_60px_rgba(230,57,70,.25)] animate-fade-up"
            >
              <div className="bg-dark-charcoal rounded-[calc(1rem-3px)] overflow-hidden">
                {/* Instagram header bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fire-red to-fire-orange flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">fuegodance.cl</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider">Instagram</p>
                  </div>
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fire-gold hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
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
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-fire-red" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    <svg className="w-6 h-6 text-silver hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" /></svg>
                    <svg className="w-6 h-6 text-silver hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3l-1.6 1.6M8 21l-4 4M2 12l4-4M16 8l4-4M12 2l4 4M8 8l-4 4M20 20l-4-4" /></svg>
                  </div>
                  <svg className="w-6 h-6 text-silver hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
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
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
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
