import { useState, useEffect } from 'react'
import { Play, Filter, Sparkles, Flame, Loader2, X } from 'lucide-react'

const levels = [
  { id: 'all', label: 'Todos' },
  { id: 'basico', label: 'Básico' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
]

const levelColors = {
  basico: 'bg-fire-red text-white',
  intermedio: 'bg-fire-orange text-white',
  avanzado: 'bg-fire-gold text-dark-obsidian',
}

export default function Figures() {
  const [activeLevel, setActiveLevel] = useState('all')
  const [figures, setFigures] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalFigure, setModalFigure] = useState(null)
  const [loadingVideo, setLoadingVideo] = useState(null)
  const [failedThumbnails, setFailedThumbnails] = useState({})

  const handleThumbnailError = (figId) => {
    setFailedThumbnails(prev => ({ ...prev, [figId]: true }))
  }

  useEffect(() => {
    setModalFigure(null)
    setLoadingVideo(null)
    setFailedThumbnails({})
    setLoading(true)
    fetch(`/api/figures/${activeLevel !== 'all' ? `?level=${activeLevel}` : ''}`)
      .then(r => r.json())
      .then(data => { setFigures(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeLevel])

  return (
    <section className="relative pt-28 pb-24 px-4 bg-dark-obsidian min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(230,57,70,.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(247,127,0,.12),transparent_34%)]" />
      <div className="absolute inset-0 fuego-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-fire-gold animate-floaty" />
            <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Biblioteca de movimiento</span>
          </div>
          <h2 className="font-heading text-6xl sm:text-8xl tracking-wider leading-none">
            <span className="text-fire-gradient">FIGURAS</span> DE SALSA
          </h2>

        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Filter className="w-5 h-5 text-muted" />
          {levels.map((level) => (
            <button type="button" key={level.id} onClick={() => setActiveLevel(level.id)} className={`px-5 py-3 rounded-2xl font-heading text-lg tracking-wider transition-all ${activeLevel === level.id ? 'bg-fire-red text-white fire-glow scale-105' : 'bg-white/[0.05] border border-white/10 text-silver hover:text-fire-orange hover:border-fire-orange/40'}`}>
              {level.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-12 w-12 rounded-full border-4 border-fire-red/30 border-t-fire-red animate-spin" /></div>
        ) : figures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {figures.map((fig, i) => (
              <div key={fig.id} className="group relative overflow-hidden bg-dark-charcoal/90 rounded-[1.75rem] border border-white/10 hover:border-fire-red/40 transition-all hover:-translate-y-2 fire-glow-hover animate-fade-up" style={{ animationDelay: `${i * 75}ms` }}>
                {fig.video_file_url ? (
                  <div
                    className="bg-dark-ash overflow-hidden relative cursor-pointer aspect-video"
                    onClick={() => setModalFigure(fig)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setModalFigure(fig)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver video de ${fig.name}`}
                  >
                    {fig.thumbnail_url && !failedThumbnails[fig.id] ? (
                      <>
                        <img
                          src={fig.thumbnail_url}
                          alt={fig.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => handleThumbnailError(fig.id)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col items-center gap-2 transition-transform group-hover:scale-110">
                            <Play className="w-14 h-14 text-fire-gold drop-shadow-lg" />
                            <span className="text-fire-gold text-xs uppercase tracking-widest font-heading opacity-0 group-hover:opacity-100 transition-opacity">Reproducir</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle,rgba(230,57,70,.18),#1A1A2E)] group/card transition-all">
                        <div className="flex flex-col items-center gap-2 transition-transform group-hover/card:scale-110">
                          <Play className="w-14 h-14 text-fire-gold drop-shadow-lg" />
                          <span className="text-fire-gold text-xs uppercase tracking-widest font-heading opacity-0 group-hover/card:opacity-100 transition-opacity">Reproducir</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-[radial-gradient(circle,rgba(230,57,70,.18),#1A1A2E)] flex items-center justify-center">
                    <Play className="w-14 h-14 text-fire-gold group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-heading text-3xl tracking-wider">{fig.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${levelColors[fig.level] || 'bg-dark-ash'}`}>{fig.level}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    {fig.duration && <span>Duración: {fig.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto rounded-[2rem] border border-fire-red/25 bg-white/[0.045] p-10 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-fire-red/20 blur-3xl" />
            <Flame className="relative w-16 h-16 text-fire-red mx-auto mb-5 animate-floaty" />
            <h3 className="relative font-heading text-4xl tracking-wider mb-3">LISTO PARA AGREGAR FIGURAS</h3>
            <p className="relative text-silver/85 leading-relaxed mb-6">
              Entra al panel de administración y crea figuras con nombre, nivel y archivo de video. Los videos se guardan en el servidor y la duración se calcula automáticamente.
            </p>
            <a href="/admin" className="relative inline-block px-7 py-3 rounded-2xl bg-fire-red text-white font-heading text-xl tracking-wider fire-glow hover:bg-fire-orange transition-all">IR AL ADMIN</a>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modalFigure && (
        <div
          className="fixed inset-0 z-50 bg-dark-obsidian/90 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setModalFigure(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setModalFigure(null) }}
          tabIndex={0}
          role="presentation"
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-dark-charcoal/95 rounded-[1.75rem] border border-white/10 shadow-2xl animate-fade-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-dark-obsidian/80 flex items-center justify-center text-silver hover:text-white transition-colors"
              onClick={() => setModalFigure(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative flex-shrink min-h-0 bg-black rounded-t-[1.75rem] flex items-center justify-center">
              {loadingVideo === modalFigure.id && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="w-12 h-12 text-fire-orange animate-spin" />
                </div>
              )}
              <video
                src={modalFigure.video_file_url}
                className="w-full h-full max-h-[75vh] object-contain"
                controls
                autoPlay
                playsInline
                onCanPlay={() => setLoadingVideo(null)}
                onLoadStart={() => setLoadingVideo(modalFigure.id)}
                onLoadedMetadata={() => {}}
              />
            </div>
            <div className="p-4 sm:p-6 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-2xl sm:text-3xl tracking-wider truncate">{modalFigure.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 ${levelColors[modalFigure.level] || 'bg-dark-ash'}`}>{modalFigure.level}</span>
              </div>
              {modalFigure.duration && (
                <p className="text-xs text-muted mt-2">Duración: {modalFigure.duration}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
