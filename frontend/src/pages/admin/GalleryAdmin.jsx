import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Upload, Trash2, Image, X, FolderOpen, Edit3, Check } from 'lucide-react'

export default function GalleryAdmin() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadAlbum, setUploadAlbum] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editAlbum, setEditAlbum] = useState('')
  const [filterAlbum, setFilterAlbum] = useState('__all__')
  const fileRef = useRef()

  const handleAuthError = () => { logout(); navigate('/admin/login') }

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

  const albums = useMemo(() => {
    const set = new Set(photos.map(p => p.event).filter(Boolean))
    return ['__all__', '__none__', ...Array.from(set).sort()]
  }, [photos])

  const filteredPhotos = useMemo(() => {
    if (filterAlbum === '__all__') return photos
    if (filterAlbum === '__none__') return photos.filter(p => !p.event)
    return photos.filter(p => p.event === filterAlbum)
  }, [photos, filterAlbum])

  const albumCounts = useMemo(() => {
    const c = { __all__: photos.length, __none__: 0 }
    photos.forEach(p => {
      if (!p.event) c.__none__++
      else c[p.event] = (c[p.event] || 0) + 1
    })
    return c
  }, [photos])

  const uploadFiles = async (files) => {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      if (uploadAlbum.trim()) fd.append('event', uploadAlbum.trim())
      await apiFetch('/api/admin/gallery/', { method: 'POST', body: fd })
    }
    setUploadAlbum('')
    setUploading(false)
    load()
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(Array.from(e.dataTransfer.files))
  }

  const saveAlbum = async (photoId) => {
    const fd = new FormData()
    fd.append('event', editAlbum.trim())
    await apiFetch(`/api/admin/gallery/${photoId}`, { method: 'PUT', body: fd })
    setEditingId(null)
    load()
  }

  const deletePhoto = async (id) => {
    if (!confirm('¿Eliminar esta foto?')) return
    await apiFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    load()
  }

  const albumLabel = (k) => k === '__all__' ? 'Todas' : k === '__none__' ? 'Sin álbum' : k

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">GALERÍA</span></h1>
          <p className="text-muted text-sm mt-1">{photos.length} fotos · {albums.length - 2} álbumes</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 mb-8 transition-all cursor-pointer ${dragOver ? 'border-fire-red bg-fire-red/5' : 'border-dark-ash hover:border-fire-orange/50'}`}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
        tabIndex={0}
        role="button"
        aria-label="Subir fotos"
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(Array.from(e.target.files))} />
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Upload className={`w-8 h-8 flex-shrink-0 ${dragOver ? 'text-fire-red' : 'text-muted'}`} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-silver font-medium">{uploading ? 'Subiendo...' : 'Arrastra fotos o haz clic'}</p>
            <p className="text-muted text-xs mt-1">JPG, PNG, WEBP — múltiples archivos</p>
          </div>
          <div className="w-full sm:w-56" onClick={(e) => e.stopPropagation()}>
            <input
              value={uploadAlbum}
              onChange={(e) => setUploadAlbum(e.target.value)}
              placeholder="Álbum (opcional)"
              className="w-full px-3 py-2 bg-dark-ash border border-dark-ash rounded-lg text-white text-sm focus:border-fire-red outline-none"
              list="album-suggestions"
            />
            <datalist id="album-suggestions">
              {albums.filter(a => !a.startsWith('__')).map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
        </div>
      </div>

      {/* Album filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FolderOpen className="w-4 h-4 text-muted" />
        {albums.map((album) => (
          <button key={album} type="button" onClick={() => setFilterAlbum(album)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterAlbum === album ? 'bg-fire-red text-white fire-glow' : 'bg-dark-ash text-silver hover:text-fire-orange'}`}>
            {albumLabel(album)} <span className="opacity-60">({albumCounts[album] || 0})</span>
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-dark-ash hover:border-fire-orange/30 transition-all bg-dark-charcoal">
              <div className="relative aspect-square overflow-hidden">
                <img src={`/api/gallery/files/${photo.filename}`} alt={photo.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-dark-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => deletePhoto(photo.id)} className="p-3 bg-fire-red/90 rounded-xl hover:bg-fire-red transition-all">
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-dark-ash/50">
                {editingId === photo.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={editAlbum}
                      onChange={(e) => setEditAlbum(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveAlbum(photo.id); if (e.key === 'Escape') setEditingId(null) }}
                      className="flex-1 px-2 py-1 bg-dark-ash border border-fire-red/40 rounded text-white text-xs focus:border-fire-red outline-none"
                      autoFocus
                    />
                    <button type="button" onClick={() => saveAlbum(photo.id)} className="p-1 text-fire-gold hover:text-white"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditingId(null)} className="p-1 text-muted hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setEditingId(photo.id); setEditAlbum(photo.event || '') }}
                    className="w-full flex items-center gap-1.5 text-left group/album"
                  >
                    {photo.event ? (
                      <span className="text-xs text-fire-gold truncate flex-1">{photo.event}</span>
                    ) : (
                      <span className="text-xs text-muted truncate flex-1 italic">Sin álbum</span>
                    )}
                    <Edit3 className="w-3 h-3 text-muted opacity-0 group-hover/album:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredPhotos.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
              {filterAlbum === '__all__' ? 'No hay fotos aún.' : 'No hay fotos en este álbum.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
