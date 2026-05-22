import { useState, useEffect, useRef } from 'react'
import { useApi } from '../../hooks/useAuth'
import { Upload, Trash2, Video, X } from 'lucide-react'

export default function VideosAdmin() {
  const { apiFetch } = useApi()
  const [videos, setVideos] = useState([])
  const [figures, setFigures] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [figureId, setFigureId] = useState('')
  const videoRef = useRef()
  const thumbRef = useRef()

  const load = async () => {
    try {
      const [vRes, fRes] = await Promise.all([
        apiFetch('/api/admin/videos/'),
        apiFetch('/api/figures/'),
      ])
      setVideos(await vRes.json())
      setFigures(await fRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const uploadVideo = async () => {
    if (!videoRef.current?.files[0] || !title) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', videoRef.current.files[0])
    fd.append('title', title)
    if (description) fd.append('description', description)
    if (figureId) fd.append('figure_id', figureId)
    if (thumbRef.current?.files[0]) fd.append('thumbnail', thumbRef.current.files[0])
    try {
      await apiFetch('/api/admin/videos/', { method: 'POST', body: fd })
      setTitle('')
      setDescription('')
      setFigureId('')
      load()
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  const deleteVideo = async (id) => {
    if (!confirm('¿Eliminar este video?')) return
    await apiFetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">VIDEOS</span></h1>
        <p className="text-muted text-sm mt-1">Sube videos de figuras y sociales</p>
      </div>

      {/* Upload Form */}
      <div className="bg-dark-charcoal rounded-2xl p-4 sm:p-6 border border-dark-ash mb-8 space-y-4">
        <h3 className="font-heading text-lg tracking-wider text-fire-orange">SUBIR VIDEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-silver text-sm mb-1">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white focus:border-fire-red outline-none" placeholder="Ej: Dile que no — Tutorial" />
          </div>
          <div>
            <label className="block text-silver text-sm mb-1">Figura asociada</label>
            <select value={figureId} onChange={(e) => setFigureId(e.target.value)} className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white focus:border-fire-red outline-none">
              <option value="">Ninguna</option>
              {figures.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.level})</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-silver text-sm mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white focus:border-fire-red outline-none resize-none" />
          </div>
          <div>
            <label className="block text-silver text-sm mb-1">Archivo de video *</label>
            <input ref={videoRef} type="file" accept="video/*" className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-silver text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fire-red/20 file:text-fire-red file:font-semibold file:cursor-pointer" />
          </div>
          <div>
            <label className="block text-silver text-sm mb-1">Thumbnail (opcional)</label>
            <input ref={thumbRef} type="file" accept="image/*" className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-silver text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fire-orange/20 file:text-fire-orange file:font-semibold file:cursor-pointer" />
          </div>
        </div>
        <button type="button" onClick={uploadVideo} disabled={uploading || !title} className="w-full sm:w-auto px-6 py-3 bg-fire-red text-white font-heading tracking-wider rounded-xl hover:bg-fire-orange transition-all disabled:opacity-50 fire-glow-hover">
          {uploading ? 'Subiendo...' : 'SUBIR VIDEO'}
        </button>
      </div>

      {/* Videos Table */}
      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="bg-dark-charcoal rounded-xl border border-dark-ash overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-dark-ash text-left">
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted">Título</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted hidden md:table-cell">Figura</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted hidden lg:table-cell">Archivo</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((vid) => (
                <tr key={vid.id} className="border-b border-dark-ash/50 hover:bg-dark-ash/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {vid.thumbnail_filename && (
                        <img src={`/api/videos/thumbnails/${vid.thumbnail_filename}`} className="w-12 h-8 rounded object-cover" alt="" />
                      )}
                      <span className="text-white font-medium">{vid.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-silver text-sm hidden md:table-cell">
                    {vid.figure_id ? figures.find(f => f.id === vid.figure_id)?.name || `#${vid.figure_id}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-silver text-sm truncate max-w-[200px] hidden lg:table-cell">{vid.filename}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => deleteVideo(vid.id)} className="p-2 text-silver hover:text-fire-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-muted">No hay videos aún. ¡Sube el primero!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
