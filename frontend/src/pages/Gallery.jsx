import { useState, useEffect, useRef, useCallback } from 'react'
import { Camera, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

// Convierte nombre de archivo (ej: "foto.jpg") a URL de WebP optimizado
const thumbUrl = (filename) => {
  const stem = filename.replace(/\.[^.]+$/, '')
  return `/images/thumbnails/${stem}.webp`
}
const webUrl = (filename) => {
  const stem = filename.replace(/\.[^.]+$/, '')
  return `/images/web/${stem}.webp`
}

// Componente ImageWithLoader: muestra un spinner mientras se carga la imagen
function ImageWithLoader({ src, alt, onClick, onKeyDown, tabIndex, role, 'aria-label': ariaLabel, className }) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)

  return (
    <div className="relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-ash/50 rounded-xl z-10">
          <Loader2 className="w-8 h-8 text-fire-orange animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)} // hide spinner even on error
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
      />
    </div>
  )
}

// Proporción de la foto; si aún no se conoce, se asume horizontal 3:2
const aspectRatio = (photo) => (photo.width && photo.height ? photo.width / photo.height : 1.5)

// Celda de la grilla: reserva su espacio exacto antes de cargar, así la página no salta
function GalleryTile({ photo, onOpen }) {
  const [loaded, setLoaded] = useState(false)
  const ratio = aspectRatio(photo)

  return (
    <div
      className="group relative rounded-xl overflow-hidden border border-dark-ash bg-dark-ash/50
        hover:border-fire-orange/30 transition-colors cursor-pointer"
      style={{ flexGrow: ratio, flexBasis: `calc(var(--row-h) * ${ratio})` }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Abrir foto de ${photo.event || 'galería'}`}
    >
      <div style={{ paddingTop: `${100 / ratio}%` }} className={loaded ? '' : 'animate-pulse'} />
      <img
        src={thumbUrl(photo.filename)}
        alt={photo.alt || ''}
        width={photo.width || undefined}
        height={photo.height || undefined}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105
          transition-[transform,opacity] duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-obsidian/80 via-transparent to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <span className="font-heading text-lg tracking-wider text-fire-gold">
          {photo.event || ''}
        </span>
      </div>
    </div>
  )
}

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)
  const [collapsed, setCollapsed] = useState({})

  useEffect(() => {
    fetch('/api/gallery/')
      .then(r => r.json())
      .then(data => { setPhotos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Group photos by event
  const albums = {}
  photos.forEach(photo => {
    const eventName = photo.event || 'General'
    if (!albums[eventName]) albums[eventName] = []
    albums[eventName].push(photo)
  })

  // Sort albums: by date (newest first based on photo created_at or id)
  const sortedAlbumNames = Object.keys(albums).sort((a, b) => {
    const aPhotos = albums[a]
    const bPhotos = albums[b]
    const aDate = aPhotos.reduce((max, p) => (p.created_at && p.created_at > max ? p.created_at : max), '')
    const bDate = bPhotos.reduce((max, p) => (p.created_at && p.created_at > max ? p.created_at : max), '')
    if (aDate && bDate) return bDate.localeCompare(aDate)
    // Fallback: sort by max id descending
    const aMax = Math.max(...aPhotos.map(p => p.id || 0))
    const bMax = Math.max(...bPhotos.map(p => p.id || 0))
    return bMax - aMax
  })

  const toggleCollapse = (name) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <>
    <Helmet>
      <title>Galería de Fotos — Sociales y Eventos | Fuego Dance</title>
      <meta name="description" content="Galería de fotos de Fuego Dance: sociales, eventos y momentos de nuestras clases de Salsa Casino en Curicó y Talca." />
      <link rel="canonical" href="https://fuegodance.cl/galeria" />
      <meta property="og:title" content="Galería de Fotos — Fuego Dance" />
      <meta property="og:description" content="Sociales, eventos y momentos de nuestras clases de Salsa Casino." />
      <meta property="og:url" content="https://fuegodance.cl/galeria" />
    </Helmet>
    <section className="pt-24 pb-20 px-4 bg-dark-obsidian min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Camera className="w-8 h-8 text-fire-orange" />
          <h2 className="font-heading text-5xl tracking-wider">
            <span className="text-fire-gradient">GALERÍA</span>
          </h2>
        </div>
        <p className="text-silver text-center mb-12">
          Los mejores momentos de nuestros sociales y eventos
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-fire-orange animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 text-muted">
            No hay fotos en la galería aún
          </div>
        ) : (
          <div className="space-y-10">
            {sortedAlbumNames.map((eventName) => (
              <div key={eventName}>
                <button
                  type="button"
                  onClick={() => toggleCollapse(eventName)}
                  className="flex items-center gap-2 mb-5 group"
                >
                  {collapsed[eventName] ? (
                    <ChevronRight className="w-6 h-6 text-fire-orange transition-transform" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-fire-orange transition-transform" />
                  )}
                  <h2 className="font-heading text-3xl sm:text-4xl tracking-wider text-fire-gold group-hover:text-fire-orange transition-colors">
                    {eventName}
                  </h2>
                  <span className="text-sm text-muted ml-2">
                    ({albums[eventName].length} {albums[eventName].length === 1 ? 'foto' : 'fotos'})
                  </span>
                </button>

                {!collapsed[eventName] && (
                  // Grilla justificada: filas de igual altura que se llenan de izquierda a derecha.
                  // El elemento ::after absorbe el espacio sobrante para que la última fila no se estire.
                  <div className="flex flex-wrap gap-2 sm:gap-3 [--row-h:100px] sm:[--row-h:170px] lg:[--row-h:200px]
                    after:content-[''] after:grow-[999]">
                    {albums[eventName].map((photo) => (
                      <GalleryTile key={photo.id} photo={photo} onOpen={() => setLightbox(photo)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-dark-obsidian/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)} onKeyDown={(e) => { if (e.key === 'Escape') setLightbox(null) }} tabIndex={0} role="presentation">
          <button type="button" className="absolute top-4 right-4 text-silver hover:text-white z-10" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
          <ImageWithLoader
            src={webUrl(lightbox.filename)}
            alt={lightbox.alt || ''}
            className="max-w-full max-h-[90vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.event && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <span className="font-heading text-xl tracking-wider text-fire-gold bg-dark-obsidian/80 px-6 py-2 rounded-lg">
                {lightbox.event}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
    </>
  )
}
