import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function GalleryCarousel() {
  const [photos, setPhotos] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0) // -1 left, 1 right

  useEffect(() => {
    fetch('/api/gallery/')
      .then(r => r.json())
      .then(data => {
        setPhotos(data.filter(p => p.filename))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % photos.length)
  }, [photos.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Auto-play
  useEffect(() => {
    if (photos.length < 2 || isPaused) return
    const timer = setInterval(next, 4500)
    return () => clearInterval(timer)
  }, [photos.length, isPaused, next])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  if (loading) return null
  if (photos.length === 0) return null

  const photo = photos[current]

  // Get indices for peek previews (2 on each side)
  const getNeighbor = (offset) => {
    return photos[(current + offset + photos.length) % photos.length]
  }

  return (
    <section className="relative py-24 px-4 bg-dark-charcoal overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(230,57,70,.12),transparent_50%)]" />
      <div className="absolute inset-0 fuego-grid opacity-10" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">
            VIVE <span className="text-fire-gradient">EL FUEGO</span>
          </h2>
          <p className="text-silver/80 text-center mt-4 max-w-xl mx-auto">
            Clases, sociales y momentos que cuentan una historia
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative flex items-center justify-center select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 sm:left-4 z-30 w-11 h-11 rounded-full bg-dark-obsidian/80 border border-white/15 text-silver hover:text-white hover:border-fire-red/50 flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 sm:right-4 z-30 w-11 h-11 rounded-full bg-dark-obsidian/80 border border-white/15 text-silver hover:text-white hover:border-fire-red/50 flex items-center justify-center backdrop-blur-xl transition-all hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Peek previews — left */}
          <div className="hidden lg:block absolute left-0 xl:left-8 top-1/2 -translate-y-1/2 w-32 xl:w-40 opacity-30 scale-90 blur-[2px] transition-all duration-700 pointer-events-none z-0">
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <img
                src={`/api/gallery/files/${getNeighbor(-2).filename}?v=2`}
                alt=""
                loading="lazy"
                className="w-full h-48 object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Peek previews — right */}
          <div className="hidden lg:block absolute right-0 xl:right-8 top-1/2 -translate-y-1/2 w-32 xl:w-40 opacity-30 scale-90 blur-[2px] transition-all duration-700 pointer-events-none z-0">
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <img
                src={`/api/gallery/files/${getNeighbor(2).filename}?v=2`}
                alt=""
                loading="lazy"
                className="w-full h-48 object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Main image container */}
          <div className="relative w-full max-w-3xl h-[420px] sm:h-[520px] flex items-center justify-center">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-fire-red/10 blur-3xl animate-pulse-slow pointer-events-none" />

            {/* Image with fade transition */}
            <div
              key={current}
              className="absolute inset-0 flex items-center justify-center animate-fade-up"
            >
              {/* Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-fire-gold/30 shadow-[0_0_60px_rgba(247,127,0,.2)] max-h-full">
                <img
                  src={`/api/gallery/files/${photo.filename}?v=2`}
                  alt={photo.alt || 'Fuego Dance'}
                  className="max-w-full max-h-[420px] sm:max-h-[520px] object-contain"
                  draggable={false}
                />

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-obsidian/90 via-dark-obsidian/40 to-transparent p-5 pt-16">
                  {photo.event && (
                    <p className="font-heading text-lg tracking-wider text-fire-gold">{photo.event}</p>
                  )}
                  <p className="text-[11px] uppercase tracking-[.25em] text-muted mt-1">
                    Fuego Dance
                  </p>
                </div>
              </div>

              {/* Pop-out shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-6 rounded-full bg-fire-red/25 blur-xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {photos.slice(0, Math.min(photos.length, 15)).map((p, i) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2.5 bg-fire-red fire-glow'
                  : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Ir a foto ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
