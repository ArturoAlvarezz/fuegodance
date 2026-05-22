import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Upload, Trash2, Image, X } from 'lucide-react'

export default function GalleryAdmin() {
  const { apiFetch, authHeaders } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [event, setEvent] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/gallery/')
      if (!res.ok) {
        if (res.status === 401) { handleAuthError(); return }
        throw new Error(`Error ${res.status}`)
      }
      const data = await res.json()
      setPhotos(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const uploadFiles = async (files) => {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      if (event) fd.append('event', event)
      await apiFetch('/api/admin/gallery/', { method: 'POST', body: fd })
    }
    setEvent('')
    setUploading(false)
    load()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(Array.from(e.dataTransfer.files))
  }

  const deletePhoto = async (id) => {
    if (!confirm('¿Eliminar esta foto?')) return
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">GALERÍA</span></h1>
        <p className="text-muted text-sm mt-1">Sube y gestiona las fotos de los sociales</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-all cursor-pointer
          ${dragOver ? 'border-fire-red bg-fire-red/5' : 'border-dark-ash hover:border-fire-orange/50'}`}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileRef.current?.click()
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Subir fotos"
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(Array.from(e.target.files))} />
        <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-fire-red' : 'text-muted'}`} />
        <p className="text-silver font-medium mb-1">{uploading ? 'Subiendo...' : 'Arrastra fotos aquí o haz clic para seleccionar'}</p>
        <p className="text-muted text-xs">JPG, PNG, WEBP — múltiples archivos</p>
        <div className="mt-4 max-w-xs mx-auto">
          <input
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="Nombre del evento (opcional)"
            className="w-full px-3 py-2 bg-dark-ash border border-dark-ash rounded-lg text-white text-sm focus:border-fire-red outline-none text-center"
          />
        </div>
      </div>

      {/* Photos Grid */}
      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-dark-ash hover:border-fire-orange/30 transition-all">
              <img
                src={`/api/gallery/files/${photo.filename}`}
                alt={photo.alt || ''}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-dark-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {photo.event && <span className="text-fire-gold font-heading text-sm tracking-wider">{photo.event}</span>}
                <button type="button" onClick={() => deletePhoto(photo.id)} className="p-2 bg-fire-red/80 rounded-lg hover:bg-fire-red transition-all">
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              No hay fotos aún. ¡Sube la primera!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
