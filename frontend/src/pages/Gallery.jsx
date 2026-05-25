import { useState, useEffect } from 'react'
import { Camera, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

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
      <meta name="description" content="Galería de fotos de Fuego Dance: sociales, eventos y momentos de nuestras clases de Salsa Casino en Curicó, Talca y Rancagua." />
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
          <p className="text-center text-muted">Cargando galería...</p>
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
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                    {albums[eventName].map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative rounded-xl overflow-hidden border border-dark-ash
                          hover:border-fire-orange/30 transition-all break-inside-avoid cursor-pointer"
                        onClick={() => setLightbox(photo)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setLightbox(photo)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Abrir foto de ${photo.event || 'galería'}`}
                      >
                        <img
                          src={`/api/gallery/files/${photo.filename}?v=2`}
                          alt={photo.alt || ''}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-obsidian/80 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="font-heading text-lg tracking-wider text-fire-gold">
                            {photo.event || ''}
                          </span>
                        </div>
                      </div>
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
          <img
            src={`/api/gallery/files/${lightbox.filename}?v=2`}
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
