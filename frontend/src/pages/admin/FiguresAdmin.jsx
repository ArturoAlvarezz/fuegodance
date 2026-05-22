import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Plus, Pencil, Trash2, X, Video } from 'lucide-react'

const emptyForm = { name: '', level: 'basico' }

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

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

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

  const resetFileInput = () => {
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setVideoFile(null)
    setUploadProgress(0)
    resetFileInput()
    setShowModal(true)
  }

  const openEdit = (fig) => {
    setEditing(fig)
    setForm({ name: fig.name, level: fig.level })
    setVideoFile(null)
    setUploadProgress(0)
    resetFileInput()
    setShowModal(true)
  }

  const uploadWithProgress = (url, method, body) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      Object.entries(authHeaders || {}).forEach(([key, value]) => xhr.setRequestHeader(key, value))

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(Math.max(1, Math.min(percent, 100)))
      }

          xhr.upload.onloadend = () => {
        // Upload finished, now waiting for server response (ffprobe etc)
        setUploadProgress(99)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100)
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : null)
        } else if (xhr.status === 413) {
          reject(new Error('El archivo es demasiado grande (máx 200MB)'))
        } else {
          let msg = `Error del servidor (${xhr.status})`
          try { msg = JSON.parse(xhr.responseText).detail || msg } catch {}
          reject(new Error(msg))
        }
      }
      xhr.onerror = () => reject(new Error('Error de conexión. Revisa tu internet e intenta de nuevo.'))
      xhr.ontimeout = () => reject(new Error('La subida tardó demasiado. Intenta de nuevo.'))
      xhr.timeout = 300000 // 5 min timeout
      xhr.send(body)
    })
  }

  const save = async () => {
    setSaving(true)
    setUploadProgress(videoFile ? 1 : 0)
    try {
      const url = editing ? `/api/admin/figures/${editing.id}` : '/api/admin/figures/'
      const method = editing ? 'PUT' : 'POST'
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('level', form.level)
      if (videoFile) fd.append('video', videoFile)

      await uploadWithProgress(url, method, fd)
      setShowModal(false)
      await load()
    } catch (e) {
      console.error(e)
      alert('No se pudo guardar la figura. Revisa el formato del video.')
    }
    setSaving(false)
    setUploadProgress(0)
  }

  const deleteFig = async (id) => {
    if (!confirm('¿Eliminar esta figura y su video asociado?')) return
    await apiFetch(`/api/admin/figures/${id}`, { method: 'DELETE' })
    load()
  }

  const levelColors = { basico: 'bg-fire-red', intermedio: 'bg-fire-orange', avanzado: 'bg-fire-gold text-dark-obsidian' }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wider"><span className="text-fire-gradient">FIGURAS</span></h1>
          <p className="text-muted text-sm mt-1">Crea figuras y sube el video al servidor. La duración se calcula automáticamente.</p>
        </div>
        <button type="button" onClick={openNew} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-fire-red text-white font-semibold rounded-xl hover:bg-fire-orange transition-all fire-glow-hover">
          <Plus className="w-5 h-5" /> Nueva Figura
        </button>
      </div>

      {loading ? <p className="text-muted">Cargando...</p> : (
        <div className="bg-dark-charcoal rounded-xl border border-dark-ash overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-dark-ash text-left">
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted">Nombre</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted">Nivel</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted hidden md:table-cell">Duración auto</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted">Video local</th>
                <th className="px-6 py-4 font-heading text-sm tracking-wider text-muted text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((fig) => (
                <tr key={fig.id} className="border-b border-dark-ash/50 hover:bg-dark-ash/20 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{fig.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[fig.level] || 'bg-dark-ash'}`}>{fig.level}</span>
                  </td>
                  <td className="px-6 py-4 text-silver text-sm hidden md:table-cell">{fig.duration || '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    {fig.video_filename ? (
                      <span className="inline-flex items-center gap-2 text-fire-gold"><Video className="w-4 h-4" /> Subido</span>
                    ) : (
                      <span className="text-muted">Sin video</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button type="button" onClick={() => openEdit(fig)} className="p-2 text-silver hover:text-fire-orange transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button type="button" onClick={() => deleteFig(fig.id)} className="p-2 text-silver hover:text-fire-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {figures.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted">No hay figuras aún. ¡Agrega la primera con su video!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-dark-obsidian/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-dark-charcoal rounded-t-3xl sm:rounded-xl p-5 sm:p-8 border border-dark-ash w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl tracking-wider text-fire-gradient">{editing ? 'EDITAR FIGURA' : 'NUEVA FIGURA'}</h2>
              <button type="button" onClick={() => setShowModal(false)} disabled={saving} className="text-muted hover:text-white disabled:opacity-50"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-silver text-sm mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white focus:border-fire-red outline-none" />
              </div>
              <div>
                <label className="block text-silver text-sm mb-1">Nivel</label>
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white focus:border-fire-red outline-none">
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div className="rounded-xl border border-fire-red/20 bg-fire-red/5 p-4">
                <label className="block text-silver text-sm mb-2">Video de la figura</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.avi"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-silver file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fire-red/20 file:text-fire-red file:font-semibold file:cursor-pointer"
                />
                <p className="text-muted text-xs mt-2">Formatos: MP4, WEBM, MOV, AVI. La duración se calcula automáticamente desde el video. {editing?.video_filename && !videoFile ? 'Ya hay un video; si subes otro se reemplaza.' : ''}</p>
              </div>
              {saving && (
                <div className="rounded-xl border border-fire-orange/30 bg-fire-orange/10 p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-silver">Subiendo video...</span>
                    <span className="font-heading text-fire-gold text-lg">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-dark-ash overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-fire-red via-fire-orange to-fire-gold transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-muted text-xs mt-2">No cierres esta ventana hasta que llegue al 100%.</p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} disabled={saving} className="flex-1 py-3 border border-dark-ash text-silver rounded-lg hover:bg-dark-ash transition-all disabled:opacity-50">Cancelar</button>
              <button type="button" onClick={save} disabled={saving || !form.name || (!editing && !videoFile)} className="flex-1 py-3 bg-fire-red text-white font-heading tracking-wider rounded-xl hover:bg-fire-orange transition-all disabled:opacity-50 fire-glow-hover">
                {saving ? `SUBIENDO ${uploadProgress}%` : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
