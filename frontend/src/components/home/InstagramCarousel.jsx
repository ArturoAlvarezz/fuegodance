import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Instagram, ExternalLink } from 'lucide-react'

export default function InstagramCarousel() {
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/instagram/')
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
    setCurrent(prev => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  useEffect(() => {
    if (posts.length < 2) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [posts.length, next])

  if (loading) return null
  if (posts.length === 0) return null

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

        {/* Simple Carousel */}
        <div
          className="relative flex items-center justify-center select-none"
        >
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

          {/* Center image */}
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`cursor-pointer transition-all duration-500 ${
                i === current
                  ? 'block'
                  : 'hidden'
              }`}
            >
              {i === current && (
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute -inset-6 rounded-2xl bg-fire-red/20 blur-3xl animate-pulse-slow pointer-events-none" />

                  {/* Image */}
                  <div className="relative overflow-hidden rounded-2xl border border-fire-gold/30 shadow-[0_0_50px_rgba(247,127,0,.2)] bg-dark-charcoal">
                    <a
                      href={post.link || `https://www.instagram.com/fuegodance.cl/p/${post.id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={post.image || `/api/instagram/media/${post.id}`}
                        alt={post.title || 'Instagram post'}
                        className="w-auto h-auto max-w-full max-h-[70vh] object-contain"
                        draggable={false}
                        loading="lazy"
                      />
                    </a>
                  </div>

                  {/* Pop-out shadow */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-full bg-fire-red/25 blur-xl pointer-events-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {posts.map((post, i) => (
            <button
              type="button"
              key={post.id}
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
