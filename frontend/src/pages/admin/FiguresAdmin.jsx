import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Plus, Pencil, Trash2, X, Video, Play, Clock } from 'lucide-react'

const emptyForm = { name: '', level: 'basico' }

const levelConfig = {
  basico: { label: 'Básico', color: 'bg-fire-red text-white', ring: 'ring-fire-red/30' },
  intermedio: { label: 'Intermedio', color: 'bg-fire-orange text-white', ring: 'ring-fire-orange/30' },
  avanzado: { label: 'Avanzado', color: 'bg-fire-gold text-dark-obsidian', ring: 'ring-fire-gold/30' },
}

export default function FiguresAdmin() {
  const { apiFetch, authHeaders } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [figures, setFigures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState(null)
  const videoInputRef = useRef(null)

  const handleAuthError = () => { logout(); navigate('/admin/login') }

  const load = async () => {
    try {
      const res = await apiFetch('/api/admin/figures/')
      if (!res.ok) {
        if (res.status === 401) { handleAuthError(); return }
        throw new Error(`Error ${res.status}`)
      }
      const data = await res.json()
      setFigures(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetFileInput = () => { if (videoInputRef.current) videoInputRef.current.value = '' }

  const openNew = () => {
    setEditing(null); setForm(emptyForm); setVideoFile(null); setUploadProgress(0)
    resetFileInput(); setShowModal(true)
  }

  const openEdit = (fig) => {
    setEditing(fig); setForm({ name: fig.name, level: fig.level }); setVideoFile(null); setUploadProgress(0)
    resetFileInput(); setShowModal(true)
  }

  const uploadWithProgress = (url, method, body) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      Object.entries(authHeaders || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v))
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)) }
      xhr.upload.onloadend = () => setUploadProgress(99)
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100); resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null)
        } else {
          let msg = `Error ${xhr.status}`; try { msg = JSON.parse(xhr.responseText).detail || msg } catch {} 
          reject(new Error(msg))
        }
      }
      xhr.onerror = () => reject(new Error('Error de conexión'))
      xhr.timeout = 300000; xhr.send(body)
    })
  }

  const save = async () => {
    setSaving(true); setUploadProgress(videoFile ? 1 : 0)
    try {
      const url = editing ? `/api/admin/figures/${editing.id}` : '/api/admin/figures/'
      const fd = new FormData()
      fd.append('name', form.name); fd.append('level', form.level)
      if (videoFile) fd.append('video', videoFile)
      await uploadWithProgress(url, editing ? 'PUT' : 'POST', fd)
      setShowModal(false); await load()
    } catch (e) { console.error(e); alert('Error al guardar.') }
    setSaving(false); setUploadProgress(0)
  }

  const deleteFig = async (id) => {
    if (!confirm('¿Eliminar esta figura y su video?')) return
    await apiFetch(`/api/admin/figures/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">FIGURAS</span></h1>
          <p className="text-muted text-sm mt-1">{figures.length} figuras registradas</p>
        </div>
        <button type="button" onClick={openNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-fire-red text-white font-semibold rounded-xl hover:bg-fire-orange transition-all fire-glow-hover">
          <Plus className="w-5 h-5" /> Nueva Figura
        </button>
      </div>

      {/* Figures Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 rounded-full border-4 border-fire-red/30 border-t-fire-red animate-spin" />
        </div>
      ) : figures.length === 0 ? (
        <div className="py-16 text-center text-muted border-2 border-dashed border-dark-ash rounded-2xl">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No hay figuras aún</p>
          <button type="button" onClick={openNew} className="mt-4 text-fire-gold hover:text-fire-orange text-sm font-semibold">
            + Agregar primera figura
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {figures.map((fig) => {
            const level = levelConfig[fig.level] || levelConfig.basico
            return (
              <div key={fig.id} className="bg-dark-charcoal rounded-2xl border border-dark-ash hover:border-fire-orange/30 transition-all overflow-hidden group">
                {/* Video thumbnail */}
                <div className="relative aspect-video bg-dark-ash overflow-hidden">
                  {fig.thumbnail_url ? (
                    <img src={fig.thumbnail_url} alt={fig.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle,rgba(230,57,70,.1),#1A1A2E)]">
                      <Play className="w-10 h-10 text-fire-gold/40" />
                    </div>
                  )}
                  {/* Level badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${level.color}`}>
                      {level.label}
                    </span>
                  </div>
                  {/* Duration badge */}
                  {fig.duration && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-dark-obsidian/80 backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-silver" />
                      <span className="text-[11px] text-silver font-mono">{fig.duration}</span>
                    </div>
                  )}
                </div>

                {/* Info + Actions */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <h3 className="font-heading text-lg tracking-wider text-white truncate flex-1">{fig.name}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => openEdit(fig)}
                      className="p-2 rounded-lg text-silver hover:text-fire-orange hover:bg-dark-ash transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => deleteFig(fig.id)}
                      className="p-2 rounded-lg text-silver hover:text-fire-red hover:bg-fire-red/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-dark-obsidian/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-dark-charcoal rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 border border-dark-ash w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl tracking-wider text-fire-gradient">
                {editing ? 'EDITAR FIGURA' : 'NUEVA FIGURA'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} disabled={saving} className="p-2 rounded-lg text-muted hover:text-white hover:bg-dark-ash transition-all disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-silver text-sm mb-2 font-medium">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-xl text-white focus:border-fire-red outline-none transition-colors"
                  placeholder="Ej: Kentucky" />
              </div>

              <div>
                <label className="block text-silver text-sm mb-2 font-medium">Nivel</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(levelConfig).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => setForm({ ...form, level: key })}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        form.level === key
                          ? `${cfg.color} ring-2 ${cfg.ring}`
                          : 'bg-dark-ash text-silver hover:text-white'
                      }`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-fire-red/20 bg-fire-red/5 p-4">
                <label className="block text-silver text-sm mb-2 font-medium">Video</label>
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.avi"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-silver file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fire-red/20 file:text-fire-red file:font-semibold file:cursor-pointer" />
                <p className="text-muted text-xs mt-2">
                  {editing?.video_filename && !videoFile ? 'Ya hay un video. Subir otro lo reemplaza.' : 'MP4, WEBM, MOV. Duración automática.'}
                </p>
              </div>

              {saving && (
                <div className="rounded-xl border border-fire-orange/30 bg-fire-orange/10 p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-silver">Subiendo...</span>
                    <span className="font-heading text-fire-gold text-lg">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-dark-ash overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-fire-red via-fire-orange to-fire-gold transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                className="flex-1 py-3 border border-dark-ash text-silver rounded-xl hover:bg-dark-ash transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={save} disabled={saving || !form.name || (!editing && !videoFile)}
                className="flex-1 py-3 bg-fire-red text-white font-heading tracking-wider rounded-xl hover:bg-fire-orange transition-all disabled:opacity-50 fire-glow-hover">
                {saving ? `SUBIENDO ${uploadProgress}%` : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
