import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function GalleryCarousel() {
  const [photos, setPhotos] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

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
    setCurrent(prev => (prev + 1) % photos.length)
  }, [photos.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Auto-play
  useEffect(() => {
    if (photos.length < 2 || isPaused) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [photos.length, isPaused, next])

  if (loading) return null
  if (photos.length === 0) return null

  const getSlide = (offset) => {
    return photos[(current + offset + photos.length) % photos.length]
  }

  const totalSlides = Math.min(photos.length, 7)
  const offsets = Array.from({ length: totalSlides }, (_, i) => {
    const half = Math.floor(totalSlides / 2)
    return i - half
  })

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

        {/* 3D Carousel */}
        <div
          className="relative flex items-center justify-center h-[420px] sm:h-[500px] select-none"
          style={{ perspective: '1400px' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation arrows */}
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

          {/* Slides */}
          {offsets.map((offset) => {
            const slide = getSlide(offset)
            const abs = Math.abs(offset)
            const isCenter = offset === 0
            const scale = isCenter ? 1 : Math.max(0.5, 1 - abs * 0.18)
            const translateZ = isCenter ? 80 : -abs * 80
            const rotateY = offset * (isCenter ? 0 : offset < 0 ? -8 : 8)
            const translateX = offset * (isCenter ? 0 : offset * 18)
            const opacity = isCenter ? 1 : Math.max(0.15, 1 - abs * 0.25)
            const zIndex = totalSlides - abs
            const blur = isCenter ? 0 : abs * 1.5

            return (
              <div
                key={`${slide.id}-${offset}`}
                className="absolute cursor-pointer transition-all duration-700 ease-out"
                style={{
                  transform: `
                    translateX(${translateX}px)
                    translateZ(${translateZ}px)
                    rotateY(${rotateY}deg)
                    scale(${scale})
                  `,
                  opacity,
                  zIndex,
                  filter: blur ? `blur(${blur}px)` : 'none',
                  WebkitFilter: blur ? `blur(${blur}px)` : 'none',
                }}
                onClick={() => {
                  if (!isCenter) {
                    offset < 0 ? prev() : next()
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!isCenter) {
                      offset < 0 ? prev() : next()
                    }
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={isCenter ? 'Foto actual' : `Ir a foto ${Math.abs(offset) + 1}`}
              >
                {/* Glow ring behind center image */}
                {isCenter && (
                  <div className="absolute -inset-6 rounded-2xl bg-fire-red/20 blur-3xl animate-pulse-slow pointer-events-none" />
                )}

                {/* Frame */}
                <div
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-700
                    ${isCenter
                      ? 'border-fire-gold/40 shadow-[0_0_50px_rgba(247,127,0,.25)] max-h-[70vh]'
                      : 'border-white/10 shadow-lg'
                    }
                  `}
                >
                    <img
                    src={`/api/gallery/files/${slide.filename}?v=2`}
                    alt={slide.alt || 'Fuego Dance'}
                    className="w-auto h-auto max-w-full max-h-[70vh]"
                    draggable={false}
                  />

                  {/* Gradient overlay at bottom */}
                  <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-obsidian/90 via-dark-obsidian/40 to-transparent p-5 pt-12 transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                    {slide.event && (
                      <p className="font-heading text-lg tracking-wider text-fire-gold">{slide.event}</p>
                    )}
                    <p className="text-[11px] uppercase tracking-[.25em] text-muted mt-1">
                      Fuego Dance
                    </p>
                  </div>
                </div>

                {/* Pop-out shadow for center */}
                {isCenter && (
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-full bg-fire-red/30 blur-xl pointer-events-none"
                    style={{ transform: 'translateZ(-40px) translateX(-50%)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {photos.slice(0, Math.min(photos.length, 9)).map((photo, i) => (
            <button
              type="button"
              key={photo.id}
              onClick={() => setCurrent(i)}
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
